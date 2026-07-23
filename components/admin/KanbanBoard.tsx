"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Car, Status } from "@/lib/generated/prisma/client";
import { KanbanColumn } from "@/components/admin/KanbanColumn";
import { useToast } from "@/components/ui/Toast";

const COLUMNS: Status[] = ["DRAFT", "PUBLISHED", "SOLD"];

export function KanbanBoard({ initialCars }: { initialCars: Car[] }) {
  const router = useRouter();
  const toast = useToast();
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Filter cards by search query (make, model, year — case-insensitive).
  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cars;
    return cars.filter((c) => {
      const hay = `${c.make} ${c.model} ${c.year}`.toLowerCase();
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [cars, search]);

  const byStatus = useMemo(() => {
    const groups: Record<Status, Car[]> = {
      DRAFT: [],
      PUBLISHED: [],
      SOLD: [],
    };
    for (const car of filteredCars) groups[car.status].push(car);
    return groups;
  }, [filteredCars]);

  const activeCar = activeId
    ? (cars.find((c) => c.id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const carId = active.id as string;
    const newStatus = over.id as Status;
    const currentStatus = (active.data.current?.status ??
      null) as Status | null;
    const car = cars.find((c) => c.id === carId);
    if (!car || !currentStatus) return;

    // Same column — nothing to do.
    if (currentStatus === newStatus) return;

    // Optimistic update. Any status -> any status is allowed.
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, status: newStatus } : c)),
    );

    // Persist via the existing status route (server is source of truth).
    void moveStatus(carId, currentStatus, newStatus);
  }

  async function moveStatus(
    carId: string,
    currentStatus: Status,
    newStatus: Status,
  ) {
    const res = await fetch(`/api/cars/${carId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      // Revert optimistic update.
      setCars((prev) =>
        prev.map((c) => (c.id === carId ? { ...c, status: currentStatus } : c)),
      );
      const data = await res.json().catch(() => ({}));
      toast(
        data.error ?? "Failed to update status. Please try again.",
        "error",
      );
    } else {
      toast(`Moved to ${newStatus.toLowerCase()}`, "success");
      // Keep server data in sync (e.g. updated timestamps) without a flash.
      router.refresh();
    }
  }

  function handleEdit(id: string) {
    router.push(`/admin/cars/${id}/edit`);
  }

  async function handleDelete(id: string) {
    const car = cars.find((c) => c.id === id);
    if (!car) return;
    if (
      !window.confirm(
        `Delete draft "${car.make} ${car.model}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCars((prev) => prev.filter((c) => c.id !== id));
      toast("Draft deleted");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to delete", "error");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
          strokeWidth={2.5}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search names…"
          className="h-11 w-full cursor-text rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-primary"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-secondary transition-colors hover:bg-muted hover:text-primary"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            cars={byStatus[status]}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCar ? (
          <div className="rotate-2 cursor-grabbing rounded-lg border border-zinc-200 bg-white p-3 shadow-xl">
            <p className="font-semibold text-zinc-900">
              {activeCar.make} {activeCar.model}
            </p>
            <p className="text-xs text-zinc-500">
              {activeCar.year} · {activeCar.status}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
