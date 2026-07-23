// Shared types for the AI Listing Analyzer feature.

// Form values shared by the AI features (ad-copy generator + listing analyzer).
// Number fields arrive as strings from the form inputs.
export type AICopyFormValues = {
  make: string;
  model: string;
  year: number | string;
  mileage: number | string;
  price: number | string;
  color: string;
  description: string;
};


export type AnalysisBreakdown = {
  pricing: { score: number; label: string; note: string };
  description: { score: number; label: string; note: string };
  completeness: { score: number; label: string; note: string };
  appeal: { score: number; label: string; note: string };
};

export type ListingAnalysis = {
  healthScore: number;
  priceRange: {
    min: number;
    max: number;
    rationale: string;
  };
  breakdown: AnalysisBreakdown;
  suggestions: string[];
  suggestedFields?: SuggestedFields;
};

// Field-level suggestions the AI returns alongside the analysis. The admin can
// apply these to the form with one click.
export type SuggestedFields = {
  price?: number; // recommended listing price
  model?: string; // normalized / properly-capitalized model name
  color?: string; // standardized color
  adCopy?: string; // polished, buyer-facing ad copy
  description?: string; // improved description from the admin's raw notes
};

// The subset of an analysis that we persist on the Car row (suggestions are
// stored as a JSON string column; here they're already parsed).
export type ExistingAnalysis = {
  healthScore: number;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  analysisSuggestions: string[];
  lastAnalyzedAt: string;
};

// ---- Buyer-facing AI insights (public detail page) ----

export type DealVerdict = "GREAT_DEAL" | "GOOD_DEAL" | "FAIR_DEAL" | "OVERPRICED";

export type ChecklistItem = {
  item: string; // what to check — short, imperative ("Cek kondisi transmisi CVT")
  why: string; // why it matters for this specific car — 1 sentence
};

export type BuyerInsight = {
  dealVerdict: DealVerdict;
  verdictLabel: string; // e.g. "Harga Sangat Kompetitif" (in Bahasa Indonesia)
  dealExplanation: string; // 2-3 sentences in Bahasa Indonesia
  priceAssessment: string; // 1 sentence on price vs market
  negotiationTip: string; // 1 actionable negotiation hint in Bahasa Indonesia
  inspectionChecklist: ChecklistItem[]; // exactly 5 items
  generatedAt: string; // ISO timestamp, set server-side before storing
};
