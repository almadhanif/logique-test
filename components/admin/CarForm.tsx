"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { ListingAnalyzer } from "@/components/admin/ListingAnalyzer";
import type { AICopyFormValues, ExistingAnalysis } from "@/lib/types";

type InitialValues = {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  price?: number;
  color?: string;
  description?: string;
  adCopy?: string | null;
};

export function CarForm({
  mode,
  carId,
  initialValues,
  existingAnalysis,
}: {
  mode: "create" | "edit";
  carId?: string;
  initialValues?: InitialValues;
  existingAnalysis?: ExistingAnalysis;
}) {
  const router = useRouter();
  const toast = useToast();

  const [make, setMake] = useState(initialValues?.make ?? "");
  const [model, setModel] = useState(initialValues?.model ?? "");
  const [year, setYear] = useState(
    initialValues?.year !== undefined ? String(initialValues.year) : "",
  );
  const [mileage, setMileage] = useState(
    initialValues?.mileage !== undefined ? String(initialValues.mileage) : "",
  );
  const [price, setPrice] = useState(
    initialValues?.price !== undefined ? String(initialValues.price) : "",
  );
  const [color, setColor] = useState(initialValues?.color ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [adCopy, setAdCopy] = useState(initialValues?.adCopy ?? "");
  const [submitting, setSubmitting] = useState(false);

  const aiFormValues: AICopyFormValues = {
    make,
    model,
    year,
    mileage,
    price,
    color,
    description,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      make,
      model,
      year: Number(year),
      mileage: Number(mileage),
      price: Number(price),
      color,
      description,
      adCopy,
    };

    const url = mode === "edit" && carId ? `/api/cars/${carId}` : "/api/cars";
    const method = mode === "edit" ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast(mode === "edit" ? "Listing updated" : "Draft created");
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setSubmitting(false);
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Save failed", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Make" required>
          <input
            required
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
            className={inputClass}
          />
        </Field>
        <Field label="Model" required>
          <input
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Camry"
            className={inputClass}
          />
        </Field>
        <Field label="Year" required>
          <input
            required
            type="number"
            min={1900}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2019"
            className={inputClass}
          />
        </Field>
        <Field label="Color">
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Silver"
            className={inputClass}
          />
        </Field>
        <Field label="Mileage (km)" required>
          <input
            required
            type="number"
            min={0}
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="e.g. 82000"
            className={inputClass}
          />
        </Field>
        <Field label="Price (IDR)" required>
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 185000000"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description (raw admin notes)" hint="Informal notes about the car. The AI generator turns these into polished ad copy.">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="e.g. 2019 camry, 82k km, silver, runs great, minor scratch on bumper"
          className={`${inputClass} resize-y`}
        />
      </Field>

      {/* AI feature — embedded below the description field */}
      <div className="rounded-2xl border border-line bg-paper/60 p-4">
        <ListingAnalyzer
          carId={mode === "edit" ? carId : undefined}
          formData={aiFormValues}
          existingAnalysis={existingAnalysis}
        />
      </div>

      <Field label="Ad copy" hint="Polished, buyer-facing copy shown on the public listing. Write your own, or generate it via the AI copy tool.">
        <textarea
          value={adCopy}
          onChange={(e) => setAdCopy(e.target.value)}
          rows={5}
          placeholder="Polished ad copy will appear here…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <Link
          href="/admin/dashboard"
          className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create draft"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:ring-2 focus:ring-accent/20";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-faint">{hint}</span> : null}
    </label>
  );
}
