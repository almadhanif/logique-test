// Display formatting helpers.
//
// These intentionally avoid Intl/NumberFormat. ICU data differs between the
// Node server runtime and the browser (e.g. the IDR currency symbol renders as
// "Rp185.000.000" on Node but "Rp 185.000.000" with a narrow no-break space in
// browsers), which causes React hydration mismatches. Manual grouping is fully
// deterministic across runtimes.

function groupThousands(value: number, separator: "." | ","): string {
  if (!Number.isFinite(value)) return "0";
  const sign = value < 0 ? "-" : "";
  const digits = Math.round(Math.abs(value)).toString();
  // Insert a separator before every group of three digits from the right.
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return `${sign}${grouped}`;
}

/** Format a price (stored as IDR) e.g. 185000000 -> "Rp185.000.000". */
export function formatPrice(value: number): string {
  return `Rp${groupThousands(value, ".")}`;
}

/** Format a mileage value with thousands separators, e.g. 82000 -> "82,000 km". */
export function formatMileage(km: number): string {
  return `${groupThousands(km, ",")} km`;
}

/** Format an arbitrary number with thousands separators. */
export function formatNumber(value: number): string {
  return groupThousands(value, ",");
}
