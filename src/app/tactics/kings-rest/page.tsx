import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import KingsGuide from "./KingsGuide";
export const metadata: Metadata = {
  title: "Kings’ Rest — Animated Mythic+ Boss Tactics",
  description:
    "Learn all four Kings’ Rest bosses with animated mechanics, role advice and practice decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/kings-rest` },
};
export default function Page() {
  return <KingsGuide />;
}
