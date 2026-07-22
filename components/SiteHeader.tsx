import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Logique Motors — home"
        >
          <Image
            src="/logique-logo.png"
            alt="Logique Motors"
            width={40}
            height={40}
            priority
            className="h-10 w-10 transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-2 font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
          >
            Browse
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-ink/15 bg-ink px-4 py-2 font-semibold text-paper transition-all hover:bg-accent hover:border-accent"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
