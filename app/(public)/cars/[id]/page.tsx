import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMileage, formatNumber, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const car = await prisma.car.findUnique({ where: { id } });

  // Only published cars are publicly viewable; everything else 404s.
  if (!car || car.status !== "PUBLISHED") {
    notFound();
  }

  const monogram = (car.make[0] ?? "L").toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
      >
        ← Back to listings
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* Photo placeholder */}
        <div className="reveal flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-paper-deep via-paper-deep to-accent-soft">
          <span className="font-display text-[12rem] leading-none text-accent/25">
            {monogram}
          </span>
        </div>

        {/* Summary */}
        <div className="reveal reveal-2 flex flex-col">
          <div className="flex items-center gap-2">
            <StatusBadge status={car.status} />
            <span className="text-sm text-ink-faint">{car.year}</span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {car.make} {car.model}
          </h1>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Price
            </p>
            <p className="font-display text-4xl font-semibold text-ink">
              {formatPrice(car.price)}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6">
            <Spec label="Mileage" value={formatMileage(car.mileage)} />
            <Spec label="Year" value={formatNumber(car.year)} />
            <Spec label="Color" value={car.color ?? "—"} />
            <Spec label="Listed" value={car.createdAt.toLocaleDateString()} />
          </dl>
        </div>
      </div>

      {/* Description / AI ad copy */}
      <div className="mt-12">
        {car.adCopy ? (
          <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft/40 p-8 sm:p-10">
            <span className="font-display text-6xl leading-none text-accent/30">
              &ldquo;
            </span>
            <p className="-mt-4 whitespace-pre-line font-display text-xl leading-relaxed text-ink sm:text-2xl">
              {car.adCopy}
            </p>
          </section>
        ) : (
          <section className="rounded-3xl border border-line bg-surface p-8 sm:p-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Description
            </h2>
            {car.description ? (
              <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-ink-soft">
                {car.description}
              </p>
            ) : (
              <p className="mt-3 text-ink-faint">No description provided.</p>
            )}
            <p className="mt-4 text-xs italic text-ink-faint">
              Not yet enhanced — an admin can generate AI ad copy for this listing.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-medium text-ink">{value}</dd>
    </div>
  );
}
