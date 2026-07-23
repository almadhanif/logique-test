import { isAuthenticated } from "@/lib/auth";
import { aiChat, isAiConfigured } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import type { ListingAnalysis } from "@/lib/types";

const SYSTEM = `You are an expert automotive market analyst for the Indonesian used-car market. Prices are in Indonesian Rupiah (IDR), where 1 juta = 1,000,000 and 1 miliar = 1,000,000,000. A typical running used car in Indonesia costs between roughly Rp 50,000,000 (50 juta) and Rp 800,000,000 (800 juta); most ordinary used cars are in the Rp 100–400 juta range.

You MUST reason about whether the LISTED PRICE is realistic for this exact car in the Indonesian market, using your knowledge of typical prices by brand, model, segment, age and mileage. Do NOT assume the listed price is correct. If the listed price is implausible — for example off by an order of magnitude (e.g. a running 2020 MPV listed for only a few juta), suspiciously cheap for a running car, or far above market — say so plainly in the pricing note, mark the pricing label as "Underpriced"/"Anomalous" or "Overpriced" accordingly, and base your SUGGESTED price on realistic market value, NOT on the listed price.

You respond ONLY with valid JSON — no preamble, no markdown, no backticks, no explanation.`;

function buildUserPrompt(input: {
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  color?: string;
  description?: string;
}): string {
  return `Analyze this used-car listing and return JSON with EXACTLY this structure:
{
  "healthScore": <integer 0-100>,
  "priceRange": {
    "min": <number, same currency scale as listed price>,
    "max": <number, same currency scale as listed price>,
    "rationale": "<1 sentence why>"
  },
  "breakdown": {
    "pricing":      { "score": <0-25>, "label": "<Competitive|Fair|High|Underpriced>", "note": "<1 sentence>" },
    "description":  { "score": <0-25>, "label": "<Detailed|Adequate|Sparse|Missing>",  "note": "<1 sentence>" },
    "completeness": { "score": <0-25>, "label": "<Complete|Partial|Incomplete>",        "note": "<1 sentence>" },
    "appeal":       { "score": <0-25>, "label": "<Strong|Average|Weak>",               "note": "<1 sentence>" }
  },
  "suggestions": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"],
  "suggestedFields": {
    "price": <number, the optimal competitive listing price in IDR>,
    "model": "<model name, properly capitalized and formatted>",
    "color": "<standardized color name>",
    "adCopy": "<polished buyer-facing ad copy, 3-4 sentences, enthusiastic but honest, do NOT invent details not provided>",
    "description": "<the admin's notes cleaned up and made more readable>"
  }
}

Car listing details:
Make: ${input.make}
Model: ${input.model}
Year: ${input.year}
Mileage: ${input.mileage.toLocaleString()} km
Listed Price: ${formatPrice(input.price)}  (raw: ${input.price.toLocaleString("en-US")} IDR)
Color: ${input.color || "Not specified"}
Description: "${input.description || "None provided"}"

Indonesian used-car market reference (typical asking prices, IDR):
- City hatchbacks / LCGC (e.g. Honda Brio, Toyota Agya): ~Rp 100–220 juta
- Compact sedans (e.g. Toyota Camry, Honda Civic): ~Rp 200–450 juta
- MPVs / 7-seaters (e.g. Nissan Serena, Toyota Avanza, Suzuki Ertiga): ~Rp 180–400 juta
- Compact SUVs (e.g. Daihatsu Terios, Wuling Almaz): ~Rp 180–350 juta
- Body-on-frame SUVs / 4x4 (e.g. Mitsubishi Pajero Sport): ~Rp 300–500 juta
- EVs / premium (e.g. Hyundai Ioniq 5): ~Rp 450–800 juta
Adjust down for higher mileage and older age, up for low mileage / desirable spec.

Scoring guide:
- healthScore = sum of all four breakdown scores.
- Pricing: judge the listed price against realistic Indonesian market value for
  THIS make/model/year/mileage using the reference above. If the price is off by
  roughly an order of magnitude or otherwise implausible, score pricing low,
  label it "Underpriced"/"Anomalous" or "Overpriced", explain in the note, and
  set the suggested price range to the realistic market value — NOT a small
  delta around the listed price.
- priceRange.min / max must reflect realistic market value in IDR (same scale as
  the listed price). Only narrow around the listed price when the listed price
  is itself realistic.
- Description: longer + more specific = higher score; empty = 0.
- Completeness: penalise missing color, missing description, no photos mentioned.
- Appeal: consider year × mileage combination and brand reputation.
- suggestedFields: your best recommendation for each field. price = the realistic
  competitive asking price in IDR; adCopy = compelling but honest copy from the
  provided info; description = the admin's notes cleaned up; model/color standardized.`;
}

// Ask the model (via OpenRouter) for the analysis JSON. Throws on
// empty/completely-unparseable text.
async function requestAnalysisJson(userPrompt: string): Promise<ListingAnalysis> {
  const raw = await aiChat({
    system: SYSTEM,
    user: userPrompt,
    maxTokens: 2048,
  });

  // Strip markdown fences if the model added them anyway.
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return normalizeAnalysis(parsed);
}

// POST /api/ai/analyze-listing — admin only.
// Returns a marketability health score + suggested price range (one AI call),
// and persists the result to the car when a carId is supplied (edit mode).
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const num = (v: unknown) => {
    const n = typeof v === "string" ? Number(v) : v;
    return typeof n === "number" && Number.isFinite(n) ? n : undefined;
  };

  const make = str(body.make);
  const model = str(body.model);
  const year = num(body.year);
  const mileage = num(body.mileage);
  const price = num(body.price);
  const color = str(body.color) || undefined;
  const description = str(body.description) || undefined;
  const carId = str(body.carId) || undefined;

  // Validate input BEFORE checking the AI key — a malformed request is a client
  // error regardless of whether the service is configured.
  const missing = [];
  if (!make) missing.push("make");
  if (!model) missing.push("model");
  if (year === undefined) missing.push("year");
  if (mileage === undefined) missing.push("mileage");
  if (price === undefined) missing.push("price");
  if (missing.length) {
    return Response.json(
      { error: `Missing or invalid required fields: ${missing.join(", ")}` },
      { status: 422 },
    );
  }

  const userPrompt = buildUserPrompt({
    make,
    model,
    year: year!,
    mileage: mileage!,
    price: price!,
    color,
    description,
  });

  if (!isAiConfigured()) {
    return Response.json(
      {
        error:
          "AI feature is not configured. Set OPENROUTER_API_KEY in .env and restart the server.",
      },
      { status: 503 },
    );
  }

  let analysis: ListingAnalysis;
  try {
    try {
      analysis = await requestAnalysisJson(userPrompt);
    } catch {
      // Retry once with a stricter prompt before giving up.
      const stricter = `${userPrompt}\n\nIMPORTANT: Output ONLY the raw JSON object. No prose, no markdown fences, no leading or trailing text.`;
      analysis = await requestAnalysisJson(stricter);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[analyze-listing] failed:", message);
    return Response.json(
      { error: "Analysis unavailable, please try again" },
      { status: 500 },
    );
  }

  // Persist to the car row when editing an existing listing.
  if (carId) {
    try {
      await prisma.car.update({
        where: { id: carId },
        data: {
          healthScore: analysis.healthScore,
          suggestedPriceMin: analysis.priceRange.min,
          suggestedPriceMax: analysis.priceRange.max,
          analysisSuggestions: JSON.stringify(analysis.suggestions),
          lastAnalyzedAt: new Date(),
        },
      });
    } catch {
      // Persistence failure shouldn't fail the whole request — the analysis is
      // still returned to the form.
    }
  }

  return Response.json({ analysis });
}

// ---- helpers -------------------------------------------------------------

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

function strOr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function breakdownPart(v: unknown, fallbackLabel: string, maxScore: number) {
  const obj = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    score: clamp(obj.score, 0, maxScore, 0),
    label: strOr(obj.label, fallbackLabel),
    note: strOr(obj.note, "—"),
  };
}

// Defensively shape whatever JSON the model returned into a ListingAnalysis.
function normalizeAnalysis(parsed: unknown): ListingAnalysis {
  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const breakdownSrc = (obj.breakdown && typeof obj.breakdown === "object"
    ? obj.breakdown
    : {}) as Record<string, unknown>;
  const priceSrc = (obj.priceRange && typeof obj.priceRange === "object"
    ? obj.priceRange
    : {}) as Record<string, unknown>;

  const breakdown = {
    pricing: breakdownPart(breakdownSrc.pricing, "Fair", 25),
    description: breakdownPart(breakdownSrc.description, "Adequate", 25),
    completeness: breakdownPart(breakdownSrc.completeness, "Partial", 25),
    appeal: breakdownPart(breakdownSrc.appeal, "Average", 25),
  };

  const sum =
    breakdown.pricing.score +
    breakdown.description.score +
    breakdown.completeness.score +
    breakdown.appeal.score;

  const suggestions = Array.isArray(obj.suggestions)
    ? obj.suggestions.filter((s): s is string => typeof s === "string").slice(0, 5)
    : [];

  // Extract AI-suggested field values (defensively — the model might omit them).
  const sfSrc = (obj.suggestedFields && typeof obj.suggestedFields === "object"
    ? obj.suggestedFields
    : {}) as Record<string, unknown>;
  const suggestedFields: import("@/lib/types").SuggestedFields = {};
  if (sfSrc.price !== undefined) {
    const p = typeof sfSrc.price === "number" ? sfSrc.price : Number(sfSrc.price);
    if (Number.isFinite(p) && p > 0) suggestedFields.price = p;
  }
  if (typeof sfSrc.model === "string" && sfSrc.model.trim()) suggestedFields.model = sfSrc.model.trim();
  if (typeof sfSrc.color === "string" && sfSrc.color.trim()) suggestedFields.color = sfSrc.color.trim();
  if (typeof sfSrc.adCopy === "string" && sfSrc.adCopy.trim()) suggestedFields.adCopy = sfSrc.adCopy.trim();
  if (typeof sfSrc.description === "string" && sfSrc.description.trim()) suggestedFields.description = sfSrc.description.trim();

  return {
    healthScore: clamp(obj.healthScore ?? sum, 0, 100, sum),
    priceRange: {
      min: clamp(priceSrc.min, 0, Number.MAX_SAFE_INTEGER, 0),
      max: clamp(priceSrc.max, 0, Number.MAX_SAFE_INTEGER, 0),
      rationale: strOr(priceSrc.rationale, "—"),
    },
    breakdown,
    suggestions,
    suggestedFields,
  };
}
