"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterX } from "lucide-react";
import { buildSearchPath } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n/dictionaries";

const inputClass =
  "w-full cursor-text rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-primary";

export function FilterPanel({ makes, locale }: { makes: string[]; locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [make, setMake] = useState(searchParams.get("make") ?? "");
  // Date pickers for year range — value is "YYYY-MM-DD"; we extract the year on commit.
  const [yearMinDate, setYearMinDate] = useState(
    searchParams.get("yearMin") ? `${searchParams.get("yearMin")}-01-01` : "",
  );
  const [yearMaxDate, setYearMaxDate] = useState(
    searchParams.get("yearMax") ? `${searchParams.get("yearMax")}-12-31` : "",
  );
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") ?? "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") ?? "");
  const [mileageMax, setMileageMax] = useState(searchParams.get("mileageMax") ?? "");

  function apply(updates: Record<string, string>) {
    startTransition(() => {
      router.replace(buildSearchPath("/", searchParams, updates), { scroll: false });
    });
  }

  // Extract years from the date pickers and apply both at once.
  function applyYearRange() {
    const minY = yearMinDate ? yearMinDate.substring(0, 4) : "";
    const maxY = yearMaxDate ? yearMaxDate.substring(0, 4) : "";
    apply({ yearMin: minY, yearMax: maxY });
  }

  function reset() {
    setMake("");
    setYearMinDate("");
    setYearMaxDate("");
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
        { scroll: false },
      ),
    );
  }

  const hasFilters =
    make || yearMinDate || yearMaxDate || priceMin || priceMax || mileageMax;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="label text-xs text-primary">{t(locale, "filter.title")}</h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent transition-opacity hover:opacity-80"
          >
            <FilterX className="h-3.5 w-3.5" strokeWidth={2.5} />
            {t(locale, "filter.clear")}
          </button>
        ) : null}
      </div>

      <label className="block">
        <span className="label mb-1.5 block text-[10px] text-secondary">{t(locale, "filter.make")}</span>
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            apply({ make: e.target.value });
          }}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">{t(locale, "filter.allMakes")}</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {/* Year range — calendar date pickers */}
      <div>
        <span className="label mb-1.5 block text-[10px] text-secondary">{t(locale, "filter.year")}</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Minimum year"
            value={yearMinDate}
            onChange={(e) => setYearMinDate(e.target.value)}
            onBlur={applyYearRange}
            className={`${inputClass} cursor-pointer`}
          />
          <span className="text-secondary">–</span>
          <input
            type="date"
            aria-label="Maximum year"
            value={yearMaxDate}
            onChange={(e) => setYearMaxDate(e.target.value)}
            onBlur={applyYearRange}
            className={`${inputClass} cursor-pointer`}
          />
        </div>
      </div>

      <div>
        <span className="label mb-1.5 block text-[10px] text-secondary">{t(locale, "filter.price")}</span>
        <div className="flex items-center gap-2">
          <NumberInput locale={locale} ariaLabel="Minimum price" value={priceMin} onChange={setPriceMin} onCommit={() => apply({ priceMin })} />
          <span className="text-secondary">–</span>
          <NumberInput locale={locale} ariaLabel="Maximum price" value={priceMax} onChange={setPriceMax} onCommit={() => apply({ priceMax })} />
        </div>
      </div>

      <label className="block">
        <span className="label mb-1.5 block text-[10px] text-secondary">{t(locale, "filter.maxMileage")}</span>
        <NumberInput locale={locale} ariaLabel="Maximum mileage" placeholder="e.g. 100000" value={mileageMax} onChange={setMileageMax} onCommit={() => apply({ mileageMax })} />
      </label>

      {isPending ? (
        <p className="text-xs text-secondary" aria-live="polite">{t(locale, "filter.updating")}</p>
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
  locale,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  placeholder?: string;
  ariaLabel: string;
  locale: Locale;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      aria-label={ariaLabel}
      placeholder={placeholder ?? (ariaLabel.includes("Min") ? t(locale, "filter.min") : t(locale, "filter.max"))}
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
