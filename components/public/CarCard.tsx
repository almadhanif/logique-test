import Link from "next/link";
import type { Car } from "@/lib/generated/prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMileage, formatPrice } from "@/lib/format";

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const monogram = (car.make[0] ?? "L").toUpperCase();

  return (
    <Link
      href={`/cars/${car.id}`}
      className="reveal group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_0_rgba(28,24,20,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-18px_rgba(28,24,20,0.35)]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* Photo placeholder — editorial monogram (no real image storage in demo) */}
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-paper-deep via-paper-deep to-accent-soft">
        <span className="font-display text-[7rem] leading-none text-accent/25 transition-transform duration-500 group-hover:scale-110">
          {monogram}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-paper backdrop-blur">
          {car.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-semibold text-ink">
              {car.make} {car.model}
            </h3>
            <p className="mt-0.5 text-sm text-ink-faint">
              {formatMileage(car.mileage)}
              {car.color ? ` · ${car.color}` : ""}
            </p>
          </div>
          <StatusBadge status={car.status} />
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              Price
            </p>
            <p className="font-display text-2xl font-semibold text-ink">
              {formatPrice(car.price)}
            </p>
          </div>
          <span className="text-sm font-semibold text-accent transition-transform duration-300 group-hover:translate-x-0.5">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
