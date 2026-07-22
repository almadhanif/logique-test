"use client";

import { useState } from "react";
import type { AICopyFormValues } from "@/lib/types";

export function AICopyGenerator({
  formValues,
  onUse,
}: {
  formValues: AICopyFormValues;
  onUse: (adCopy: string) => void;
}) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Need at least make + model + year to produce useful copy.
  const canGenerate =
    formValues.make.trim() !== "" &&
    formValues.model.trim() !== "" &&
    String(formValues.year).trim() !== "";

  async function generate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to generate ad copy.");
        return;
      }

      setResult(data.adCopy);
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
          <h3 className="text-sm font-semibold text-zinc-900">
            AI ad copy generator
          </h3>
          <p className="text-xs text-zinc-500">
            Turns your raw notes into polished, buyer-facing copy.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading || !canGenerate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner />
              Generating…
            </>
          ) : (
            <>✨ {result ? "Regenerate" : "Generate AI copy"}</>
          )}
        </button>
      </div>

      {!canGenerate ? (
        <p className="mt-2 text-xs text-zinc-400">
          Enter at least a make, model and year to enable generation.
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

      {result && !loading ? (
        <div className="mt-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">
              {result}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onUse(result);
                setResult(null);
              }}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Use this copy
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
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
