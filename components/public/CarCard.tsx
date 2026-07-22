import Link from "next/link";
import { ArrowRight, Car } from "lucide-react";
import type { Car as CarType } from "@/lib/generated/prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMileage, formatPrice } from "@/lib/format";

export function CarCard({ car, index = 0 }: { car: CarType; index?: number }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="reveal group block cursor-pointer rounded-xl border border-border bg-surface p-0 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Geometric placeholder block (no real imagery in demo) */}
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-t-xl bg-primary">
        <div
          className="block-grid absolute inset-0 opacity-60"
          aria-hidden
        />
        <Car
          className="relative h-16 w-16 text-on-primary/90 transition-transform duration-300 group-hover:scale-105"
          strokeWidth={1.5}
        />
        <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {car.year}
        </span>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold uppercase tracking-wide text-primary">
              {car.make} {car.model}
            </h3>
            <p className="mt-1 text-xs text-secondary">{formatMileage(car.mileage)}</p>
          </div>
          <StatusBadge status={car.status} />
        </div>

        <div className="flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="label text-[10px] text-secondary">Price</p>
            <p className="font-display text-xl font-bold text-primary">
              {formatPrice(car.price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent transition-transform duration-200 group-hover:translate-x-0.5">
            View
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
