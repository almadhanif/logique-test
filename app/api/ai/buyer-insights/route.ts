import { prisma } from "@/lib/prisma";
import { aiChat, isAiConfigured } from "@/lib/ai";
import type { BuyerInsight, DealVerdict } from "@/lib/types";

const VERDICTS: DealVerdict[] = ["GREAT_DEAL", "GOOD_DEAL", "FAIR_DEAL", "OVERPRICED"];

const SYSTEM = `Kamu adalah konsultan pembelian mobil bekas untuk pembeli di Indonesia.
Tugasmu membantu pembeli menilai apakah sebuah listing layak dibeli.
Balas HANYA dengan JSON valid — tanpa penjelasan, tanpa markdown, tanpa backtick.
Tulis semua teks dalam Bahasa Indonesia yang natural dan mudah dipahami orang awam.`;

// POST /api/ai/buyer-insights — public. Generates (or returns cached) buyer AI
// insights for a published listing: deal verdict, price assessment, negotiation
// tip, and a 5-item inspection checklist — all in Bahasa Indonesia.
export async function POST(request: Request) {
  let body: { carId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const carId = typeof body.carId === "string" ? body.carId.trim() : "";
  if (!carId) {
    return Response.json({ error: "carId is required" }, { status: 422 });
  }

  const car = await prisma.car.findUnique({
    where: { id: carId },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      mileage: true,
      price: true,
      color: true,
      description: true,
      healthScore: true,
      suggestedPriceMin: true,
      suggestedPriceMax: true,
      buyerInsight: true,
      status: true,
    },
  });

  // Only published cars are publicly accessible.
  if (!car || car.status !== "PUBLISHED") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Return cached insight if it exists (instant for repeat visitors).
  if (car.buyerInsight) {
    try {
      const cached = JSON.parse(car.buyerInsight) as BuyerInsight;
      return Response.json({ insight: cached, fromCache: true });
    } catch {
      // Corrupt cache — fall through to regenerate.
    }
  }

  if (!isAiConfigured()) {
    return Response.json(
      { error: "Fitur AI belum dikonfigurasi." },
      { status: 503 },
    );
  }

  // Build the prompt, including admin analysis data if available.
  const hasAdminAnalysis =
    car.healthScore != null && car.suggestedPriceMin != null;
  const adminContext = hasAdminAnalysis
    ? `Data analisis internal (dari tim admin):
- Health Score: ${car.healthScore}/100
- Estimasi harga pasar: Rp ${car.suggestedPriceMin?.toLocaleString("id-ID")} – Rp ${car.suggestedPriceMax?.toLocaleString("id-ID")}
Gunakan data ini sebagai referensi utama penilaian harga.`
    : `Tidak ada data analisis admin tersedia. Gunakan pengetahuan pasar umum.`;

  const userPrompt = `Analisis listing mobil bekas ini dari sudut pandang PEMBELI dan return JSON:

{
  "dealVerdict": "GREAT_DEAL" | "GOOD_DEAL" | "FAIR_DEAL" | "OVERPRICED",
  "verdictLabel": "<label singkat, maks 4 kata, contoh: 'Harga Kompetitif'>",
  "dealExplanation": "<2-3 kalimat menjelaskan verdict — sebutkan kondisi mobil dan posisi harga vs pasar>",
  "priceAssessment": "<1 kalimat ringkas penilaian harga vs pasar>",
  "negotiationTip": "<1 kalimat tips negosiasi yang actionable untuk pembeli>",
  "inspectionChecklist": [
    { "item": "<apa yang dicek — kalimat imperatif singkat>", "why": "<1 kalimat kenapa penting SPESIFIK untuk mobil ini>" },
    ... (5 item total)
  ]
}

Data listing:
- Mobil: ${car.year} ${car.make} ${car.model}
- Warna: ${car.color ?? "Tidak disebutkan"}
- Kilometer: ${car.mileage.toLocaleString("id-ID")} km
- Harga: Rp ${car.price.toLocaleString("id-ID")}
- Deskripsi penjual: "${car.description ?? "Tidak ada deskripsi"}"

${adminContext}

Panduan checklist:
- 5 item harus SPESIFIK untuk ${car.make} ${car.model} tahun ${car.year} dengan ${car.mileage.toLocaleString("id-ID")} km
- Sebutkan nama komponen/sistem yang konkret, bukan generik seperti "cek kondisi umum"
- Fokus pada titik lemah umum model ini di rentang kilometer ini
- Sertakan satu item tentang riwayat servis/dokumen

Panduan verdict:
- GREAT_DEAL: harga di bawah estimasi pasar, kondisi bagus
- GOOD_DEAL: harga kompetitif, layak dipertimbangkan
- FAIR_DEAL: harga wajar, tidak murah tapi tidak mahal
- OVERPRICED: harga di atas estimasi pasar`;

  let insight: BuyerInsight;
  try {
    const raw = await aiChat({ system: SYSTEM, user: userPrompt, maxTokens: 1500 });
    const cleaned = raw
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    insight = normalizeInsight(parsed);
  } catch {
    return Response.json(
      { error: "Analisis tidak tersedia, coba lagi." },
      { status: 500 },
    );
  }

  // Cache to DB so every subsequent visitor gets instant results.
  try {
    await prisma.car.update({
      where: { id: carId },
      data: {
        buyerInsight: JSON.stringify(insight),
        buyerInsightAt: new Date(),
      },
    });
  } catch {
    // Persistence failure shouldn't fail the request — the insight is still returned.
  }

  return Response.json({ insight, fromCache: false });
}

// ---- helpers -----------------------------------------------------------

function normalizeInsight(parsed: unknown): BuyerInsight {
  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;

  const verdict =
    typeof obj.dealVerdict === "string" && VERDICTS.includes(obj.dealVerdict as DealVerdict)
      ? (obj.dealVerdict as DealVerdict)
      : "FAIR_DEAL";

  const checklist = Array.isArray(obj.inspectionChecklist)
    ? obj.inspectionChecklist
        .filter((c): c is Record<string, unknown> => c && typeof c === "object")
        .map((c) => ({
          item: typeof c.item === "string" ? c.item : "Periksa kondisi",
          why: typeof c.why === "string" ? c.why : "",
        }))
        .slice(0, 5)
    : [];

  return {
    dealVerdict: verdict,
    verdictLabel: strOr(obj.verdictLabel, "Penilaian Tersedia"),
    dealExplanation: strOr(obj.dealExplanation, "Analisis tersedia."),
    priceAssessment: strOr(obj.priceAssessment, "—"),
    negotiationTip: strOr(obj.negotiationTip, "—"),
    inspectionChecklist: checklist,
    generatedAt: new Date().toISOString(),
  };
}

function strOr(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
