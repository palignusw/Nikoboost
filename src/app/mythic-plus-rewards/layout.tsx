import { wowSeason } from "@/data/season";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Mythic+ Rewards & Weekly Vault Planner",
  description: `Plan your Mythic+ week: compare dungeon loot, calculate the runs for your Great Vault goal, estimate Crests and share your plan. ${wowSeason.name}.`,
  alternates: { canonical: "/mythic-plus-rewards" },
  openGraph: {
    title: "Mythic+ Rewards & Weekly Vault Planner | NikoBoost",
    description:
      "Choose your Vault goal. Find your next runs. Save and share your weekly Mythic+ plan.",
    url: "/mythic-plus-rewards",
  },
  twitter: {
    card: "summary",
    title: "Mythic+ Rewards & Weekly Vault Planner",
    description: "Compare rewards, build your week and share your plan.",
  },
};

export default function RewardsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
