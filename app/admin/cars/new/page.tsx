import Link from "next/link";
import { CarForm } from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";

export default function NewCarPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/admin/dashboard"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
      >
        ← Back to listings
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-ink">
        New listing
      </h1>
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <CarForm mode="create" />
      </div>
    </div>
  );
}
