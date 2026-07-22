import type { Status } from "@/lib/generated/prisma/client";

const STYLES: Record<Status, string> = {
  DRAFT: "bg-muted text-secondary ring-border",
  PUBLISHED: "bg-trust-green/10 text-trust-green ring-trust-green/30",
  SOLD: "bg-trust-blue/10 text-trust-blue ring-trust-blue/30",
};

const LABELS: Record<Status, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Available",
  SOLD: "Sold",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
