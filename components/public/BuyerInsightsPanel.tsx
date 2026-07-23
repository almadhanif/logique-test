"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import type { BuyerInsight } from "@/lib/types";
import { DealIntelligenceCard } from "@/components/public/DealIntelligenceCard";
import { InspectionChecklist } from "@/components/public/InspectionChecklist";

type Status = "idle" | "loading" | "success" | "error";

export function BuyerInsightsPanel({
  carId,
  make,
  model,
  year,
  cachedInsight,
}: {
  carId: string;
  make: string;
  model: string;
  year: number;
  cachedInsight?: BuyerInsight | null;
}) {
  const [status, setStatus] = useState<Status>(
    cachedInsight ? "success" : "idle",
  );
  const [insight, setInsight] = useState<BuyerInsight | null>(
    cachedInsight ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/ai/buyer-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Gagal memuat analisis.");
        return;
      }
      setInsight(data.insight as BuyerInsight);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Gagal memuat analisis. Coba lagi.");
    }
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-accent" strokeWidth={2.5} />
        <h2 className="label text-sm text-primary">
          Analisis AI untuk Pembeli
        </h2>
      </div>

      {/* Idle */}
      {status === "idle" ? (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-secondary">
            Dapatkan penilaian harga dan panduan inspeksi khusus untuk mobil
            ini, gratis.
          </p>
          <button
            type="button"
            onClick={generate}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Analisis Sekarang
          </button>
        </div>
      ) : null}

      {/* Loading */}
      {status === "loading" ? (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-2 text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
            <p className="text-sm">
              Menganalisis harga pasar dan kondisi kendaraan...
            </p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ) : null}

      {/* Error */}
      {status === "error" ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="text-sm text-accent">{error}</p>
          <button
            type="button"
            onClick={generate}
            className="mt-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:text-accent"
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      {/* Success */}
      {status === "success" && insight ? (
        <>
          <DealIntelligenceCard insight={insight} />
          <InspectionChecklist
            items={insight.inspectionChecklist}
            make={make}
            model={model}
            year={year}
          />
        </>
      ) : null}
    </section>
  );
}
