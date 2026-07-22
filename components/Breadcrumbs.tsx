import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

// Lightweight breadcrumb nav. The last item is rendered as plain text
// (the current page); earlier items with an `href` are links.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs"
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.href && !last ? (
              <Link
                href={item.href}
                className="label text-secondary transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ) : (
              <span className="label text-primary">{item.label}</span>
            )}
            {!last ? (
              <ChevronRight
                className="h-3 w-3 text-border"
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
