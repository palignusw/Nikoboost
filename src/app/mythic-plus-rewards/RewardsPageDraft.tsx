import type { Metadata } from "next";
import RewardsExplorer from "./page";

export const metadata: Metadata = {
  title: "Mythic+ Rewards & Great Vault Guide | NikoBoost",
  description:
    "Explore WoW Midnight Season 2 Mythic+ rewards, compare dungeon loot and Great Vault item levels, and plan your weekly runs.",
  alternates: {
    canonical: "/mythic-plus-rewards",
  },
};

export default function MythicPlusRewardsPage() {
  return <RewardsExplorer />;
}