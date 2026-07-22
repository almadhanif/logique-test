import { CarForm } from "@/components/admin/CarForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const makes = await prisma.make.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <div className="app-container py-10">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "New listing" },
        ]}
      />
      <h1 className="mb-6 mt-5 font-display text-3xl font-semibold tracking-tight text-primary">
        New listing
      </h1>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <CarForm mode="create" makes={makes} />
      </div>
    </div>
  );
}
