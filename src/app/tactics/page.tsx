import { siteOrigin } from "@/lib/pageSeo";
import type { Metadata } from "next";
import TacticsCatalog from "./TacticsCatalog";
export const metadata: Metadata = {
  title: "Mythic+ Boss Tactics — Animated Dungeon Guides",
  description:
    "Explore the current Mythic+ dungeon bosses with role notes, key-mechanic diagrams and practice decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics` },
};
export default function Page() {
  return <TacticsCatalog />;
}
