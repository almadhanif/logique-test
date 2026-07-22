// Pure i18n data + translator (no server-only imports, safe for client use).

export type Locale = "en" | "id";
export const LOCALES: Locale[] = ["en", "id"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  id: "ID",
};

const en = {
  "nav.browse": "Browse",
  "nav.admin": "Admin",

  "hero.tag": "// used-car marketplace",
  "hero.title1": "Find your",
  "hero.title2": "next ride",
  "hero.subtitle":
    "Verified listings with AI-polished descriptions and marketability scoring. {count} cars available right now.",
  "stat.listings": "Listings",
  "stat.pricing": "Pricing",
  "stat.currency": "Currency",

  "browse.featured": "Featured listings",
  "browse.filtersActive": "{count} filters active",
  "browse.filterActive": "1 filter active",
  "browse.noMatches": "No matches",
  "browse.noMatchesHint": "Adjust your filters to see more cars.",
  "browse.loadingMore": "Loading more…",
  "browse.end": "You've seen all {count} listings",

  "search.placeholder": "Search make or model…",
  "search.button": "Search",

  "filter.title": "Filters",
  "filter.clear": "Clear",
  "filter.make": "Make",
  "filter.allMakes": "All makes",
  "filter.year": "Year",
  "filter.price": "Price (IDR)",
  "filter.maxMileage": "Max mileage (km)",
  "filter.min": "Min",
  "filter.max": "Max",
  "filter.updating": "Updating…",

  "detail.back": "Back to listings",
  "detail.price": "Price",
  "detail.mileage": "Mileage",
  "detail.year": "Year",
  "detail.color": "Color",
  "detail.listed": "Listed",
  "detail.aiCopy": "// AI listing copy",
  "detail.description": "Description",
  "detail.noDescription": "No description provided.",
  "detail.notEnhanced": "Not yet AI-enhanced — an admin can generate polished ad copy.",

  "footer.tagline": "Drive the future",
};

const id: Record<keyof typeof en, string> = {
  "nav.browse": "Jelajahi",
  "nav.admin": "Admin",

  "hero.tag": "// pasar mobil bekas",
  "hero.title1": "Temukan",
  "hero.title2": "mobil impianmu",
  "hero.subtitle":
    "Daftar terverifikasi dengan deskripsi dipoles AI dan skor daya jual. {count} mobil tersedia sekarang.",
  "stat.listings": "Daftar",
  "stat.pricing": "Harga",
  "stat.currency": "Mata uang",

  "browse.featured": "Daftar unggulan",
  "browse.filtersActive": "{count} filter aktif",
  "browse.filterActive": "1 filter aktif",
  "browse.noMatches": "Tidak ada hasil",
  "browse.noMatchesHint": "Ubah filter Anda untuk melihat lebih banyak mobil.",
  "browse.loadingMore": "Memuat lagi…",
  "browse.end": "Anda telah melihat semua {count} daftar",

  "search.placeholder": "Cari merek atau model…",
  "search.button": "Cari",

  "filter.title": "Filter",
  "filter.clear": "Bersihkan",
  "filter.make": "Merek",
  "filter.allMakes": "Semua merek",
  "filter.year": "Tahun",
  "filter.price": "Harga (IDR)",
  "filter.maxMileage": "KM maksimal",
  "filter.min": "Min",
  "filter.max": "Maks",
  "filter.updating": "Memperbarui…",

  "detail.back": "Kembali ke daftar",
  "detail.price": "Harga",
  "detail.mileage": "Kilometer",
  "detail.year": "Tahun",
  "detail.color": "Warna",
  "detail.listed": "Didaftar",
  "detail.aiCopy": "// deskripsi AI",
  "detail.description": "Deskripsi",
  "detail.noDescription": "Tidak ada deskripsi.",
  "detail.notEnhanced": "Belum dipoles AI — admin bisa membuat deskripsi menarik.",

  "footer.tagline": "Berkendar masa depan",
};

export const dict: Record<Locale, Record<string, string>> = { en, id };

export type DictKey = keyof typeof en;

export function t(
  locale: Locale,
  key: DictKey,
  vars?: Record<string, string | number>,
): string {
  let s = dict[locale][key] ?? dict.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}
