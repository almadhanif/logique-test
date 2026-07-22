import type { Prisma } from "@/lib/generated/prisma/client";

export type ParsedCarInput = Prisma.CarCreateInput & { adCopy?: string };

// Shared input parsing/validation for create + update. Returns a discriminated
// union so callers can branch cleanly.
export function parseCarInput(body: Record<string, unknown>):
  | { ok: true; data: ParsedCarInput }
  | { ok: false; error: string } {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const num = (v: unknown) => {
    const n = typeof v === "string" ? Number(v) : v;
    return typeof n === "number" && Number.isFinite(n) ? n : NaN;
  };

  const make = str(body.make);
  const model = str(body.model);
  const year = num(body.year);
  const mileage = num(body.mileage);
  const price = num(body.price);
  const color = str(body.color) || undefined;
  const description = str(body.description) || undefined;

  const missing: string[] = [];
  if (!make) missing.push("make");
  if (!model) missing.push("model");
  if (!Number.isFinite(year)) missing.push("year");
  if (!Number.isFinite(mileage)) missing.push("mileage");
  if (!Number.isFinite(price)) missing.push("price");
  if (missing.length) {
    return { ok: false, error: `Missing or invalid fields: ${missing.join(", ")}` };
  }

  if (year < 1900 || year > 2100) {
    return { ok: false, error: "year must be between 1900 and 2100" };
  }
  if (mileage < 0) return { ok: false, error: "mileage must be >= 0" };
  if (price < 0) return { ok: false, error: "price must be >= 0" };

  // adCopy may be explicitly cleared (null) on update.
  const adCopyRaw = body.adCopy;
  const adCopy =
    adCopyRaw === null || adCopyRaw === undefined
      ? undefined
      : typeof adCopyRaw === "string"
        ? adCopyRaw.trim() || undefined
        : undefined;

  return {
    ok: true,
    data: { make, model, year, mileage, price, color, description, adCopy },
  };
}
