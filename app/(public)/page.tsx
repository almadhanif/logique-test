import { Suspense } from "react";
import { CarCard } from "@/components/public/CarCard";
import { SearchBar } from "@/components/public/SearchBar";
import { FilterPanel } from "@/components/public/FilterPanel";
import { fetchPublishedCars, fetchPublishedMakes, parseCarFilters } from "@/lib/queries";

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
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Editorial hero */}
      <section className="mb-10 max-w-3xl">
        <p className="reveal reveal-1 mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Curated marketplace
        </p>
        <h1 className="reveal reveal-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl">
          Find the car that{" "}
          <span className="italic text-accent">actually fits</span> your life.
        </h1>
        <p className="reveal reveal-3 mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
          Browse verified used-car listings with honest, AI-polished
          descriptions. {cars.length} available
          {activeFilterCount > 0
            ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
            : ""}
          .
        </p>
      </section>

      <div className="mb-8">
        <Suspense fallback={<div className="h-11 rounded-xl bg-paper-deep" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={<div className="h-72 rounded-2xl bg-paper-deep" />}>
            <FilterPanel makes={makes} />
          </Suspense>
        </aside>

        <section>
          {cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-20 text-center">
              <span className="font-display text-5xl text-accent/40">∅</span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                No cars match your search
              </h2>
              <p className="mt-1 text-sm text-ink-faint">
                Adjust your filters or clear them to see everything.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
