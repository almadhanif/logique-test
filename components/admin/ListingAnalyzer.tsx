"use client";

import { useState } from "react";
import { Lightbulb, Sparkles, Wand2 } from "lucide-react";
import type {
  AICopyFormValues,
  AnalysisBreakdown,
  ExistingAnalysis,
  ListingAnalysis,
  SuggestedFields,
} from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

// Unified view the UI renders — either freshly analyzed (full, with breakdown)
// or restored from the DB (score + price + suggestions only).
type AnalysisView = {
  healthScore: number;
  priceMin?: number;
  priceMax?: number;
  rationale?: string;
  breakdown?: AnalysisBreakdown;
  suggestions: string[];
  lastAnalyzedAt?: string;
  suggestedFields?: SuggestedFields;
};

function fromStored(stored: ExistingAnalysis): AnalysisView {
  return {
    healthScore: stored.healthScore,
    priceMin: stored.suggestedPriceMin,
    priceMax: stored.suggestedPriceMax,
    suggestions: stored.analysisSuggestions,
    lastAnalyzedAt: stored.lastAnalyzedAt,
  };
}

function fromFresh(fresh: ListingAnalysis): AnalysisView {
  return {
    healthScore: fresh.healthScore,
    priceMin: fresh.priceRange.min,
    priceMax: fresh.priceRange.max,
    rationale: fresh.priceRange.rationale,
    breakdown: fresh.breakdown,
    suggestions: fresh.suggestions,
    lastAnalyzedAt: new Date().toISOString(),
    suggestedFields: fresh.suggestedFields,
  };
}

function scoreColor(score: number): { bar: string; text: string; label: string } {
  if (score >= 71)
    return { bar: "bg-emerald-500", text: "text-emerald-700", label: "Good" };
  if (score >= 41)
    return { bar: "bg-amber-500", text: "text-amber-700", label: "Fair" };
  return { bar: "bg-red-500", text: "text-red-700", label: "Weak" };
}

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ListingAnalyzer({
  carId,
  formData,
  existingAnalysis,
  onApply,
}: {
  carId?: string;
  formData: AICopyFormValues;
  existingAnalysis?: ExistingAnalysis;
  onApply?: (fields: SuggestedFields) => void;
}) {
  const [view, setView] = useState<AnalysisView | null>(
    existingAnalysis ? fromStored(existingAnalysis) : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze =
    formData.make.trim() !== "" &&
    formData.model.trim() !== "" &&
    String(formData.year).trim() !== "" &&
    String(formData.mileage).trim() !== "" &&
    String(formData.price).trim() !== "";

  async function analyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/analyze-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, carId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to analyze listing.");
        return;
      }
      setView(fromFresh(data.analysis as ListingAnalysis));
    } catch {
      setError("Network error while contacting the AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-primary">
            AI listing analyzer
          </h3>
          <p className="text-xs text-secondary">
            One call returns a marketability score, a suggested price range, and
            improvement tips.
          </p>
        </div>
        <button
          type="button"
          onClick={analyze}
          disabled={loading || !canAnalyze}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner />
              Analyzing…
            </>
          ) : view ? (
            <>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              Re-analyze
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              Analyze listing
            </>
          )}
        </button>
      </div>

      {!canAnalyze ? (
        <p className="mt-2 text-xs text-secondary">
          Fill in make, model, year, mileage and price to enable analysis.
        </p>
      ) : null}

      {error ? (
        <p
          className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? <Skeleton /> : null}

      {!loading && view ? <Results view={view} onReanalyze={analyze} onApply={onApply} /> : null}
    </div>
  );
}

function Results({
  view,
  onReanalyze,
  onApply,
}: {
  view: AnalysisView;
  onReanalyze: () => void;
  onApply?: (fields: SuggestedFields) => void;
}) {
  const toast = useToast();
  const color = scoreColor(view.healthScore);

  const sf = view.suggestedFields;
  const hasSuggestions = sf && Object.values(sf).some((v) => v !== undefined);

  function apply() {
    if (!sf || !onApply) return;
    onApply(sf);
    toast("AI suggestions applied to form");
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Score + price */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Marketability score
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold text-primary">
              {view.healthScore}
            </span>
            <span className="text-sm text-secondary">/ 100</span>
            <span className={`ml-2 text-xs font-semibold ${color.text}`}>
              {color.label}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-[width] duration-700 ease-out ${color.bar}`}
              style={{ width: `${view.healthScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Suggested price
          </p>
          {view.priceMin !== undefined && view.priceMax !== undefined ? (
            <>
              <p className="mt-1 text-lg font-bold text-primary">
                {formatPrice(view.priceMin)} – {formatPrice(view.priceMax)}
              </p>
              <p className="mt-1 text-xs italic text-secondary">
                {view.rationale ?? "Based on make, model, year and mileage."}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-secondary">Re-analyze for details.</p>
          )}
        </div>
      </div>

      {/* Breakdown bars (only available from a fresh analysis) */}
      {view.breakdown ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-secondary">
            Score breakdown
          </p>
          <div className="space-y-2">
            <BreakdownRow
              label="Pricing"
              part={view.breakdown.pricing}
            />
            <BreakdownRow
              label="Description"
              part={view.breakdown.description}
            />
            <BreakdownRow
              label="Completeness"
              part={view.breakdown.completeness}
            />
            <BreakdownRow label="Appeal" part={view.breakdown.appeal} />
          </div>
        </div>
      ) : null}

      {/* Suggestions */}
      {view.suggestions.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-secondary">
            <Lightbulb className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
            Suggestions to improve
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary">
            {view.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Apply AI suggestions to form fields */}
      {hasSuggestions && onApply ? (
        <button
          type="button"
          onClick={apply}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-primary shadow-sm transition-all hover:bg-accent hover:-translate-y-px"
        >
          <Wand2 className="h-4 w-4" strokeWidth={2.5} />
          Apply AI suggestions to form
        </button>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary">
          {view.lastAnalyzedAt
            ? `Last analyzed ${timeAgo(view.lastAnalyzedAt)}`
            : ""}
        </p>
        <button
          type="button"
          onClick={onReanalyze}
          className="text-xs font-medium text-secondary hover:text-primary"
        >
          Re-analyze
        </button>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  part,
}: {
  label: string;
  part: { score: number; label: string; note: string };
}) {
  const pct = Math.round((part.score / 25) * 100);
  const color = scoreColor(part.score * 4); // rescale 0-25 to ~0-100 for coloring
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-secondary">
          {label}{" "}
          <span className="text-secondary">
            · {part.label}
          </span>
        </span>
        <span className="tabular-nums text-secondary">{part.score}/25</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${color.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="mt-0.5 text-xs text-secondary">{part.note}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="animate-pulse rounded-lg border border-border bg-surface p-3">
        <div className="h-3 w-24 rounded bg-line" />
        <div className="mt-2 h-7 w-20 rounded bg-line" />
        <div className="mt-2 h-2 w-full rounded bg-muted" />
      </div>
      <div className="animate-pulse rounded-lg border border-border bg-surface p-3">
        <div className="h-3 w-24 rounded bg-line" />
        <div className="mt-2 h-6 w-40 rounded bg-line" />
        <div className="mt-2 h-3 w-32 rounded bg-muted" />
      </div>
      <p className="text-center text-xs text-secondary sm:col-span-2">
        Analyzing market data…
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
