import type { Metadata } from "next";
import ChillstormStudy from "./ChillstormStudy";

export const metadata: Metadata = {
  title: "Ruby Life Pools Tactics Lab — Preview",
  description:
    "Explore a visual Chillstorm positioning lesson for Melidrussa Chillworn. A NikoBoost design preview with role notes and an interactive practice scene.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ChillstormStudy />;
}
