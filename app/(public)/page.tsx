import { Suspense } from "react";
import { CarFront } from "lucide-react";
import { CarList } from "@/components/public/CarList";
import { SearchBar } from "@/components/public/SearchBar";
import { FilterPanel } from "@/components/public/FilterPanel";
import {
  fetchPublishedCarsPage,
  fetchPublishedMakes,
  PAGE_SIZE,
  parseCarFilters,
} from "@/lib/queries";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, locale] = await Promise.all([searchParams, getLocale()]);
  const filters = parseCarFilters(params);

  const [{ cars, total, hasMore }, makes] = await Promise.all([
    fetchPublishedCarsPage(filters, 1, PAGE_SIZE),
    fetchPublishedMakes(),
  ]);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  return (
    <div>
      {/* Hero — search-focused, block-based */}
      <section className="relative overflow-hidden bg-primary text-on-primary">
        <div className="block-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="app-container relative py-16 lg:py-24">
          <p className="label reveal text-xs text-accent">
            {t(locale, "hero.tag")}
          </p>
          <h1 className="reveal mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
            {t(locale, "hero.title1")}
            <br />
            {t(locale, "hero.title2")}
          </h1>
          <p className="reveal mt-5 text-sm leading-relaxed text-on-primary/80 sm:text-base">
            {t(locale, "hero.subtitle", { count: total })}
          </p>

          <div className="reveal mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-on-primary/15 pt-6">
            <Stat value={String(total)} label={t(locale, "stat.listings")} />
            <Stat value="AI" label={t(locale, "stat.pricing")} />
            <Stat value="IDR" label={t(locale, "stat.currency")} />
          </div>
        </div>
      </section>

      {/* Search + grid */}
      <div className="app-container py-10">
        <div className="mb-8">
          <Suspense fallback={<div className="h-12 rounded-lg bg-muted" />}>
            <SearchBar locale={locale} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="h-72 rounded-xl bg-muted" />}>
              <FilterPanel makes={makes} locale={locale} />
            </Suspense>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="label text-xs text-secondary">
                {t(locale, "browse.featured")}
              </h2>
              {activeFilterCount > 0 ? (
                <span className="text-xs text-accent">
                  {t(
                    locale,
                    activeFilterCount === 1
                      ? "browse.filterActive"
                      : "browse.filtersActive",
                    { count: activeFilterCount },
                  )}
                </span>
              ) : null}
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-20 text-center">
                <CarFront className="h-10 w-10 text-border" />
                <h3 className="mt-4 font-display text-lg font-bold uppercase text-primary">
                  {t(locale, "browse.noMatches")}
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  {t(locale, "browse.noMatchesHint")}
                </p>
              </div>
            ) : (
              <Suspense fallback={<CarCardGrid cars={cars} />}>
                {/* key by filters so the list resets when filters change */}
                <CarList
                  key={JSON.stringify(filters)}
                  initialCars={cars}
                  hasMore={hasMore}
                  locale={locale}
                />
              </Suspense>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-on-primary sm:text-3xl">
        {value}
      </div>
      <div className="label mt-1 text-[10px] text-on-primary/60">{label}</div>
    </div>
  );
}

// Static fallback for the CarList Suspense boundary (first page, no JS yet).
function CarCardGrid({ cars }: { cars: { id: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cars.map((c) => (
        <div key={c.id} className="h-72 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
