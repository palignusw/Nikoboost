import { getValeLesson, type ValeBossId } from "./vale-guide";
export type Point = { x: number; y: number };
export type ValeActor = Point & {
  id: string;
  role: string;
  status: string;
  marked: boolean;
  hurt: boolean;
  rooted: boolean;
  health?: number;
  stacks?: number;
};
export const loamPositions: Point[] = [
  { x: 180, y: 260 },
  { x: 300, y: 300 },
  { x: 420, y: 260 },
];
export const dormantPositions: Point[] = [
  { x: 340, y: 180 },
  { x: 380, y: 200 },
  { x: 420, y: 220 },
];
export const orbStarts: Point[] = [
  { x: 100, y: 360 },
  { x: 300, y: 380 },
  { x: 500, y: 390 },
];
const base: Point[] = [
  { x: 300, y: 80 },
  { x: 150, y: 180 },
  { x: 280, y: 310 },
  { x: 390, y: 300 },
  { x: 470, y: 200 },
];
export const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export function insideCone(
  p: Point,
  origin: Point,
  target: Point,
  half = 0.17,
) {
  const a = Math.atan2(target.y - origin.y, target.x - origin.x),
    b = Math.atan2(p.y - origin.y, p.x - origin.x);
  return (
    Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) <= half &&
    Math.hypot(p.x - origin.x, p.y - origin.y) <= 310
  );
}
export function getValeState(id: ValeBossId, value: number, mistake = false) {
  const lesson = getValeLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const actors: ValeActor[] = base.map((p, i) => ({
    ...p,
    id: `P${i + 1}`,
    role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
    status: cue.role[i === 0 ? "tank" : i === 1 ? "healer" : "damage"],
    marked: false,
    hurt: false,
    rooted: false,
  }));
  const move = (i: number, p: Point, n = 1) =>
    Object.assign(actors[i], blend(actors[i], p, n));
  let boss: Point = { x: 300, y: 150 };
  let bosses: Point[] = [];
  let roots: Point[] = [];
  let pools: Point[] = [];
  let impacts: Point[] = [];
  const lines: { from: Point; to: Point }[] = [];
  let cones: Point[] = [];
  let flowers: (Point & {
    covered: boolean;
    state: "loam" | "soak" | "scorched";
  })[] = [];
  let failure = false;
  let form = "";
  let adds: "none" | "active" | "dormant" | "cleared" | "regrown" = "none";
  let orbs: Point[] = [];
  let beamTarget: Point | null = null;
  if (id === "lightblossom-trinity") {
    bosses = [
      { x: 260, y: 100 },
      { x: 300, y: 155 },
      { x: 350, y: 105 },
    ];
    boss = bosses[0];
    move(0, { x: 250, y: 200 });
    move(1, { x: 110, y: 160 });
    move(4, { x: 490, y: 150 });
    if (time < 4) {
      actors[4].marked = true;
      move(4, { x: 500, y: 320 }, time / 2);
    }
    if (time >= 4) {
      flowers = loamPositions.map((p) => ({
        ...p,
        covered: false,
        state: time < 8 ? "loam" : time < 16 ? "soak" : "scorched",
      }));
    }
    if (time >= 4 && time < 8) {
      move(2, { x: 260, y: 355 });
      move(3, { x: 460, y: 320 });
    }
    if (time >= 8 && time < 16) {
      [0, 2, 3].forEach((i, k) => {
        const target =
          mistake && i === 2 ? { x: 230, y: 300 } : loamPositions[k];
        move(i, target, Math.min(1, (time - 8) / 0.5));
        actors[i].status =
          mistake && i === 2
            ? "Outside the blossom: not soaking."
            : "Hold your assigned flower through the channel.";
      });
      flowers.forEach(
        (f) =>
          (f.covered = actors.some(
            (a) => Math.hypot(a.x - f.x, a.y - f.y) < 26,
          )),
      );
      failure = mistake && time >= 10;
    }
    if (time >= 16) {
      [0, 2, 3].forEach((i, k) => {
        Object.assign(actors[i], loamPositions[k]);
        move(
          i,
          [
            { x: 210, y: 160 },
            { x: 290, y: 200 },
            { x: 450, y: 150 },
          ][k],
          (time - 16) / 1.5,
        );
      });
      bosses = bosses.map((p) =>
        blend(p, { x: p.x + 75, y: p.y - 25 }, (time - 16) / 2),
      );
      boss = bosses[0];
      failure = mistake;
    }
  }
  if (id === "ikuzz") {
    const starts = [
      { x: 300, y: 90 },
      { x: 180, y: 175 },
      mistake ? { x: 300, y: 240 } : { x: 210, y: 220 },
      { x: 370, y: 220 },
      { x: 420, y: 150 },
    ];
    const landings = [
      { x: 300, y: 40 },
      { x: 105, y: 190 },
      mistake ? { x: 300, y: 330 } : { x: 150, y: 265 },
      { x: 430, y: 280 },
      { x: 500, y: 150 },
    ];
    const regroup = [
      { x: 245, y: 200 },
      { x: 300, y: 230 },
      { x: 355, y: 200 },
      { x: 255, y: 255 },
      { x: 345, y: 270 },
    ];
    const old = [
      { x: 450, y: 200 },
      { x: 450, y: 330 },
      { x: 300, y: 330 },
    ];
    roots = old;
    if (time < 4) actors.forEach((_, i) => move(i, starts[i]));
    if (time >= 4 && time < 5)
      actors.forEach((_, i) =>
        move(i, blend(starts[i], landings[i], time - 4)),
      );
    if (time >= 5 && time < 8)
      actors.forEach((_, i) =>
        move(
          i,
          mistake && i === 2
            ? landings[i]
            : blend(landings[i], regroup[i], (time - 5) / 2.5),
        ),
      );
    if (time >= 8 && time < 12) {
      actors.forEach((_, i) =>
        move(i, mistake && i === 2 ? landings[i] : regroup[i]),
      );
      if (time < 10.5) {
        roots = [...old, ...regroup.filter((_, i) => !(mistake && i === 2))];
        actors.forEach((a) => {
          a.rooted = true;
          a.status = "Rooted: destroy roots or use a root break.";
        });
      } else {
        actors.forEach((_, i) => {
          if (!(mistake && i === 2)) move(i, base[i], (time - 10.5) / 1.5);
        });
      }
    }
    if (mistake && time >= 4.7 && time < 12) {
      move(2, landings[2]);
      actors[2].rooted = true;
      actors[2].hurt = true;
      actors[2].status = "Isolated in the old root: needs help.";
      failure = true;
    }
    if (time >= 12 && time < 22) {
      const n = (time - 12) / 10;
      boss = blend({ x: 260, y: 250 }, { x: 430, y: 250 }, n);
      move(2, { x: 460 + n * 85, y: 335 });
      actors[2].marked = true;
      actors[2].status =
        "Gaze target: keep the boss behind you; avoid the roots.";
      roots = [
        { x: 300, y: 250 },
        { x: 380, y: 250 },
        { x: 200, y: 330 },
      ].filter((p) => p.y !== 250 || p.x > boss.x + 22);
    }
  }
  if (id === "lightwarden-ruia") {
    form =
      time < 13
        ? "Moonkin · above 70%"
        : time < 25
          ? "Bear · 70–40%"
          : "Haranir · below 40%";
    if (time < 4) {
      impacts = [
        { x: 280, y: 310 },
        { x: 390, y: 300 },
        { x: 470, y: 200 },
      ];
      move(2, { x: 220, y: 355 }, time / 1.5);
      move(3, { x: 380, y: 380 }, time / 1.5);
      move(4, { x: 530, y: 250 }, time / 1.5);
    }
    const drops = [
      { x: 140, y: 160 },
      { x: 300, y: 300 },
      { x: 460, y: 160 },
    ];
    if (time >= 4 && time < 10) {
      [1, 2, 3].forEach((i, k) => {
        move(i, drops[k], (time - 4) / 1.5);
        actors[i].marked = true;
      });
    }
    if (time >= 10 && time < 13) {
      [1, 2, 3].forEach((i, k) => {
        move(
          i,
          blend(
            drops[k],
            [
              { x: 100, y: 260 },
              { x: 235, y: 355 },
              { x: 500, y: 280 },
            ][k],
            (time - 10) / 1.2,
          ),
        );
        lines.push({
          from: blend(
            drops[k],
            { x: drops[k].x + 90, y: drops[k].y + 45 },
            (time - 10) / 3,
          ),
          to: blend(
            { x: drops[k].x + 60, y: drops[k].y + 30 },
            { x: drops[k].x + 150, y: drops[k].y + 75 },
            (time - 10) / 3,
          ),
        });
      });
    }
    if (time >= 13 && time < 16)
      actors.forEach((a) => {
        a.health = Math.min(100, Math.round(65 + (time - 13) * 14));
        a.hurt = a.health < 100;
        a.status = a.hurt
          ? `Grievous Thrash · ${a.health}% · heal to full.`
          : "Full health: bleed removed.";
      });
    const spread = [
      { x: 130, y: 300 },
      { x: 300, y: 350 },
      { x: 470, y: 300 },
    ];
    if (time >= 16 && time < 25) {
      move(0, { x: 300, y: 75 });
      move(1, { x: 110, y: 110 });
      [2, 3, 4].forEach((i, k) => {
        move(i, spread[k], Math.min(1, (time - 16) / 2));
        actors[i].marked = true;
      });
      if (time >= 19) {
        if (mistake)
          move(2, blend(spread[0], { x: 275, y: 330 }, (time - 19) / 1.5));
        cones = [actors[2], actors[3], actors[4]].map((a) => ({
          x: a.x,
          y: a.y,
        }));
        failure = mistake && time >= 20.5;
        if (failure) {
          actors[2].hurt = true;
          actors[3].hurt = true;
          actors[2].status = actors[3].status =
            "Overlapping cone lanes: extra Pulverized hits.";
        }
      }
    }
    if (time >= 25) {
      impacts = [
        { x: 180, y: 250 },
        { x: 330, y: 330 },
        { x: 460, y: 250 },
      ];
    }
  }
  if (id === "ziekket") {
    boss = { x: 200, y: 110 };
    move(0, { x: 100, y: 110 });
    move(1, { x: 105, y: 260 });
    move(3, { x: 440, y: 90 });
    move(4, { x: 500, y: 370 });
    adds =
      time < 5
        ? "active"
        : time < 10.5
          ? "dormant"
          : mistake
            ? time >= 19
              ? "regrown"
              : "dormant"
            : "cleared";
    const target = mistake ? { x: 500, y: 120 } : { x: 500, y: 260 };
    if (time >= 5 && time < 13) {
      move(2, target, Math.min(1, (time - 5) / 1.5));
      actors[2].marked = true;
      beamTarget = { x: actors[2].x, y: actors[2].y };
      actors[2].status =
        time < 10
          ? "Beam target: aim through the Dormant bodies."
          : "Beam target: damage still needs healing.";
    }
    if (time >= 10.5 && !mistake) pools = dormantPositions;
    if (time >= 10.5 && mistake) failure = true;
    if (time >= 13 && time < 19) {
      const n = (time - 13) / 6;
      const intercept = orbStarts.map((p) => blend(p, boss, 0.5));
      [1, 2, 3].forEach((i, k) =>
        move(i, intercept[k], Math.min(1, (time - 13) / 2.5)),
      );
      if (time < 16) orbs = orbStarts.map((p) => blend(p, boss, n));
      else
        [1, 2, 3].forEach((i) => {
          actors[i].stacks = 1;
          actors[i].status =
            "One shared Essence stack: buff plus ticking damage.";
        });
    }
    if (time >= 19) move(0, { x: 50, y: 110 }, Math.min(1, (time - 19) / 1.2));
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
    bosses,
    roots,
    pools,
    impacts,
    lines,
    cones,
    flowers,
    failure,
    form,
    adds,
    orbs,
    beamTarget,
    remaining: cue.window ? Math.max(0, cue.end - time) : null,
  };
}
export type ValeWorld = ReturnType<typeof getValeState>;
