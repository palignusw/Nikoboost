import type { Metadata } from "next";
import DenGuide from "./DenGuide";
export const metadata: Metadata = {
  title: "Den of Nalorakk — Visual Tactics Guide",
  description:
    "Learn Hoardmonger, Sentinel of Winter and Nalorakk with animated mechanic examples, role advice and practice decisions.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <DenGuide />;
}
