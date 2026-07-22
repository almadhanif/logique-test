import type { Metadata } from "next";
import { Space_Mono, Syncopate } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

// AutoListing type system: Syncopate (wide/tech display) + Space Mono (body).
// Self-hosted via next/font — no runtime CDN, works inside Docker.
const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-syncopate",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AutoListing — Used Cars",
    template: "%s · AutoListing",
  },
  description:
    "A used-car marketplace with AI-assisted listings. Browse, analyze, and manage inventory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syncopate.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-on-primary">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-2 px-4 py-8 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p className="label opacity-80">© {new Date().getFullYear()} AutoListing</p>
        <p className="label text-accent">Drive the future</p>
      </div>
    </footer>
  );
}
