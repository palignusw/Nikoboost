
import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.scss";
import { Sora, Rajdhani } from "next/font/google";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.nikoboost.online";


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
  metadataBase: new URL(siteUrl),

  

  title: {
    default: "NikoBoost | WoW Mythic+ Boosting for Gold",
    template: "%s | NikoBoost",
  },

  description:
    "NikoBoost offers World of Warcraft Mythic+ boosting for in-game gold. Customize your key level, dungeon runs, loot traders and schedule. EU and NA regions.",

  applicationName: "NikoBoost",

  keywords: [
    "WoW Mythic+ Boost",
    "WoW Mythic Plus Boosting",
    "Mythic+ Carry",
    "WoW Gold Boosting",
    "WoW Dungeon Carry",
    "Mythic Plus EU",
    "Mythic Plus NA",
    "NikoBoost",
  ],

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "NikoBoost",
    title: "NikoBoost | WoW Mythic+ Boosting for Gold",
    description:
      "Build your Mythic+ run. Choose your key level, dungeons, loot traders and schedule. Pay with in-game gold.",
  },

  twitter: {
    card: "summary_large_image",
    title: "NikoBoost | WoW Mythic+ Boosting",
    description:
      "Customize your WoW Mythic+ carry with NikoBoost. EU & NA. In-game gold.",
  },

  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${rajdhani.variable}`} >
        {children}

        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
