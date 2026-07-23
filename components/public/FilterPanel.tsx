"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FilterX } from "lucide-react";
import { buildSearchPath } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n/dictionaries";

const inputClass =
  "w-full cursor-text rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-primary";

// Generate year options (newest first).
const CURRENT_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

function formatDots(raw: string): string {
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function FilterPanel({ makes, locale }: { makes: string[]; locale: Locale }) {
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
      router.replace(buildSearchPath("/", searchParams, updates), { scroll: false });
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
        { scroll: false },
      ),
    );
  }

  const hasFilters = make || yearMin || yearMax || priceMin || priceMax || mileageMax;

  return (
    <div className="space-y-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="label text-sm text-primary">{t(locale, "filter.title")}</h2>
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

      {/* Make */}
      <div>
        <span className="label mb-2 block text-[10px] text-secondary">{t(locale, "filter.make")}</span>
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
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Year range — clean selects */}
      <div className="space-y-2">
        <span className="label block text-[10px] text-secondary">{t(locale, "filter.year")}</span>
        <select
          value={yearMin}
          onChange={(e) => {
            setYearMin(e.target.value);
            apply({ yearMin: e.target.value });
          }}
          aria-label="From year"
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">{locale === "id" ? "Dari tahun" : "From year"}</option>
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
        <select
          value={yearMax}
          onChange={(e) => {
            setYearMax(e.target.value);
            apply({ yearMax: e.target.value });
          }}
          aria-label="To year"
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">{locale === "id" ? "Sampai tahun" : "To year"}</option>
          {YEARS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* Price range — formatted Rupiah */}
      <div className="space-y-2">
        <span className="label block text-[10px] text-secondary">{t(locale, "filter.price")}</span>
        <FormattedInput
          value={priceMin}
          onChange={setPriceMin}
          onCommit={() => apply({ priceMin })}
          placeholder={locale === "id" ? "Harga minimum" : "Min price"}
        />
        <FormattedInput
          value={priceMax}
          onChange={setPriceMax}
          onCommit={() => apply({ priceMax })}
          placeholder={locale === "id" ? "Harga maksimum" : "Max price"}
        />
      </div>

      {/* Max mileage — formatted */}
      <div>
        <span className="label mb-2 block text-[10px] text-secondary">{t(locale, "filter.maxMileage")}</span>
        <FormattedInput
          value={mileageMax}
          onChange={setMileageMax}
          onCommit={() => apply({ mileageMax })}
          placeholder="100.000"
          suffix="km"
        />
      </div>

      {isPending ? (
        <p className="text-xs text-secondary" aria-live="polite">{t(locale, "filter.updating")}</p>
      ) : null}
    </div>
  );
}

/**
 * Input that formats its numeric value with Indonesian thousand separators
 * (dots) and shows an "Rp" prefix (for price) or a suffix (for km).
 * Stores the raw un-formatted number string in parent state.
 */
function FormattedInput({
  value,
  onChange,
  onCommit,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  placeholder?: string;
  suffix?: string;
}) {
  const display = value ? formatDots(value) : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(raw);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-secondary">
        {suffix ? "" : "Rp"}
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onCommit();
          }
        }}
        placeholder={placeholder}
        className={`${inputClass} ${suffix ? "pr-10" : "pl-10"}`}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
