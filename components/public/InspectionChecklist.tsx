"use client";

import { useState } from "react";
import { ClipboardCheck, Printer, Check } from "lucide-react";
import type { ChecklistItem } from "@/lib/types";

export function InspectionChecklist({
  items,
  make,
  model,
  year,
}: {
  items: ChecklistItem[];
  make: string;
  model: string;
  year: number;
}) {
  const [checked, setChecked] = useState<boolean[]>(
    () => items.map(() => false),
  );

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="print-target rounded-xl border border-border bg-surface p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label flex items-center gap-1.5 text-sm text-primary">
            <ClipboardCheck className="h-4 w-4" strokeWidth={2.5} />
            Checklist Survey — {make} {model} {year}
          </p>
          <p className="mt-0.5 text-xs text-secondary">
            {items.length} hal yang wajib dicek sebelum deal
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-muted print:hidden"
        >
          <Printer className="h-3.5 w-3.5" strokeWidth={2.5} />
          Cetak
        </button>
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2 print:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-trust-green transition-[width] duration-300"
            style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-bold text-secondary">
          {doneCount}/{items.length} sudah dicek
        </span>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-border" />

      {/* Items */}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full cursor-pointer items-start gap-3 text-left print:hidden"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                  checked[i]
                    ? "border-trust-green bg-trust-green text-white"
                    : "border-border bg-background"
                }`}
              >
                {checked[i] ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : null}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-bold transition-colors ${
                    checked[i] ? "text-secondary line-through" : "text-primary"
                  }`}
                >
                  {item.item}
                </p>
              </div>
            </button>
            {/* Print-only: show a checkbox glyph; screen: show below button */}
            <div className={checked[i] ? "pl-8" : "pl-8"}>
              <p
                className={`text-xs leading-relaxed transition-colors ${
                  checked[i] ? "text-secondary/60 line-through" : "text-secondary"
                }`}
              >
                {item.why}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer hint */}
      <p className="mt-4 border-t border-border pt-3 text-xs italic text-secondary print:hidden">
        Simpan checklist ini untuk dibawa saat survey.
      </p>
    </div>
  );
}
