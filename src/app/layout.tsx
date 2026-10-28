import { siteOrigin } from "@/lib/pageSeo";
import { serviceContent } from "@/data/season";

import type { Metadata } from "next";
import { Suspense } from "react";
import BookingAnalytics from "@/components/Analytics/BookingAnalytics";
import { Analytics } from "@vercel/analytics/next";
import "./globals.scss";
import { Sora, Rajdhani } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "NikoBoost | WoW Boosting for Gold",
    template: "%s | NikoBoost",
  },
  description: serviceContent.home.metaDescription,
  applicationName: "NikoBoost",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sora.variable} ${rajdhani.variable}`}>
        {children}

        <BookingAnalytics
          websiteId={process.env.VERCEL_ENV === "production" ? process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID : undefined}
          hostname={new URL(siteOrigin).hostname}
        />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
