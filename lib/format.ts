// Display formatting helpers.

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("en-US");

/** Format a price (stored as IDR) e.g. 185000000 -> "Rp185.000.000". */
export function formatPrice(value: number): string {
  return IDR.format(value);
}

/** Format a mileage value with thousands separators, e.g. 82000 -> "82,000 km". */
export function formatMileage(km: number): string {
  return `${NUMBER.format(km)} km`;
}

/** Format an arbitrary number with thousands separators. */
export function formatNumber(value: number): string {
  return NUMBER.format(value);
}
