"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionaries";

// First-visit promotional modal. Shows once per browser (localStorage flag),
// and rotates which promo it shows (random pick each time it would appear).
// Content is bilingual, driven by the locale cookie.

const SEEN_KEY = "autolisting_promo_seen_v1";

type Promo = {
  icon: typeof Sparkles;
  badge: { en: string; id: string };
  title: { en: string; id: string };
  body: { en: string; id: string };
  cta: { en: string; id: string };
};

const PROMOS: Promo[] = [
  {
    icon: Sparkles,
    badge: { en: "Welcome", id: "Selamat datang" },
    title: { en: "Find your next ride", id: "Temukan mobil impianmu" },
    body: {
      en: "Verified used-car listings with AI-polished descriptions and marketability scoring.",
      id: "Daftar mobil bekas terverifikasi dengan deskripsi dipoles AI dan skor daya jual.",
    },
    cta: { en: "Start browsing", id: "Mulai menjelajah" },
  },
  {
    icon: Sparkles,
    badge: { en: "AI pricing", id: "Harga AI" },
    title: { en: "Every car, AI-scored", id: "Setiap mobil dinilai AI" },
    body: {
      en: "See a marketability health score and a suggested price range for each listing.",
      id: "Lihat skor daya jual dan rentang harga yang disarankan untuk tiap daftar.",
    },
    cta: { en: "See how it works", id: "Lihat caranya" },
  },
  {
    icon: Sparkles,
    badge: { en: "Fresh inventory", id: "Stok terbaru" },
    title: { en: "New listings, daily", id: "Daftar baru, setiap hari" },
    body: {
      en: "Browse the latest additions and filter by make, year, price, and mileage.",
      id: "Jelajahi tambahan terbaru dan filter berdasarkan merek, tahun, harga, dan kilometer.",
    },
    cta: { en: "Browse now", id: "Jelajahi sekarang" },
  },
];

function readLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
  const v = match?.split("=")[1];
  return v === "id" || v === "en" ? (v as Locale) : DEFAULT_LOCALE;
}

export function PromoModal() {
  type ModalState = { open: boolean; promo: Promo; locale: Locale };
  const [state, setState] = useState<ModalState>({
    open: false,
    promo: PROMOS[0],
    locale: DEFAULT_LOCALE,
  });

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;

    // First visit: open with a randomly-rotated promo + the current locale.
    // This is a client-only gate (localStorage), so it must run after mount —
    // a justified setState-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      open: true,
      promo: PROMOS[Math.floor(Math.random() * PROMOS.length)],
      locale: readLocale(),
    });
  }, []);

  function close() {
    setState((s) => ({ ...s, open: false }));
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Ignore storage failures — modal just won't be suppressed next time.
    }
  }

  // Close on Escape.
  useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open]);

  if (!state.open) return null;
  const promo = state.promo;
  const locale = state.locale;
  const Icon = promo.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="reveal relative w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark header block */}
        <div className="relative bg-primary px-6 py-8 text-on-primary">
          <div className="block-grid absolute inset-0 opacity-60" aria-hidden />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-on-primary/70 transition-colors hover:bg-on-primary/10 hover:text-on-primary"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <div className="relative">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-md">
              <Icon className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <p className="label mt-4 text-[10px] text-accent">
              {promo.badge[locale]}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-tight">
              {promo.title[locale]}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm leading-relaxed text-secondary">
            {promo.body[locale]}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/"
              onClick={close}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px"
            >
              {promo.cta[locale]}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-primary"
            >
              {locale === "id" ? "Nanti saja" : "Maybe later"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
