import { getKingsLesson, type KingsBossId } from "./kings-guide";
export type Point = { x: number; y: number };
const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export function getKingsState(id: KingsBossId, value: number, mistake = false) {
  const lesson = getKingsLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const actors = [
    { x: 300, y: 95 },
    { x: 120, y: 260 },
    { x: 170, y: 320 },
    { x: 400, y: 280 },
    { x: 500, y: 340 },
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
  const boss = { x: 300, y: 170 };
  let hazard: Point[] = [];
  let target: Point | null = null;
  let adds: Point[] = [];
  let coffins: Point[] = [];
  let activeCoffin = -1;
  let zone: Point | null = null;
  let zone2: Point | null = null;
  let frontal = false;
  let label = "";
  let failure = false;
  if (id === "golden-serpent") {
    if (time < 5) {
      actors[2].marked = true;
      move(2, blend({ x: 170, y: 320 }, { x: 90, y: 345 }, time / 3));
      hazard = [{ x: 90, y: 345 }];
      label = "Place gold together";
    }
    if (time >= 5 && time < 10) {
      hazard = [{ x: 90, y: 345 }];
      const n = (time - 5) / 5;
      adds =
        time < 9.3 || mistake ? [blend({ x: 90, y: 345 }, boss, n * 0.7)] : [];
      label = "Animated Gold → boss";
      if (mistake && time >= 8) {
        adds = [{ x: 275, y: 185 }];
        failure = true;
      }
    }
    if (time >= 10) label = "Group healing";
  }
  if (id === "mchimba") {
    coffins = [
      { x: 90, y: 90 },
      { x: 500, y: 90 },
      { x: 90, y: 350 },
      { x: 500, y: 350 },
    ];
    if (time < 5) {
      actors[2].marked = true;
      move(2, blend({ x: 170, y: 320 }, { x: 210, y: 375 }, time / 3));
      hazard = [{ x: 210, y: 375 }];
      label = "Keep coffins clear";
    }
    if (time >= 5 && time < 10) {
      activeCoffin = 1;
      move(2, { x: 500, y: 90 });
      actors[2].disabled = true;
      const n = (time - 5) / 3;
      move(
        3,
        mistake
          ? { x: 400, y: 280 }
          : blend({ x: 400, y: 280 }, { x: 465, y: 120 }, n),
      );
      label = "Shaking coffin · free P3";
      if (mistake && time >= 8) failure = true;
    }
    if (time >= 10) {
      adds = [
        { x: 235, y: 235 },
        { x: 365, y: 235 },
      ];
      label = "Interrupt mummies";
    }
  }
  if (id === "council-of-tribes") {
    if (time < 5) {
      actors[2].marked = true;
      target = { x: 250, y: 290 };
      move(2, target);
      const n = time / 2.5;
      if (!mistake) {
        move(1, blend({ x: 120, y: 260 }, { x: 200, y: 290 }, n));
        move(3, blend({ x: 400, y: 280 }, { x: 300, y: 290 }, n));
        move(4, blend({ x: 500, y: 340 }, { x: 250, y: 340 }, n));
      }
      zone = target;
      label = "Share the charge";
      if (mistake && time >= 3.5) {
        actors[2].hurt = true;
        failure = true;
      }
    }
    if (time >= 5 && time < 10) label = "Interrupt Poison Nova";
    if (time >= 10) {
      adds = [
        { x: 135, y: 155 },
        { x: 460, y: 155 },
        { x: 480, y: 260 },
      ];
      label = "Explosive totem first";
    }
  }
  if (id === "dazar") {
    if (time < 5) {
      adds = [{ x: 410, y: 170 }];
      label = "Focus Reban · interrupt roar";
    }
    if (time >= 5 && time < 10) {
      actors[2].marked = true;
      const n = (time - 5) / 2;
      move(
        2,
        mistake
          ? blend({ x: 170, y: 320 }, { x: 400, y: 280 }, n)
          : blend({ x: 170, y: 320 }, { x: 130, y: 340 }, n),
      );
      zone = { x: actors[2].x, y: actors[2].y };
      zone2 = { x: 400, y: 280 };
      label = "Spread leap targets";
      if (mistake && time >= 8) {
        actors[2].hurt = true;
        actors[3].hurt = true;
        failure = true;
      }
    }
    if (time >= 10) {
      frontal = true;
      label = "Tank faces boss away";
    }
  }
  return {
    time,
    cue,
    actors,
    boss,
    hazard,
    target,
    adds,
    coffins,
    activeCoffin,
    zone,
    zone2,
    frontal,
    label,
    failure,
    remaining: null as number | null,
  };
}
export type KingsWorld = ReturnType<typeof getKingsState>;
