"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, Check, X } from "lucide-react";
import type { Make } from "@/lib/generated/prisma/client";
import { useToast } from "@/components/ui/Toast";

export function MakesManager({ makes }: { makes: Make[] }) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/makes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, country: newCountry }),
    });
    if (res.ok) {
      setNewName("");
      setNewCountry("");
      toast("Make added");
      startTransition(() => router.refresh());
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to add make", "error");
    }
  }

  function startEdit(m: Make) {
    setEditId(m.id);
    setEditName(m.name);
    setEditCountry(m.country ?? "");
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/makes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, country: editCountry }),
    });
    if (res.ok) {
      setEditId(null);
      toast("Make updated");
      startTransition(() => router.refresh());
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to update make", "error");
    }
  }

  async function remove(m: Make) {
    if (
      !window.confirm(
        `Delete "${m.name}" from the catalog? Existing cars keep their make name.`,
      )
    )
      return;
    const res = await fetch(`/api/makes/${m.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Make deleted");
      startTransition(() => router.refresh());
    } else {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Failed to delete make", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form
        onSubmit={add}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm"
      >
        <label className="block flex-1">
          <span className="label mb-1.5 block text-[10px] text-secondary">
            Make
          </span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Tesla"
            className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-secondary focus:border-primary"
          />
        </label>
        <label className="block w-full sm:w-48">
          <span className="label mb-1.5 block text-[10px] text-secondary">
            Country
          </span>
          <input
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="e.g. USA"
            className="h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-secondary focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={isPending || !newName.trim()}
          className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add
        </button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        {makes.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-secondary">
            No manufacturers yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {makes.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                {editId === m.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country"
                      className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => saveEdit(m.id)}
                      className="cursor-pointer rounded-md bg-trust-green p-2 text-white transition hover:opacity-90"
                      aria-label="Save"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="cursor-pointer rounded-md bg-muted p-2 text-secondary transition hover:opacity-80"
                      aria-label="Cancel"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                        {m.name}
                      </p>
                      <p className="text-xs text-secondary">
                        {m.country ?? "—"}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(m)}
                      className="cursor-pointer rounded-md p-2 text-secondary transition hover:bg-muted hover:text-primary"
                      aria-label={`Edit ${m.name}`}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => remove(m)}
                      className="cursor-pointer rounded-md p-2 text-accent transition hover:bg-accent/10"
                      aria-label={`Delete ${m.name}`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
