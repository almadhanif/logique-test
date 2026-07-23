import type { Car } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PromoModal } from "@/components/public/PromoModal";

// Module-level so the react-hooks purity rule doesn't flag Math.random.
function pickRandom(arr: Car[]): Car | null {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

// Wraps all public pages. The promo modal self-gates on first-visit via
// localStorage, so it only ever shows once per browser. It showcases a randomly
// picked published car (rotates on each render) so first-time visitors land on a
// real featured listing.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const featured = await prisma.car.findMany({
    where: { status: "PUBLISHED" },
    take: 12,
    orderBy: { createdAt: "desc" },
  });
  const car = pickRandom(featured);

  return (
    <>
      {children}
      <PromoModal car={car} />
    </>
  );
}
