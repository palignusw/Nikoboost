import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import ValeGuide from "./ValeGuide";
export const metadata: Metadata = {
  title: "The Blinding Vale — Animated Mythic+ Boss Tactics",
  description:
    "Learn all four The Blinding Vale bosses with role advice, animated movement, flower soaks, root control, marked cones and beam positioning.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/the-blinding-vale` },
};
export default function Page() {
  return <ValeGuide />;
}
