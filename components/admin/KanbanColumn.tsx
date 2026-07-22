"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Car, Status } from "@/lib/generated/prisma/client";
import { KanbanCard } from "@/components/admin/KanbanCard";

const HEADER: Record<Status, { label: string; dot: string; tint: string }> = {
  DRAFT: { label: "Draft", dot: "bg-stone-400", tint: "ring-stone-400" },
  PUBLISHED: { label: "Published", dot: "bg-emerald-500", tint: "ring-emerald-500" },
  SOLD: { label: "Sold", dot: "bg-sky-500", tint: "ring-sky-500" },
};

export function KanbanColumn({
  status,
  cars,
  onEdit,
  onDelete,
}: {
  status: Status;
  cars: Car[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const head = HEADER[status];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${head.dot}`} />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">
          {head.label}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-secondary">
          {cars.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[160px] flex-1 flex-col gap-2.5 rounded-2xl border-2 border-dashed p-2.5 transition-all ${
          isOver
            ? `border-transparent bg-accent/10 ring-2 ${head.tint}`
            : "border-border bg-background/40"
        }`}
      >
        {cars.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-8 text-xs text-secondary">
            No listings
          </div>
        ) : (
          cars.map((car) => (
            <KanbanCard key={car.id} car={car} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
