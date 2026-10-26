import { siteOrigin } from "@/lib/pageSeo";
import type { Metadata } from "next";
import DenGuide from "./DenGuide";
export const metadata: Metadata = {
  title: "Den of Nalorakk — Visual Tactics Guide",
  description:
    "Learn Hoardmonger, Sentinel of Winter and Nalorakk with animated mechanic examples, role advice and practice decisions.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/den-of-nalorakk` },
};
export default function Page() {
  return <DenGuide />;
}
