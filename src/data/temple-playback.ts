import { getTempleLesson, type TempleBossId } from "./temple-guide";
export type Point = { x: number; y: number };
export const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function getTempleState(
  id: TempleBossId,
  value: number,
  mistake = false,
) {
  const lesson = getTempleLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const actors = [
    { x: 300, y: 85 },
    { x: 115, y: 270 },
    { x: 170, y: 330 },
    { x: 400, y: 280 },
    { x: 510, y: 340 },
  ].map((p, i) => ({
    ...p,
    id: `P${i + 1}`,
    role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
    status: cue.role[i === 0 ? "tank" : i === 1 ? "healer" : "damage"],
    marked: false,
    hurt: false,
    disabled: false,
  }));
  const move = (i: number, p: Point) => Object.assign(actors[i], p);
  let boss: Point = { x: 300, y: 170 };
  let secondBoss: Point | null = null;
  let shield: Point | null = null;
  let hazards: Point[] = [];
  let circles: Point[] = [];
  let adds: { p: Point; label: string }[] = [];
  let spires: Point[] = [];
  let beams: { from: Point; to: Point; covered: boolean }[] = [];
  let orbs: Point[] = [];
  let heal = false;
  let message = "";
  let failure = false;
  let bossHidden = false;
  if (id === "adderis-and-aspix") {
    boss = { x: 245, y: 160 };
    secondBoss = { x: 365, y: 160 };
    shield = secondBoss;
    if (time < 5) {
      message = "Attack Adderis · Aspix is immune";
    }
    if (time >= 5 && time < 10) {
      message = "Separate lines · plan knockback";
      actors.forEach((a, i) => {
        a.marked = true;
        move(
          i,
          blend(
            [
              { x: 300, y: 85 },
              { x: 115, y: 270 },
              { x: 170, y: 330 },
              { x: 400, y: 280 },
              { x: 510, y: 340 },
            ][i],
            [
              { x: 300, y: 55 },
              { x: 90, y: 200 },
              { x: 145, y: 355 },
              { x: 430, y: 270 },
              { x: 530, y: 345 },
            ][i],
            (time - 5) / 2,
          ),
        );
      });
    }
    if (time >= 10 && time < 15) {
      message = "Regroup to share the hit";
      const destinations = [
        { x: 270, y: 220 },
        { x: 215, y: 255 },
        { x: 270, y: 275 },
        { x: 325, y: 265 },
        { x: 365, y: 225 },
      ];
      actors.forEach((_, i) =>
        move(
          i,
          blend(
            [
              { x: 300, y: 55 },
              { x: 90, y: 200 },
              { x: 145, y: 355 },
              { x: 430, y: 270 },
              { x: 530, y: 345 },
            ][i],
            mistake && i === 2 ? { x: 130, y: 340 } : destinations[i],
            (time - 10) / 2,
          ),
        ),
      );
      circles = [{ x: 280, y: 245 }];
      if (mistake && time >= 13) {
        failure = true;
        actors[2].hurt = true;
      }
    }
    if (time >= 15 && time < 20) {
      message = "Place wind puddles out of the way";
      actors[2].marked = true;
      move(2, blend({ x: 270, y: 275 }, { x: 95, y: 345 }, (time - 15) / 2));
      hazards = [{ x: 95, y: 345 }];
    }
    if (time >= 20) {
      shield = boss;
      message = "Shield switched · attack Aspix";
    }
  }
  if (id === "merektha") {
    if (time < 5) {
      message = "Bring both targets to melee";
      actors[2].marked = true;
      actors[3].marked = true;
      const n = time / 2;
      move(
        2,
        blend(
          { x: 170, y: 330 },
          mistake ? { x: 145, y: 330 } : { x: 245, y: 235 },
          n,
        ),
      );
      move(
        3,
        blend(
          { x: 400, y: 280 },
          mistake ? { x: 470, y: 290 } : { x: 340, y: 235 },
          n,
        ),
      );
      if (mistake && time >= 3.5) failure = true;
    }
    if (time >= 5 && time < 10) {
      message = "Place Thunder Spit near the edge";
      actors[2].marked = true;
      move(2, blend({ x: 245, y: 235 }, { x: 90, y: 340 }, (time - 5) / 2));
      hazards = [{ x: 90, y: 340 }];
    }
    if (time >= 10 && time < 15) {
      bossHidden = true;
      message = "Interrupt adds · dodge the burrow charge";
      adds = [
        { p: { x: 205, y: 175 }, label: "V" },
        { p: { x: 250, y: 250 }, label: "V" },
        { p: { x: 350, y: 250 }, label: "V" },
        { p: { x: 405, y: 175 }, label: "S" },
      ];
    }
    if (time >= 15) {
      message = "Heal through Serpentstorm";
      hazards = [{ x: 90, y: 340 }];
    }
  }
  if (id === "galvazzt") {
    boss = { x: 300, y: 175 };
    const points = [
      { x: 90, y: 150 },
      { x: 510, y: 150 },
      { x: 300, y: 370 },
    ];
    if (time < 10 || time >= 15) {
      spires = points;
      const destinations = points.map((p) => blend(p, boss, 0.45));
      const n = time < 5 ? time / 2 : 1;
      [2, 3, 4].forEach((idx, i) =>
        move(
          idx,
          blend(
            [
              { x: 170, y: 330 },
              { x: 400, y: 280 },
              { x: 510, y: 340 },
            ][i],
            mistake && time >= 5 && i === 0
              ? { x: 100, y: 310 }
              : destinations[i],
            n,
          ),
        ),
      );
      beams =
        time < 5
          ? []
          : points.map((p, i) => ({
              from: p,
              to: mistake && time >= 5 && i === 0 ? boss : actors[i + 2],
              covered: !(mistake && time >= 5 && i === 0),
            }));
      message =
        time < 5 ? "Assign one player to each beam" : "Intercept each beam";
      if (mistake && time >= 8) failure = true;
    }
    if (time >= 10 && time < 15) {
      message = "Leave the Induction field";
      hazards = [{ x: 300, y: 285 }];
    }
  }
  if (id === "avatar-of-sethraliss") {
    boss = { x: 300, y: 100 };
    if (time < 5) {
      message = "Defeat the Defiler · unlock healing";
      adds = [{ p: { x: 300, y: 240 }, label: "Defiler" }];
    }
    if (time >= 5 && time < 10) {
      message = "Collect each orb promptly";
      const points = [
        { x: 175, y: 230 },
        { x: 300, y: 300 },
        { x: 425, y: 230 },
      ];
      const start = [
        { x: 170, y: 330 },
        { x: 400, y: 280 },
        { x: 510, y: 340 },
      ];
      [2, 3, 4].forEach((idx, i) =>
        move(
          idx,
          blend(
            start[i],
            mistake && i === 2 ? start[i] : points[i],
            (time - 5) / 2,
          ),
        ),
      );
      orbs = points.filter((_, i) => time < 7 || (mistake && i === 2));
      if (mistake && time >= 8) failure = true;
    }
    if (time >= 10) {
      message = "Heal Avatar · control Tormentors";
      heal = true;
      adds = [
        { p: { x: 180, y: 190 }, label: "Add" },
        { p: { x: 440, y: 210 }, label: "Add" },
      ];
      move(1, { x: 170, y: 270 });
    }
  }
  return {
    time,
    cue,
    actors,
    boss,
    secondBoss,
    shield,
    hazards,
    circles,
    adds,
    spires,
    beams,
    orbs,
    heal,
    message,
    failure,
    bossHidden,
    remaining: null as number | null,
  };
}
export type TempleWorld = ReturnType<typeof getTempleState>;
