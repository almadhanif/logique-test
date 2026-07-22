import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cars = await prisma.car.findMany({ orderBy: { updatedAt: "desc" } });

  const counts = cars.reduce(
    (acc, c) => {
      acc[c.status] += 1;
      return acc;
    },
    { DRAFT: 0, PUBLISHED: 0, SOLD: 0 },
  );

  const analyzed = cars.filter((c) => c.healthScore !== null).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Dashboard" },
        ]}
      />
      <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Listings pipeline
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {cars.length} total · {counts.PUBLISHED} live · {counts.DRAFT} draft ·{" "}
            {counts.SOLD} sold · {analyzed} analyzed
          </p>
          <p className="mt-1 text-xs text-secondary">
            Drag a card to the next column to advance its status (Draft →
            Published → Sold).
          </p>
        </div>
        <Link
          href="/admin/cars/new"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add listing
        </Link>
      </div>

      <KanbanBoard initialCars={cars} />
    </div>
  );
}
