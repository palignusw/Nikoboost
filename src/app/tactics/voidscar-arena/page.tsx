import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import VoidscarGuide from "./VoidscarGuide";
export const metadata: Metadata = {
  title: "Voidscar Arena — Animated Mythic+ Boss Tactics",
  description:
    "Learn all three Voidscar Arena bosses with role advice, animated movement, dash lanes, the Creeper and singularity orb positioning.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/voidscar-arena` },
};
export default function Page() {
  return <VoidscarGuide />;
}
