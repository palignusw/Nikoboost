import { isPublishedTactic } from "@/data/published-tactics";
import { siteOrigin } from "@/lib/pageSeo";
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

import KingsGuide from "../../kings-rest/KingsGuide";
import { getKingsLesson } from "@/data/kings-guide";
import VoidscarGuide from "../../voidscar-arena/VoidscarGuide";
import { getVoidscarLesson } from "@/data/voidscar-guide";
import ValeGuide from "../../the-blinding-vale/ValeGuide";
import { getValeLesson } from "@/data/vale-guide";
import MurderGuide from "../../murder-row/MurderGuide";
import { getMurderLesson } from "@/data/murder-guide";
import AltarGuide from "../../altar-of-fangs/AltarGuide";
import DenGuide from "../../den-of-nalorakk/DenGuide";
import { getDenLesson } from "@/data/den-guide";
import { getAltarStudy } from "@/data/altar-study";

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
    robots: {
      index: Boolean(item) && isPublishedTactic(p.dungeon),
      follow: true,
    },
    alternates: item
      ? { canonical: `${siteOrigin}/tactics/${p.dungeon}/${p.boss}` }
      : undefined,
  };
}
async function Encounter({ params }: Props) {
  const p = await params;
  const item = findTactic(p.dungeon, p.boss);
  if (!item) notFound();
  const kingsStudy =
    p.dungeon === "kings-rest" ? getKingsLesson(p.boss) : undefined;
  if (kingsStudy) return <KingsGuide key={p.boss} bossId={kingsStudy.id} />;
  const voidscarStudy =
    p.dungeon === "voidscar-arena" ? getVoidscarLesson(p.boss) : undefined;
  if (voidscarStudy)
    return <VoidscarGuide key={p.boss} bossId={voidscarStudy.id} />;
  const valeStudy =
    p.dungeon === "the-blinding-vale" ? getValeLesson(p.boss) : undefined;
  if (valeStudy) return <ValeGuide key={p.boss} bossId={valeStudy.id} />;
  const murderStudy =
    p.dungeon === "murder-row" ? getMurderLesson(p.boss) : undefined;
  if (murderStudy) return <MurderGuide key={p.boss} bossId={murderStudy.id} />;
  const denStudy =
    p.dungeon === "den-of-nalorakk" ? getDenLesson(p.boss) : undefined;
  if (denStudy) return <DenGuide key={p.boss} bossId={denStudy.id} />;
  const altarStudy =
    p.dungeon === "altar-of-fangs" ? getAltarStudy(p.boss) : undefined;
  if (altarStudy) return <AltarGuide key={p.boss} bossId={altarStudy.id} />;
  if (p.dungeon === "ruby-life-pools" && p.boss === "melidrussa-chillworn")
    return <ChillstormStudy />;
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
