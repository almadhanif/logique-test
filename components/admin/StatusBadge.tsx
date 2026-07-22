import type { Status } from "@/lib/generated/prisma/client";

const STYLES: Record<Status, string> = {
  DRAFT: "bg-stone-200/70 text-stone-700 ring-stone-300",
  PUBLISHED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  SOLD: "bg-sky-100 text-sky-800 ring-sky-200",
};

const LABELS: Record<Status, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Available",
  SOLD: "Sold",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
