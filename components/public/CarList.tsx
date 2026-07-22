"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Car as CarType } from "@/lib/generated/prisma/client";
import { CarCard } from "@/components/public/CarCard";
import { t, type Locale } from "@/lib/i18n/dictionaries";

export function CarList({
  initialCars,
  hasMore: initialHasMore,
  locale,
}: {
  initialCars: CarType[];
  hasMore: boolean;
  locale: Locale;
}) {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState(initialCars);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // The parent remounts this component via `key` when the filter set changes,
  // so the useState initializers above already reflect the new first page —
  // no reset effect needed.

  const fetchNext = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    const qs = searchParams.toString();
    const url = `/api/cars?${qs ? `${qs}&` : ""}page=${nextPage}`;
    try {
      const res = await fetch(url);
      const data = (await res.json()) as { cars: CarType[]; hasMore?: boolean };
      setCars((prev) => [...prev, ...data.cars]);
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNext();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNext]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cars.map((car, i) => (
          <CarCard key={car.id} car={car} index={i} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-12" aria-hidden />

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-wider text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
          {t(locale, "browse.loadingMore")}
        </p>
      ) : !hasMore && cars.length > 0 ? (
        <p className="py-4 text-center text-xs uppercase tracking-wider text-secondary">
          {t(locale, "browse.end", { count: cars.length })}
        </p>
      ) : null}
    </div>
  );
}
