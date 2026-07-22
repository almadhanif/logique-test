import { Suspense } from "react";
import { CarFront } from "lucide-react";
import { CarCard } from "@/components/public/CarCard";
import { SearchBar } from "@/components/public/SearchBar";
import { FilterPanel } from "@/components/public/FilterPanel";
import {
  fetchPublishedCars,
  fetchPublishedMakes,
  parseCarFilters,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseCarFilters(params);

  const [cars, makes] = await Promise.all([
    fetchPublishedCars(filters),
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
        <div className="relative mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="label reveal text-xs text-accent">
            {"// used-car marketplace"}
          </p>
          <h1 className="reveal mt-4 font-display text-4xl font-bold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
            Find your
            <br />
            next ride
          </h1>
          <p className="reveal mt-5 text-sm leading-relaxed text-on-primary/80 sm:text-base">
            Verified listings with AI-polished descriptions and marketability
            scoring. {cars.length} cars available right now.
          </p>

          <div className="reveal mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-on-primary/15 pt-6">
            <Stat value={String(cars.length)} label="Listings" />
            <Stat value="AI" label="Pricing" />
            <Stat value="IDR" label="Currency" />
          </div>
        </div>
      </section>

      {/* Search + grid */}
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Suspense fallback={<div className="h-12 rounded-lg bg-muted" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<div className="h-72 rounded-xl bg-muted" />}>
              <FilterPanel makes={makes} />
            </Suspense>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="label text-xs text-secondary">
                Featured listings
              </h2>
              {activeFilterCount > 0 ? (
                <span className="text-xs text-accent">
                  {activeFilterCount} filter{activeFilterCount === 1 ? "" : "s"}{" "}
                  active
                </span>
              ) : null}
            </div>

            {cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-20 text-center">
                <CarFront className="h-10 w-10 text-border" />
                <h3 className="mt-4 font-display text-lg font-bold uppercase text-primary">
                  No matches
                </h3>
                <p className="mt-1 text-sm text-secondary">
                  Adjust your filters to see more cars.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {cars.map((car, i) => (
                  <CarCard key={car.id} car={car} index={i} />
                ))}
              </div>
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
