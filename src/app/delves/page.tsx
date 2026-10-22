import type { Metadata } from "next";
import Navbar from "@/components/Navbar/Navbar";
import Delves from "./Delves";
export const metadata: Metadata = {
  title: "Delves Boost for Gold | Midnight Season 2",
  description:
    "Build your Midnight Delves run: Tier 1–11, regular or Bountiful, 12 locations, weekly World Vault bundles. Self-play, EU and NA. Pay with in-game gold.",
  alternates: { canonical: "/delves" },
  openGraph: {
    title: "Delves for Gold | NikoBoost",
    description:
      "Your next expedition, your way. Tier 1–11 Delves and weekly bundles.",
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
