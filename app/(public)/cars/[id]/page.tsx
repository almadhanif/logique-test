import { notFound } from "next/navigation";
import { Car, Gauge, Calendar, Palette, Clock, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BuyerInsightsPanel } from "@/components/public/BuyerInsightsPanel";
import { formatMileage, formatNumber, formatPrice } from "@/lib/format";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import type { BuyerInsight } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [car, locale] = await Promise.all([
    prisma.car.findUnique({ where: { id } }),
    getLocale(),
  ]);

  // Only published cars are publicly viewable; everything else 404s.
  if (!car || car.status !== "PUBLISHED") {
    notFound();
  }

  // Parse cached buyer insight if it exists (instant for repeat visitors).
  let cachedInsight: BuyerInsight | null = null;
  if (car.buyerInsight) {
    try {
      cachedInsight = JSON.parse(car.buyerInsight) as BuyerInsight;
    } catch {
      cachedInsight = null;
    }
  }

  return (
    <div className="app-container py-10">
      <Breadcrumbs
        items={[
          { label: t(locale, "nav.browse"), href: "/" },
          { label: `${car.make} ${car.model}` },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Placeholder block */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-primary">
          <div className="block-grid absolute inset-0 opacity-60" aria-hidden />
          <Car className="relative h-28 w-28 text-on-primary/90" strokeWidth={1.25} />
        </div>

        {/* Summary */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <StatusBadge status={car.status} />
            <span className="label text-[10px] text-secondary">{car.year}</span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] text-primary sm:text-5xl">
            {car.make} {car.model}
          </h1>

          <div className="mt-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="label text-[10px] text-secondary">{t(locale, "detail.price")}</p>
            <p className="mt-1 font-display text-4xl font-bold text-primary">
              {formatPrice(car.price)}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
            <Spec icon={<Gauge className="h-4 w-4" />} label={t(locale, "detail.mileage")} value={formatMileage(car.mileage)} />
            <Spec icon={<Calendar className="h-4 w-4" />} label={t(locale, "detail.year")} value={formatNumber(car.year)} />
            <Spec icon={<Palette className="h-4 w-4" />} label={t(locale, "detail.color")} value={car.color ?? "—"} />
            <Spec icon={<Clock className="h-4 w-4" />} label={t(locale, "detail.listed")} value={car.createdAt.toLocaleDateString()} />
          </dl>
        </div>
      </div>

      {/* Description / AI ad copy */}
      <div className="mt-12">
        {car.adCopy ? (
          <section className="relative overflow-hidden rounded-xl border border-accent/30 bg-accent/5 p-8 sm:p-10">
            <Sparkles className="absolute right-6 top-6 h-6 w-6 text-accent/40" strokeWidth={2} />
            <p className="label text-[10px] text-accent">{t(locale, "detail.aiCopy")}</p>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground sm:text-xl">
              {car.adCopy}
            </p>
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-surface p-8 shadow-sm sm:p-10">
            <h2 className="label text-[10px] text-secondary">{t(locale, "detail.description")}</h2>
            {car.description ? (
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground">
                {car.description}
              </p>
            ) : (
              <p className="mt-4 text-secondary">{t(locale, "detail.noDescription")}</p>
            )}
            <p className="mt-4 text-xs italic text-secondary">
              {t(locale, "detail.notEnhanced")}
            </p>
          </section>
        )}
      </div>

      {/* Buyer AI insights — deal verdict + inspection checklist */}
      <div className="mt-12">
        <BuyerInsightsPanel
          carId={car.id}
          make={car.make}
          model={car.model}
          year={car.year}
          cachedInsight={cachedInsight}
        />
      </div>
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface p-4">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <dt className="label text-[10px]">{label}</dt>
      </div>
      <dd className="mt-1 font-display text-base font-bold text-primary">{value}</dd>
    </div>
  );
}
