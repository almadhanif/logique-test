import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/admin/KanbanBoard";
import { LogoutButton } from "@/components/admin/LogoutButton";

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
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
            Admin
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Listings pipeline
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {cars.length} total · {counts.PUBLISHED} live · {counts.DRAFT} draft ·{" "}
            {counts.SOLD} sold · {analyzed} analyzed
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            Drag a card to the next column to advance its status (Draft →
            Published → Sold).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
          <Link
            href="/admin/cars/new"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
          >
            + Add listing
          </Link>
        </div>
      </div>

      <KanbanBoard initialCars={cars} />
    </div>
  );
}
