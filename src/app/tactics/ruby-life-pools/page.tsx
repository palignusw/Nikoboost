import type { Metadata } from "next";
import { siteOrigin } from "@/lib/pageSeo";
import RubyGuide from "./RubyGuide";
export const metadata: Metadata = {
  title: "Ruby Life Pools — Animated Mythic+ Boss Tactics",
  description:
    "Learn all three Ruby Life Pools bosses with animated mechanics, role advice and practice decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/ruby-life-pools` },
};
export default function Page() {
  return <RubyGuide />;
}
