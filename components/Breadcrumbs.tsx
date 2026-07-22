import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

// Breadcrumb nav, given more visual weight: a bordered bar with bold,
// high-contrast labels and accent chevrons. The last item is the current page
// (rendered as plain text in the accent color).
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 shadow-sm"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {item.href && !last ? (
              <Link
                href={item.href}
                className="label cursor-pointer text-sm font-bold text-primary transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="label text-sm font-bold text-accent"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
            {!last ? (
              <ChevronRight
                className="h-4 w-4 text-accent/70"
                strokeWidth={2.5}
                aria-hidden
              />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
