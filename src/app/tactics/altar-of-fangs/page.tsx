import { siteOrigin } from "@/lib/pageSeo";
import type { Metadata } from "next";
import AltarGuide from "./AltarGuide";
export const metadata: Metadata = {
  title: "Altar of Fangs — Visual Tactics Guide",
  description:
    "A step-by-step visual field guide for Rav’i, The Writhing Coil and Zul’jan. Learn a key mechanic, then try the situation.",
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteOrigin}/tactics/altar-of-fangs` },
};
export default function Page() {
  return <AltarGuide />;
}
