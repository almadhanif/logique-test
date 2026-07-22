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
