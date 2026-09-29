import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "14 on Chartwell | Umhlanga Rocks",
  description:
    "Flame-grilled steaks, slow-cooked curries, seafood and a backlit onyx bar at 14 on Chartwell in Umhlanga Rocks. Reserve a table on WhatsApp.",
  openGraph: {
    title: "14 on Chartwell",
    description: "Flame, slow fire and fine company in Umhlanga Rocks.",
    type: "website",
    locale: "en_ZA",
  },
};

export const viewport: Viewport = {
  themeColor: "#140C0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-ink">{children}</body>
    </html>
  );
}
