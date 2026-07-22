import { prisma } from "@/lib/prisma";
import { PromoModal } from "@/components/public/PromoModal";

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
  const car = featured.length
    ? featured[Math.floor(Math.random() * featured.length)]
    : null;

  return (
    <>
      {children}
      <PromoModal car={car} />
    </>
  );
}
