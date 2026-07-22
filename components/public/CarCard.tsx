import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import type { Car as CarType } from "@/lib/generated/prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMileage, formatPrice } from "@/lib/format";

export function CarCard({ car, index = 0 }: { car: CarType; index?: number }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="reveal group block cursor-pointer overflow-hidden rounded-xl border border-border bg-surface shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Geometric placeholder block (no real imagery in demo) */}
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-primary">
        <div className="block-grid absolute inset-0 opacity-60" aria-hidden />
        <Car
          className="relative h-16 w-16 text-on-primary/90 transition-transform duration-300 group-hover:scale-105"
          strokeWidth={1.5}
        />
        {/* Brand badge (top-left) — mirrors the year badge on the right. */}
        <span className="absolute left-3 top-3 rounded-md bg-surface/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
          {car.make}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {car.year}
        </span>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-2">
          {/* Name wraps instead of truncating — buyers need to read the full model. */}
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-display text-base font-bold uppercase leading-tight tracking-wide text-primary">
              {car.make} {car.model}
            </h3>
            <p className="mt-1 text-xs text-secondary">
              {formatMileage(car.mileage)}
            </p>
          </div>
          <StatusBadge status={car.status} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="label text-[10px] text-secondary">Price</p>
            <div className="flex w-full items-center justify-between gap-3">
              <p className="font-display text-xl font-bold text-primary">
                {formatPrice(car.price)}
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-accent transition-transform duration-200 group-hover:translate-x-0.5">
            View
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
