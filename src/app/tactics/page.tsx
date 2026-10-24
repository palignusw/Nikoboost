import type { Metadata } from "next";
import TacticsCatalog from "./TacticsCatalog";
export const metadata: Metadata = {
  title: "Mythic+ Boss Tactics Lab — Season Catalog",
  description:
    "Explore the current Mythic+ dungeon bosses with role notes, key-mechanic diagrams and practice decisions.",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <TacticsCatalog />;
}
