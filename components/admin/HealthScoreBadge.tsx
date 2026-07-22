// Small color-coded pill for a car's marketability health score.
// Used on Kanban cards and inside the analyzer.

function band(score: number): { cls: string; label: string } {
  if (score >= 71) {
    return { cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", label: "Good" };
  }
  if (score >= 41) {
    return { cls: "bg-amber-100 text-amber-700 ring-amber-200", label: "Fair" };
  }
  return { cls: "bg-red-100 text-red-700 ring-red-200", label: "Weak" };
}

export function HealthScoreBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) {
    return (
      <span
        title="Not yet analyzed"
        className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-200"
      >
        –
      </span>
    );
  }

  const { cls } = band(score);
  return (
    <span
      title={`Health score ${score}/100`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      <span aria-hidden>✨</span>
      {score}
    </span>
  );
}
