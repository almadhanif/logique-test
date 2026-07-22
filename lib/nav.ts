// Pure helper to build a URL that updates one or more query params while
// preserving the others. Used by client components (SearchBar / FilterPanel)
// via next/navigation's router.

export function buildSearchPath(
  base: string,
  current: URLSearchParams,
  updates: Record<string, string | number | undefined>,
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "" || Number.isNaN(value)) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}
