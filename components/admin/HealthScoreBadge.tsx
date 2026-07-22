import { Gauge } from "lucide-react";

// Block-style health score pill. 0-40 red, 41-70 amber, 71-100 green.
function band(score: number): { cls: string } {
  if (score >= 71) return { cls: "bg-trust-green/10 text-trust-green ring-trust-green/30" };
  if (score >= 41) return { cls: "bg-amber-100 text-amber-700 ring-amber-300" };
  return { cls: "bg-accent/10 text-accent ring-accent/30" };
}

export function HealthScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return (
      <span
        title="Not yet analyzed"
        className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-secondary ring-1 ring-inset ring-border"
      >
        –
      </span>
    );
  }

  const { cls } = band(score);
  return (
    <span
      title={`Health score ${score}/100`}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${cls}`}
    >
      <Gauge className="h-3 w-3" strokeWidth={2.5} />
      {score}
    </span>
  );
}
