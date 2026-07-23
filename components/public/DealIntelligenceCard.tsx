import { BadgeCheck, ThumbsUp, Scale, AlertTriangle, BarChart3, Lightbulb } from "lucide-react";
import type { BuyerInsight, DealVerdict } from "@/lib/types";

const verdictConfig: Record<
  DealVerdict,
  { bg: string; border: string; badge: string; icon: typeof BadgeCheck }
> = {
  GREAT_DEAL: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    icon: BadgeCheck,
  },
  GOOD_DEAL: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    icon: ThumbsUp,
  },
  FAIR_DEAL: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    icon: Scale,
  },
  OVERPRICED: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
};

export function DealIntelligenceCard({ insight }: { insight: BuyerInsight }) {
  const config = verdictConfig[insight.dealVerdict] ?? verdictConfig.FAIR_DEAL;
  const VerdictIcon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5 shadow-sm`}>
      {/* Verdict badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-bold uppercase tracking-wide ${config.badge}`}>
          <VerdictIcon className="h-4 w-4" strokeWidth={2.5} />
          {insight.verdictLabel}
        </span>
      </div>

      {/* Explanation */}
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        {insight.dealExplanation}
      </p>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Price assessment */}
      <div>
        <p className="label flex items-center gap-1.5 text-[10px] text-secondary">
          <BarChart3 className="h-3.5 w-3.5" strokeWidth={2.5} />
          Penilaian Harga
        </p>
        <p className="mt-1 text-sm text-foreground">{insight.priceAssessment}</p>
      </div>

      {/* Negotiation tip */}
      <div className="mt-3">
        <p className="label flex items-center gap-1.5 text-[10px] text-secondary">
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.5} />
          Tips Negosiasi
        </p>
        <p className="mt-1 text-sm text-foreground">{insight.negotiationTip}</p>
      </div>
    </div>
  );
}
