
import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "NikoBoost | WoW Mythic+ Boosting for Gold",
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

    title:
      "NikoBoost | WoW Mythic+ Boosting for Gold",

    description:
      "Build your Mythic+ run. Choose your key level, dungeons, loot traders and schedule. Pay with in-game gold.",

    // Add an image after creating a dedicated
    // 1200x630 Open Graph graphic.
  },

  twitter: {
    card: "summary_large_image",

    title:
      "NikoBoost | WoW Mythic+ Boosting",

    description:
      "Customize your WoW Mythic+ carry with NikoBoost. EU & NA. In-game gold.",
  },

  alternates: {
    canonical: "/",
  },
};
