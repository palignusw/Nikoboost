import { wowSeason, delvePrices, delveLocations } from "@/data/season";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar/Navbar";
import Delves from "./Delves";
export const metadata: Metadata = {
  title: `Delves Boost for Gold | ${wowSeason.name}`,
  description: `Build your ${wowSeason.expansion} Delves run: Tier ${Math.min(...Object.keys(delvePrices).map(Number))}–${Math.max(...Object.keys(delvePrices).map(Number))}, regular or Bountiful, ${delveLocations.length} locations, weekly World Vault bundles. Self-play, EU and NA. Pay with in-game gold.`,
  alternates: { canonical: "/delves" },
  openGraph: {
    title: "Delves for Gold | NikoBoost",
    description: `Your next expedition, your way. ${wowSeason.name} Delves and weekly bundles.`,
    url: "/delves",
  },
};
export default function Page() {
  return (
    <>
      <Navbar />
      <Delves />
    </>
  );
}
