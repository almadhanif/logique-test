import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Search } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export async function SiteHeader() {
  const authed = await isAuthenticated();
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="app-container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="AutoListing — home"
        >
          <Image
            src="/logique-logo.png"
            alt="AutoListing"
            width={40}
            height={60}
            priority
            className="h-10 w-auto"
          />
          <span className="hidden font-display text-sm font-bold uppercase tracking-[0.18em] text-primary sm:inline">
            AutoListing
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-secondary transition-colors hover:bg-muted hover:text-primary"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
            <span className="label text-xs">{t(locale, "nav.browse")}</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 font-bold text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px"
          >
            <LayoutDashboard className="h-4 w-4" strokeWidth={2.5} />
            <span className="label text-xs">{t(locale, "nav.admin")}</span>
          </Link>
          {authed ? (
            <span className="ml-1 hidden items-center gap-2 border-l border-border pl-2 sm:flex">
              <LogoutButton />
            </span>
          ) : null}
        </nav>
      </div>

      {/* Authenticated compact bar — logout on small screens where the nav is tight. */}
      {authed ? (
        <div className="flex items-center justify-end border-t border-border px-4 py-2 sm:hidden">
          <LogoutButton />
        </div>
      ) : null}
    </header>
  );
}
