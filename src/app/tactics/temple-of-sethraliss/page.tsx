import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import TempleGuide from "./TempleGuide";
export const metadata: Metadata = {
  title: "Temple of Sethraliss — Animated Mythic+ Boss Tactics",
  description:
    "Learn all four Temple of Sethraliss bosses with animated mechanics, role advice and practice decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/temple-of-sethraliss` },
};
export default function Page() {
  return <TempleGuide />;
}
