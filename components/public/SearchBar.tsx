"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { buildSearchPath } from "@/lib/nav";
import { t, type Locale } from "@/lib/i18n/dictionaries";

export function SearchBar({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      // scroll:false keeps the user in place — only the listings refresh.
      router.replace(buildSearchPath("/", searchParams, { search: value.trim() }), {
        scroll: false,
      });
    });
  }

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2" role="search">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary"
          strokeWidth={2.5}
        />
        <input
          type="search"
          name="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t(locale, "search.placeholder")}
          className="w-full cursor-text rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-secondary focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" strokeWidth={2.5} />
        <span className="hidden sm:inline">{t(locale, "search.button")}</span>
      </button>
    </form>
  );
}
