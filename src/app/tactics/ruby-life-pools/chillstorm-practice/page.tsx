import type { Metadata } from "next";
import ChillstormStudy from "../ChillstormStudy";
export const metadata: Metadata = {
  title: "Chillstorm Position Practice",
  robots: { index: false, follow: true },
};
export default function Page() {
  return <ChillstormStudy />;
}
