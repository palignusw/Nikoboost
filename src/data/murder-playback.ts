import { getMurderLesson, type MurderBossId } from "./murder-guide";
export type Point = { x: number; y: number };
export type MurderActor = Point & {
  id: string;
  role: string;
  status: string;
  marked: boolean;
  hurt: boolean;
};
export const coverPositions: Point[] = [
  { x: 110, y: 170 },
  { x: 200, y: 215 },
  { x: 300, y: 235 },
  { x: 400, y: 215 },
  { x: 490, y: 170 },
];
const base: Point[] = [
  { x: 310, y: 170 },
  { x: 170, y: 290 },
  { x: 290, y: 300 },
  { x: 395, y: 290 },
  { x: 465, y: 240 },
];
export const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export function coverSpot(b: Point): Point {
  const dx = b.x - 300,
    dy = b.y - 65,
    d = Math.hypot(dx, dy);
  return { x: b.x + (dx / d) * 30, y: b.y + (dy / d) * 30 };
}
export function isCovered(p: Point, b: Point) {
  return Math.hypot(p.x - coverSpot(b).x, p.y - coverSpot(b).y) <= 21;
}
export function getMurderState(
  id: MurderBossId,
  value: number,
  mistake = false,
) {
  const lesson = getMurderLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const actors: MurderActor[] = base.map((p, i) => ({
    ...p,
    id: `P${i + 1}`,
    role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
    status: cue.role[i === 0 ? "tank" : i === 1 ? "healer" : "damage"],
    marked: false,
    hurt: false,
  }));
  let boss: Point = { x: 300, y: 130 },
    nibbles: Point | null = null,
    infernal: Point | null = null,
    axe: Point | null = null;
  let ring: { center: Point; radius: number } | null = null;
  let failure = false;
  const move = (i: number, p: Point, n = 1) =>
    Object.assign(actors[i], blend(actors[i], p, n));
  let clones: Point[] = [];
  let impacts: Point[] = [];
  let pools: Point[] = [];
  let freight: "active" | "primed" | "gone" = "gone";
  let adds: "none" | "active" | "cleared" = "none";
  let gateTravel = false;
  if (id === "kystia-manaheart") {
    nibbles = { x: 365, y: 135 };
    boss = { x: 290, y: 130 };
    move(0, { x: 405, y: 95 });
    move(4, { x: 415, y: 235 });
    if (time >= 5 && time < 10) {
      move(4, { x: 480, y: 80 }, (time - 5) / 1.5);
      move(3, { x: 200, y: 330 }, (time - 5) / 1.5);
    }
    if (time >= 10 && time < 14) {
      boss = { x: 290, y: 300 };
      ring = { center: boss, radius: 85 };
      for (let i = 0; i < 5; i++)
        move(
          i,
          [
            { x: 450, y: 130 },
            { x: 130, y: 230 },
            { x: 235, y: 395 },
            { x: 450, y: 330 },
            { x: 470, y: 235 },
          ][i],
          (time - 10) / 1.5,
        );
    }
    if (time >= 14 && time < 18) {
      clones = [
        { x: 110, y: 100 },
        { x: 200, y: 70 },
        { x: 400, y: 70 },
        { x: 490, y: 110 },
        { x: 500, y: 350 },
      ];
      if (time >= 16) clones = mistake ? [clones[4]] : [];
      failure = mistake && time >= 16;
    }
    if (time >= 18) {
      nibbles = { x: 365, y: 135 };
    }
  }
  if (id === "zaen-bladesorrow") {
    boss = { x: 300, y: 65 };
    freight = time < 6 ? "active" : time < 11 ? "primed" : "gone";
    if (time < 11) {
      actors[2].marked = time < 6;
      move(
        2,
        time < 6 ? { x: 505, y: 105 } : { x: 390, y: 335 },
        time < 6 ? time / 2 : (time - 6) / 1.5,
      );
    }
    if (time >= 11 && time < 19) {
      actors.forEach((_, i) => {
        let p = coverSpot(coverPositions[i]);
        if (mistake && i === 2) p = { x: p.x, y: p.y + 100 };
        move(i, p, (time - 11) / 2);
      });
      if (time >= 14) {
        failure = mistake && time < 19;
        actors[2].hurt = mistake;
        actors.forEach((_, i) => {
          const p = actors[i];
          move(
            i,
            { x: p.x < 300 ? p.x - 55 : p.x > 300 ? p.x + 55 : p.x, y: 370 },
            (time - 14) / 2,
          );
        });
      }
    }
  }
  if (id === "xathuux") {
    boss = { x: 300, y: 115 };
    move(0, { x: 300, y: 60 });
    move(1, { x: 145, y: 240 });
    move(4, { x: 450, y: 240 });
    const landing = mistake ? { x: 120, y: 330 } : { x: 360, y: 175 };
    if (time >= 4 && time < 9) {
      actors[2].marked = true;
      move(2, landing, (time - 4) / 2);
    }
    if (time >= 9 && (time < 12 || (mistake && time < 17))) {
      axe = landing;
      failure = mistake;
    }
    if (time >= 13 && time < 17) {
      impacts = actors.map((p) => ({ x: p.x, y: p.y }));
    }
    if (time >= 17) {
      const n = (time - 17) / 9,
        angle = -Math.PI / 2 + n * Math.PI * 0.72;
      boss = { x: 300 + 180 * Math.cos(angle), y: 220 + 140 * Math.sin(angle) };
      actors.forEach((_, i) =>
        move(
          i,
          i === 0
            ? { x: 300 + 230 * Math.cos(angle), y: 220 + 185 * Math.sin(angle) }
            : {
                x: 300 + (95 + i * 10) * Math.cos(angle + 1.1 + i * 0.3),
                y: 220 + (85 + i * 8) * Math.sin(angle + 1.1 + i * 0.3),
              },
        ),
      );
      pools = Array.from({ length: Math.floor(n * 7) + 1 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 7) * Math.PI * 0.72;
        return { x: 300 + 180 * Math.cos(a), y: 220 + 140 * Math.sin(a) };
      });
    }
  }
  if (id === "lithiel-cinderfury") {
    boss = time >= 12 ? { x: 480, y: 120 } : { x: 330, y: 145 };
    infernal = { x: 100, y: 100 };
    move(0, { x: 330, y: 65 });
    const spread = [
      { x: 170, y: 190 },
      { x: 280, y: 190 },
      { x: 170, y: 315 },
      { x: 280, y: 315 },
    ];
    if (time >= 4 && time < 8) {
      for (let i = 1; i < 5; i++) {
        move(i, spread[i - 1], (time - 4) / 1.5);
        actors[i].marked = true;
      }
      impacts = spread;
    }
    if (time >= 8 && time < 12) adds = "active";
    if (time >= 12) adds = "cleared";
    if (time >= 12) {
      const entry = [
        { x: 100, y: 235 },
        { x: 160, y: 235 },
        { x: 220, y: 235 },
        { x: 100, y: 345 },
        { x: 220, y: 345 },
      ];
      actors.forEach((_, i) => move(i, entry[i], (time - 12) / 2));
    }
    if (time >= 16 && time < 22) {
      ring = { center: { x: 480, y: 120 }, radius: 30 + (time - 16) * 70 };
      if (time >= 17.8) {
        gateTravel = true;
        const exit = [
          { x: 435, y: 115 },
          { x: 500, y: 75 },
          { x: 500, y: 165 },
          { x: 440, y: 200 },
          { x: 540, y: 220 },
        ];
        actors.forEach((_, i) => move(i, exit[i]));
        if (mistake) {
          move(2, { x: 235 + (time - 17.8) * 28, y: 265 - (time - 17.8) * 18 });
          actors[2].hurt = time >= 19;
          failure = time >= 19;
        }
      }
    }
    if (time >= 22) {
      actors.forEach((_, i) =>
        move(
          i,
          [
            { x: 405, y: 80 },
            { x: 480, y: 245 },
            { x: 380, y: 225 },
            { x: 535, y: 140 },
            { x: 545, y: 285 },
          ][i],
        ),
      );
    }
  }
  if (failure)
    actors.forEach((a) => {
      if (id === "kystia-manaheart" || id === "xathuux") a.hurt = true;
    });
  actors.forEach((a) => {
    a.x = Math.max(32, Math.min(568, a.x));
    a.y = Math.max(32, Math.min(390, a.y));
    if (a.hurt)
      a.status =
        id === "zaen-bladesorrow"
          ? "Exposed to the shot: bleed applied."
          : id === "lithiel-cinderfury"
            ? "Wave hit: lingering damage and vulnerability."
            : "Extra group damage while the summon survives.";
  });
  return {
    time,
    cue,
    actors,
    boss,
    nibbles,
    infernal,
    axe,
    ring,
    failure,
    clones,
    impacts,
    pools,
    freight,
    adds,
    gateTravel,
    remaining: cue.window ? Math.max(0, cue.end - time) : null,
  };
}
export type MurderWorld = ReturnType<typeof getMurderState>;
