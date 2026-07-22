import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MakesManager } from "@/components/admin/MakesManager";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function MakesPage() {
  const makes = await prisma.make.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="app-container py-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Manufacturers" },
        ]}
      />
      <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-primary sm:text-4xl">
            Manufacturers
          </h1>
          <p className="mt-2 text-sm text-secondary">
            {makes.length} in the catalog. These power the make dropdown in the car form.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
          Back
        </Link>
      </div>

      <MakesManager makes={makes} />
    </div>
  );
}
