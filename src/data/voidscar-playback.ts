import { getVoidscarLesson, type VoidscarBossId } from "./voidscar-guide";
export type Point = { x: number; y: number };
export type VoidscarActor = Point & {
  id: string;
  role: string;
  status: string;
  marked: boolean;
  hurt: boolean;
  disabled: boolean;
};
export const dashRows = [80, 140, 200, 260, 320];
export const stars: Point[] = [
  { x: 180, y: 150 },
  { x: 300, y: 90 },
  { x: 430, y: 150 },
];
export const poisonPools: Point[] = [
  { x: 140, y: 150 },
  { x: 320, y: 300 },
  { x: 480, y: 100 },
];
export const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function getVoidscarState(
  id: VoidscarBossId,
  value: number,
  mistake = false,
) {
  const lesson = getVoidscarLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const base: Point[] =
    id === "charonus"
      ? [
          { x: 300, y: 290 },
          { x: 80, y: 150 },
          { x: 120, y: 300 },
          { x: 460, y: 280 },
          { x: 500, y: 360 },
        ]
      : [
          { x: 300, y: 80 },
          { x: 180, y: 220 },
          { x: 420, y: 200 },
          { x: 250, y: 300 },
          { x: 410, y: 280 },
        ];
  const actors: VoidscarActor[] = base.map((p, i) => ({
    ...p,
    id: `P${i + 1}`,
    role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
    status: cue.role[i === 0 ? "tank" : i === 1 ? "healer" : "damage"],
    marked: false,
    hurt: false,
    disabled: false,
  }));
  const move = (i: number, p: Point, n = 1) =>
    Object.assign(actors[i], blend(actors[i], p, n));
  let boss: Point = { x: 300, y: 160 };
  let shades: Point[] = [];
  let lanes: { from: Point; to: Point }[] = [];
  let pools: Point[] = [];
  let impacts: Point[] = [];
  let projectiles: Point[] = [];
  let creeper: Point | null = null;
  let singularities: Point[] = [];
  let orb: Point | null = null;
  let breathTarget: Point | null = null;
  let failure = false;
  let atomized = false;
  if (id === "tazrah") {
    boss = { x: 200, y: 35 };
    if (time < 8) {
      actors.forEach((a, i) => {
        a.x = 440;
        a.y = mistake && i === 2 ? 152 : dashRows[i];
        a.marked = true;
      });
      shades = dashRows.map((y, i) => ({
        x: time < 4 ? 200 : 200 + 300 * Math.min(1, (time - 4) / 3),
        y:
          time < 4
            ? y
            : blend(
                { x: 200, y },
                { x: 500, y: mistake && i === 2 ? 152 : y },
                (time - 4) / 3,
              ).y,
      }));
      lanes = shades.map((_, i) => ({
        from: { x: 200, y: dashRows[i] },
        to: { x: 500, y: mistake && i === 2 ? 152 : dashRows[i] },
      }));
      failure = mistake && time >= 5;
      if (failure) {
        actors[1].hurt = true;
        actors[2].hurt = true;
        actors[1].status = actors[2].status =
          "Overlapping dash lanes: extra hits and bleed.";
      }
    }
    if (time >= 8) {
      pools = dashRows.map((y) => ({ x: 500, y }));
      actors.forEach((a, i) => {
        a.x = 440;
        a.y = dashRows[i];
        move(i, { x: 380, y: dashRows[i] }, (time - 8) / 1.2);
      });
    }
    if (time >= 8 && time < 12) impacts = pools;
    if (time >= 12 && time < 18) {
      actors.forEach((_, i) =>
        move(
          i,
          { x: 330, y: dashRows[i] + 30 },
          Math.min(1, (time - 12) / 1.5),
        ),
      );
      projectiles = dashRows.map((y) => ({ x: 500 - (time - 12) * 55, y }));
    }
    if (time >= 18) {
      actors.forEach((_, i) =>
        move(
          i,
          [
            { x: 170, y: 150 },
            { x: 100, y: 270 },
            { x: 235, y: 300 },
            { x: 330, y: 290 },
            { x: 410, y: 330 },
          ][i],
        ),
      );
      move(0, { x: 85, y: 150 }, (time - 20) / 1.5);
      boss = { x: 270, y: 150 };
    }
  }
  if (id === "atroxus") {
    boss = { x: 300, y: 160 };
    if (time < 4) {
      breathTarget = { x: 420, y: 200 };
      actors[2].marked = true;
      move(2, { x: 350, y: 260 }, time / 1.3);
    }
    if (time >= 4) {
      pools = poisonPools;
      actors.forEach((_, i) =>
        move(
          i,
          [
            { x: 300, y: 80 },
            { x: 180, y: 220 },
            { x: 350, y: 260 },
            { x: 250, y: 300 },
            { x: 410, y: 280 },
          ][i],
        ),
      );
    }
    if (time >= 11 && time < 19) {
      const n = (time - 11) / 8;
      boss = blend({ x: 300, y: 160 }, { x: 250, y: 170 }, n);
      creeper = blend({ x: 320, y: 300 }, { x: 200, y: 150 }, n);
      move(0, blend({ x: 300, y: 80 }, { x: 150, y: 90 }, n));
      [2, 3, 4].forEach((i, k) =>
        move(
          i,
          blend(
            [
              { x: 350, y: 260 },
              { x: 250, y: 300 },
              { x: 410, y: 280 },
            ][k],
            [
              { x: 260, y: 230 },
              { x: 220, y: 245 },
              { x: 315, y: 250 },
            ][k],
            n,
          ),
        ),
      );
      if (mistake && time >= 15) {
        move(0, { x: creeper.x, y: creeper.y + 25 });
        actors[0].hurt = true;
        actors[0].status = "Sickening Bite: increased Nature damage taken.";
        failure = true;
      }
    }
    if (time >= 19) {
      boss = { x: 250, y: 170 };
      move(0, { x: 250, y: 115 });
      if (mistake) {
        actors[0].hurt = true;
        actors[0].status = "Bite stacks make Hulking Claw more dangerous.";
        failure = true;
      }
    }
  }
  if (id === "charonus") {
    boss = { x: 300, y: 210 };
    singularities = [...stars];
    if (time >= 4 && time < 10) {
      const n = (time - 4) / 6;
      orb = blend({ x: 90, y: 310 }, stars[0], n);
      move(
        2,
        mistake
          ? blend({ x: 120, y: 300 }, stars[0], n * 1.4)
          : blend({ x: 120, y: 300 }, { x: 240, y: 160 }, n),
      );
      actors[2].marked = true;
      if (mistake && time >= 7.5) {
        atomized = true;
        failure = true;
      }
      if (time >= 8.8) {
        orb = null;
        singularities = stars.slice(1);
      }
    }
    if (time >= 10) {
      singularities = stars.slice(1);
      move(2, { x: 240, y: 160 });
    }
    if (time >= 14 && time < 18) {
      const start: Point[] = [
        { x: 300, y: 290 },
        { x: 80, y: 150 },
        { x: 240, y: 160 },
        { x: 460, y: 280 },
        { x: 500, y: 360 },
      ];
      const finish: Point[] = [
        { x: 280, y: 345 },
        { x: 80, y: 220 },
        { x: 250, y: 230 },
        { x: 500, y: 220 },
        { x: 550, y: 330 },
      ];
      impacts = start.map((p, i) =>
        mistake && i === 2 ? { x: 100, y: 240 } : p,
      );
      actors.forEach((_, i) =>
        move(i, blend(start[i], finish[i], (time - 14) / 1.5)),
      );
    }
    if (time >= 18) {
      move(0, { x: 300, y: 300 });
      move(1, { x: 80, y: 220 });
      move(2, { x: 250, y: 230 });
      move(3, { x: 500, y: 220 });
      move(4, { x: 550, y: 330 });
    }
    if (time >= 22) {
      actors[4].marked = true;
      move(4, { x: 525, y: 170 }, (time - 22) / 4);
      move(3, { x: 430, y: 340 }, (time - 22) / 1.5);
      projectiles = Array.from({ length: 3 }, (_, i) => {
        const n = Math.max(0, Math.min(1, (time - 22 - i * 0.7) / 3));
        return blend(boss, { x: 500, y: 360 }, n);
      }).filter((p) => distance(p, boss) > 10);
    }
    if (mistake && time >= 7.5 && time < 22.5) {
      move(
        2,
        blend(
          blend({ x: 120, y: 300 }, stars[0], 0.82),
          { x: 100, y: 240 },
          (time - 7.5) / 2,
        ),
      );
      actors[2].hurt = true;
      actors[2].disabled = true;
      actors[2].status =
        "Atomized: unable to attack or use abilities; movement remains illustrative.";
      atomized = true;
      failure = true;
    }
  }
  actors.forEach((a) => {
    a.x = Math.max(32, Math.min(568, a.x));
    a.y = Math.max(32, Math.min(390, a.y));
  });
  return {
    time,
    cue,
    actors,
    boss,
    shades,
    lanes,
    pools,
    impacts,
    projectiles,
    creeper,
    singularities,
    orb,
    breathTarget,
    failure,
    atomized,
    remaining: cue.window ? Math.max(0, cue.end - time) : null,
  };
}
export type VoidscarWorld = ReturnType<typeof getVoidscarState>;
