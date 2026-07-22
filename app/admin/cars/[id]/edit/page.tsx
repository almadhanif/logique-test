import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CarForm } from "@/components/admin/CarForm";
import type { ExistingAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildExistingAnalysis(car: {
  healthScore: number | null;
  suggestedPriceMin: number | null;
  suggestedPriceMax: number | null;
  analysisSuggestions: string | null;
  lastAnalyzedAt: Date | null;
}): ExistingAnalysis | undefined {
  if (
    car.healthScore === null ||
    car.suggestedPriceMin === null ||
    car.suggestedPriceMax === null ||
    car.lastAnalyzedAt === null
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
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/admin/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
      >
        ← Back to listings
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-ink">
        Edit listing
      </h1>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
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
