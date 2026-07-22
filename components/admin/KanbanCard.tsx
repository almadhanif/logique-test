"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Car } from "@/lib/generated/prisma/client";
import { HealthScoreBadge } from "@/components/admin/HealthScoreBadge";
import { formatMileage, formatPrice } from "@/lib/format";

export function KanbanCard({
  car,
  onEdit,
  onDelete,
}: {
  car: Car;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: car.id,
      data: { status: car.status },
    });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group cursor-grab touch-none select-none rounded-xl border border-line bg-surface p-3 shadow-sm transition-all active:cursor-grabbing ${
        isDragging ? "opacity-40" : "hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-ink">
            {car.make} {car.model}
          </p>
          <p className="text-xs text-ink-faint">
            {car.year} · {formatMileage(car.mileage)}
          </p>
        </div>
        <HealthScoreBadge score={car.healthScore} />
      </div>

      <p className="mt-2 font-display text-lg font-semibold text-ink">
        {formatPrice(car.price)}
      </p>

      {/* Action row — stop pointerdown so clicks don't start a drag */}
      <div
        className="mt-2 flex items-center gap-1 border-t border-line pt-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onEdit(car.id)}
          className="rounded-md px-2 py-1 text-xs font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
        >
          Edit
        </button>
        {car.status === "DRAFT" ? (
          <button
            type="button"
            onClick={() => onDelete(car.id)}
            className="rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
