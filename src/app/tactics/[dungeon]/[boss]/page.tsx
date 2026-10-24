import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  tacticsDungeons,
  findTactic,
  createCatalogLesson,
} from "@/data/tactics-catalog";
import TacticsPreview from "../../ruby-life-pools/TacticsPreview";

import ChillstormStudy from "../../ruby-life-pools/ChillstormStudy";

type Props = { params: Promise<{ dungeon: string; boss: string }> };
export function generateStaticParams() {
  return tacticsDungeons.flatMap((d) =>
    d.bosses.map((b) => ({ dungeon: d.id, boss: b.id })),
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const item = findTactic(p.dungeon, p.boss);
  return {
    title: item
      ? `${item.boss.name} Tactics | ${item.dungeon.name}`
      : "Tactics not found",
    description: item?.boss.summary,
    robots: { index: false, follow: false },
  };
}
async function Encounter({ params }: Props) {
  const p = await params;
  const item = findTactic(p.dungeon, p.boss);
  if (!item) notFound();
  if (p.dungeon === "ruby-life-pools" && p.boss === "melidrussa-chillworn") return <ChillstormStudy />;
  return (
    <TacticsPreview
      key={`${p.dungeon}/${p.boss}`}
      initialLesson={createCatalogLesson(item.dungeon, item.boss)}
    />
  );
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={<main style={{ padding: 40 }}>Loading encounter…</main>}
    >
      <Encounter {...props} />
    </Suspense>
  );
}
