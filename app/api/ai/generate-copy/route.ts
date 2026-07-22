import { isAuthenticated } from "@/lib/auth";
import { aiChat, isAiConfigured } from "@/lib/ai";
import { formatPrice } from "@/lib/format";

// POST /api/ai/generate-copy — admin only.
// Turns raw admin notes into polished, buyer-facing ad copy via OpenRouter.
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return Response.json(
      {
        error:
          "AI feature is not configured. Set OPENROUTER_API_KEY in .env and restart the server.",
      },
      { status: 503 },
    );
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
  const color = str(body.color);
  const description = str(body.description);

  if (!make || !model || year === undefined) {
    return Response.json(
      { error: "make, model and year are required to generate copy" },
      { status: 422 },
    );
  }

  const prompt = `You are an expert automotive copywriter for a used-car marketplace.

Given this raw listing info from an admin, write polished, buyer-facing ad copy.
The copy should be enthusiastic but honest, highlight key selling points, and be
3–4 sentences max. Do NOT make up details not provided.

Make: ${make}
Model: ${model}
Year: ${year}
Mileage: ${(mileage ?? 0).toLocaleString()} km
Price: ${price !== undefined ? formatPrice(price) : "Not specified"}
Color: ${color || "Not specified"}
Admin notes: ${description || "None"}

Write only the ad copy, no preamble or labels.`;

  try {
    const adCopy = await aiChat({ user: prompt, maxTokens: 1024 });

    if (!adCopy) {
      return Response.json(
        { error: "AI returned an empty response. Try again." },
        { status: 502 },
      );
    }

    return Response.json({ adCopy });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      { error: `AI service error: ${message}` },
      { status: 502 },
    );
  }
}
