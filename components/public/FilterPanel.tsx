"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterX } from "lucide-react";
import { buildSearchPath } from "@/lib/nav";

const inputClass =
  "w-full cursor-text rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-primary";

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
    <div className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-primary">Filters</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent transition-opacity hover:opacity-80"
          >
            <FilterX className="h-3.5 w-3.5" strokeWidth={2.5} />
            Clear
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="label mb-1.5 block text-[10px] text-secondary">Make</span>
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            apply({ make: e.target.value });
          }}
          className={`${inputClass} cursor-pointer`}
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
        <span className="label mb-1.5 block text-[10px] text-secondary">Year</span>
        <div className="flex items-center gap-2">
          <NumberInput ariaLabel="Minimum year" placeholder="Min" value={yearMin} onChange={setYearMin} onCommit={() => apply({ yearMin })} />
          <span className="text-secondary">–</span>
          <NumberInput ariaLabel="Maximum year" placeholder="Max" value={yearMax} onChange={setYearMax} onCommit={() => apply({ yearMax })} />
        </div>
      </div>

      <div>
        <span className="label mb-1.5 block text-[10px] text-secondary">Price (IDR)</span>
        <div className="flex items-center gap-2">
          <NumberInput ariaLabel="Minimum price" placeholder="Min" value={priceMin} onChange={setPriceMin} onCommit={() => apply({ priceMin })} />
          <span className="text-secondary">–</span>
          <NumberInput ariaLabel="Maximum price" placeholder="Max" value={priceMax} onChange={setPriceMax} onCommit={() => apply({ priceMax })} />
        </div>
      </div>

      <label className="block">
        <span className="label mb-1.5 block text-[10px] text-secondary">Max mileage (km)</span>
        <NumberInput ariaLabel="Maximum mileage" placeholder="e.g. 100000" value={mileageMax} onChange={setMileageMax} onCommit={() => apply({ mileageMax })} />
      </label>

      {isPending ? (
        <p className="text-xs text-secondary" aria-live="polite">Updating…</p>
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
