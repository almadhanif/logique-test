import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CarForm } from "@/components/admin/CarForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { ExistingAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildExistingAnalysis(car: {
  healthScore: number | null;
  suggestedPriceMin: number | null;
  suggestedPriceMax: number | null;
  analysisSuggestions: string | null;
  lastAnalyzedAt: Date | null;
}): ExistingAnalysis | undefined {
  // The analysis fields are nullable. Treat the analysis as present only when
  // every required field has a value — a partially-populated row (e.g. an
  // analysis that was interrupted) is ignored so the UI re-analyzes.
  //
  // NOTE: compare with `!= null` (not `=== null`): the Prisma v7 driver adapter
  // serializes SQL NULL columns as `undefined`, not `null`, so a strict check
  // would let undefined values through and crash on `.toISOString()` below.
  if (
    car.healthScore == null ||
    car.suggestedPriceMin == null ||
    car.suggestedPriceMax == null ||
    car.lastAnalyzedAt == null
  ) {
    return undefined;
  }
  let suggestions: string[] = [];
  try {
    const parsed = JSON.parse(car.analysisSuggestions ?? "[]");
    if (Array.isArray(parsed)) {
      suggestions = parsed.filter((s): s is string => typeof s === "string");
    }
  } catch {
    suggestions = [];
  }
  return {
    healthScore: car.healthScore,
    suggestedPriceMin: car.suggestedPriceMin,
    suggestedPriceMax: car.suggestedPriceMax,
    analysisSuggestions: suggestions,
    lastAnalyzedAt: car.lastAnalyzedAt.toISOString(),
  };
}

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Edit listing" },
        ]}
      />
      <h1 className="mb-6 mt-5 font-display text-3xl font-semibold tracking-tight text-primary">
        Edit listing
      </h1>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <CarForm
          mode="edit"
          carId={car.id}
          existingAnalysis={buildExistingAnalysis(car)}
          initialValues={{
            make: car.make,
            model: car.model,
            year: car.year,
            mileage: car.mileage,
            price: car.price,
            color: car.color ?? "",
            description: car.description ?? "",
            adCopy: car.adCopy ?? "",
          }}
        />
      </div>
    </div>
  );
}
