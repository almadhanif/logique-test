"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { buildSearchPath } from "@/lib/nav";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/20";

export function FilterPanel({ makes }: { makes: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [make, setMake] = useState(searchParams.get("make") ?? "");
  const [yearMin, setYearMin] = useState(searchParams.get("yearMin") ?? "");
  const [yearMax, setYearMax] = useState(searchParams.get("yearMax") ?? "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [mileageMax, setMileageMax] = useState(searchParams.get("mileageMax") ?? "");

  function apply(updates: Record<string, string>) {
    startTransition(() => {
      router.replace(buildSearchPath("/", searchParams, updates));
    });
  }

  function reset() {
    setMake("");
    setYearMin("");
    setYearMax("");
    setPriceMin("");
    setPriceMax("");
    setMileageMax("");
    const search = searchParams.get("search");
    startTransition(() =>
      router.replace(
        buildSearchPath("/", searchParams, {
          make: "",
          yearMin: "",
          yearMax: "",
          priceMin: "",
          priceMax: "",
          mileageMax: "",
          search: search ?? "",
        }),
      ),
    );
  }

  const hasFilters =
    make || yearMin || yearMax || priceMin || priceMax || mileageMax;

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium text-accent hover:text-accent-hover"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">Make</span>
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            apply({ make: e.target.value });
          }}
          className={inputClass}
        >
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-1 block text-xs font-medium text-ink-soft">Year</span>
        <div className="flex items-center gap-2">
          <NumberInput
            ariaLabel="Minimum year"
            placeholder="Min"
            value={yearMin}
            onChange={setYearMin}
            onCommit={() => apply({ yearMin })}
          />
          <span className="text-ink-faint">–</span>
          <NumberInput
            ariaLabel="Maximum year"
            placeholder="Max"
            value={yearMax}
            onChange={setYearMax}
            onCommit={() => apply({ yearMax })}
          />
        </div>
      </div>

      <div>
        <span className="mb-1 block text-xs font-medium text-ink-soft">
          Price (IDR)
        </span>
        <div className="flex items-center gap-2">
          <NumberInput
            ariaLabel="Minimum price"
            placeholder="Min"
            value={priceMin}
            onChange={setPriceMin}
            onCommit={() => apply({ priceMin })}
          />
          <span className="text-ink-faint">–</span>
          <NumberInput
            ariaLabel="Maximum price"
            placeholder="Max"
            value={priceMax}
            onChange={setPriceMax}
            onCommit={() => apply({ priceMax })}
          />
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-ink-soft">
          Max mileage (km)
        </span>
        <NumberInput
          ariaLabel="Maximum mileage"
          placeholder="e.g. 100000"
          value={mileageMax}
          onChange={setMileageMax}
          onCommit={() => apply({ mileageMax })}
        />
      </label>

      {isPending ? (
        <p className="text-xs text-ink-faint" aria-live="polite">
          Updating…
        </p>
      ) : null}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  onCommit,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  placeholder?: string;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit();
        }
      }}
      className={inputClass}
    />
  );
}
