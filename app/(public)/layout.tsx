import { PromoModal } from "@/components/public/PromoModal";

// Wraps all public pages. The promo modal self-gates on first-visit via
// localStorage, so it only ever shows once per browser.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PromoModal />
    </>
  );
}
