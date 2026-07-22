import { CarForm } from "@/components/admin/CarForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export default function NewCarPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
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
        <CarForm mode="create" />
      </div>
    </div>
  );
}
