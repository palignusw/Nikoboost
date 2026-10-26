import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import MurderGuide from "./MurderGuide";
export const metadata: Metadata = {
  title: "Murder Row — Animated Mythic+ Boss Tactics",
  description:
    "Learn all four Murder Row bosses with role advice, animated movement, cover positioning and gateway practice.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/murder-row` },
};
export default function Page() {
  return <MurderGuide />;
}
