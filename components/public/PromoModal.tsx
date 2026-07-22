"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight, Car } from "lucide-react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/dictionaries";
import type { Car as CarType } from "@/lib/generated/prisma/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMileage, formatPrice } from "@/lib/format";

// First-visit promotional modal. Shows once per browser (localStorage flag).
// Two-column on desktop (promo left, featured car right) so it's wide and
// balanced; stacks on mobile.

const SEEN_KEY = "autolisting_promo_seen_v1";

type Promo = {
  badge: { en: string; id: string };
  title: { en: string; id: string };
  body: { en: string; id: string };
};

const PROMOS: Promo[] = [
  {
    badge: { en: "Featured", id: "Pilihan" },
    title: { en: "Featured listing", id: "Mobil pilihan" },
    body: {
      en: "A great ride to start with — and many more inside.",
      id: "Mobil bagus untuk memulai — dan banyak lagi di dalam.",
    },
  },
  {
    badge: { en: "Just in", id: "Baru masuk" },
    title: { en: "Fresh off the lot", id: "Baru datang" },
    body: {
      en: "One of our latest listings. Tap for full details.",
      id: "Salah satu daftar terbaru. Klik untuk detail lengkap.",
    },
  },
  {
    badge: { en: "Deal", id: "Tawaran" },
    title: { en: "Worth a look", id: "Layak dilihat" },
    body: {
      en: "AI-scored for marketability. Browse the rest anytime.",
      id: "Dinilai AI untuk daya jual. Jelajahi kapan saja.",
    },
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

export function PromoModal({ car }: { car: CarType | null }) {
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
      /* ignore */
    }
  }

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
  const href = car ? `/cars/${car.id}` : "/";
  const cta = car
    ? locale === "id"
      ? "Lihat mobil ini"
      : "View this car"
    : locale === "id"
      ? "Mulai menjelajah"
      : "Start browsing";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div className="flex min-h-full items-center justify-center py-20">
        <div
          className="reveal relative w-5/6 overflow-hidden rounded-2xl bg-surface shadow-xl md:grid md:grid-cols-[2fr_3fr]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close — anchored to the card, above both columns */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-on-primary/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Left column — promo popup */}
          <div className="relative flex flex-col justify-center bg-primary px-7 text-on-primary sm:px-8">
            {/* <div
              className="block-grid absolute inset-0 opacity-60"
              aria-hidden
            /> */}
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-white shadow-md">
                <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <p className="label mt-4 text-[10px] text-accent">
                {promo.badge[locale]}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-tight sm:text-3xl">
                {promo.title[locale]}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-on-primary/80">
                {promo.body[locale]}
              </p>
            </div>
          </div>

          {/* Right column — featured car */}
          <div className="flex flex-col">
            {car ? (
              <Link
                href={href}
                onClick={close}
                className="group block cursor-pointer flex-1"
              >
                {/* Image */}
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-primary md:aspect-auto md:h-44 lg:h-52">
                  <div
                    className="block-grid absolute inset-0 opacity-60"
                    aria-hidden
                  />
                  <Car
                    className="relative h-16 w-16 text-on-primary/90 transition-transform duration-300 group-hover:scale-105"
                    strokeWidth={1.5}
                  />
                  <span className="absolute right-3 top-3 rounded-md bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {car.year}
                  </span>
                </div>
                {/* Details */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-display text-lg font-bold uppercase leading-tight tracking-wide text-primary">
                        {car.make} {car.model}
                      </h3>
                      <p className="mt-1 text-xs text-secondary">
                        {formatMileage(car.mileage)}
                        {car.color ? ` · ${car.color}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={car.status} />
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="label text-[10px] text-secondary">
                        {locale === "id" ? "Harga" : "Price"}
                      </p>
                      <p className="font-display text-xl font-bold text-primary">
                        {formatPrice(car.price)}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent transition-transform duration-200 group-hover:translate-x-0.5">
                      {locale === "id" ? "Lihat" : "View"}
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-4">
              <Link
                href={href}
                onClick={close}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:opacity-90 hover:-translate-y-px"
              >
                {cta}
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
    </div>
  );
}
