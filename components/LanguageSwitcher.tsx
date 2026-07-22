"use client";

import { useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LOCALES,
  LOCALE_LABELS,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/dictionaries";

// UI language toggle (ID / EN). The locale lives in a cookie (readable by server
// components during SSR). We read it with useSyncExternalStore so there's no
// setState-in-effect and no hydration mismatch.

const subscribers = new Set<() => void>();
function subscribe(cb: () => void) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
function notify() {
  subscribers.forEach((fn) => fn());
}
function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
  const v = match?.split("=")[1];
  return v === "id" || v === "en" ? (v as Locale) : DEFAULT_LOCALE;
}

// Module-level (outside any component/hook) so the react-hooks rule doesn't
// misflag the document.cookie setter assignment.
function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const active = useSyncExternalStore(
    subscribe,
    readCookieLocale,
    () => DEFAULT_LOCALE,
  );

  function choose(next: Locale) {
    writeLocaleCookie(next);
    notify(); // update the toggle immediately (optimistic)
    startTransition(() => router.refresh()); // re-render server components
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-lg border border-border bg-background p-0.5"
    >
      {LOCALES.map((loc) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => choose(loc)}
            aria-pressed={isActive}
            className={`cursor-pointer rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              isActive
                ? "bg-primary text-on-primary"
                : "text-secondary hover:text-primary"
            } ${isPending ? "opacity-60" : ""}`}
          >
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
