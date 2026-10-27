import { getRubyLesson, type RubyBossId } from "./ruby-guide";
export type Point = { x: number; y: number };
export const blend = (a: Point, b: Point, n: number): Point => ({
  x: a.x + (b.x - a.x) * Math.max(0, Math.min(1, n)),
  y: a.y + (b.y - a.y) * Math.max(0, Math.min(1, n)),
});
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export function getRubyState(id: RubyBossId, value: number, mistake = false) {
  const lesson = getRubyLesson(id)!;
  const time = Math.max(0, Math.min(lesson.duration, value));
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues.at(-1)!;
  const start = [
    { x: 300, y: 95 },
    { x: 145, y: 265 },
    { x: 205, y: 320 },
    { x: 370, y: 275 },
    { x: 480, y: 330 },
  ];
  const actors = start.map((p, i) => ({
    ...p,
    id: `P${i + 1}`,
    role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
    status: cue.role[i === 0 ? "tank" : i === 1 ? "healer" : "damage"],
    marked: false,
    hurt: false,
    disabled: false,
  }));
  const move = (i: number, p: Point) => Object.assign(actors[i], p);
  let boss: Point = { x: 300, y: 160 };
  let dragon: Point | null = null;
  let pools: Point[] = [];
  let storm: Point | null = null;
  let zone: Point | null = null;
  let adds: { p: Point; label: string }[] = [];
  let shield = false;
  let projectile: Point | null = null;
  let lane: { from: Point; to: Point } | null = null;
  let breath = false;
  let wind = false;
  let message = "";
  let failure = false;
  if (id === "melidrussa-chillworn") {
    if (time < 5) {
      message = "Bait hail together · then move";
      pools = [
        { x: 220, y: 270 },
        { x: 275, y: 295 },
        { x: 330, y: 270 },
      ];
      actors.forEach((_, i) =>
        move(
          i,
          blend(
            start[i],
            [
              { x: 300, y: 95 },
              { x: 140, y: 250 },
              { x: 160, y: 330 },
              { x: 395, y: 265 },
              { x: 480, y: 330 },
            ][i],
            time / 2,
          ),
        ),
      );
    }
    if (time >= 5 && time < 10) {
      message = "Place the storm away · move out";
      actors[2].marked = true;
      const destination = mistake ? { x: 195, y: 265 } : { x: 490, y: 320 };
      move(2, blend({ x: 205, y: 320 }, destination, (time - 5) / 2));
      if (time >= 7) {
        storm = destination;
        if (!mistake)
          move(2, blend(destination, { x: 390, y: 365 }, (time - 7) / 0.7));
      }
      if (mistake && time >= 8) failure = true;
    }
    if (time >= 10 && time < 15) {
      message = "Break the shield · collect whelps";
      shield = true;
      adds = [
        { p: { x: 225, y: 215 }, label: "W" },
        { p: { x: 375, y: 215 }, label: "W" },
      ];
    }
    if (time >= 15) message = "Interrupt Frigid Shard";
  }
  if (id === "kokia-blazehoof") {
    if (time < 5) {
      message = "Place the add where allies can reach it";
      actors[2].marked = true;
      const target = mistake ? { x: 165, y: 265 } : { x: 420, y: 225 };
      move(2, blend({ x: 205, y: 320 }, target, time / 2));
      zone = target;
      if (mistake && time >= 3.5) {
        actors[1].hurt = true;
        failure = true;
      }
    }
    if (time >= 5 && time < 10) {
      message = "Focus add · interrupt Blaze Volley";
      adds = [{ p: { x: 420, y: 225 }, label: "Add" }];
    }
    if (time >= 10 && time < 15) {
      message = "Dodge boulder and wall impact";
      lane = { from: boss, to: { x: 540, y: 310 } };
      projectile = blend(boss, { x: 540, y: 310 }, (time - 10) / 4);
      move(3, { x: 360, y: 340 });
    }
    if (time >= 15) message = "Tank defensive · Searing Blows";
  }
  if (id === "kyrakka-and-erkhart") {
    boss = { x: 245, y: 165 };
    dragon = { x: 430, y: 100 };
    move(4, { x: 510, y: 210 });
    if (time < 5) {
      message = "Place fire away from the group";
      actors[2].marked = true;
      move(2, blend(start[2], { x: 480, y: 325 }, time / 2));
      if (time >= 2) pools = [{ x: 480, y: 325 }];
    }
    if (time >= 5 && time < 10) {
      message = "Wind moves players and fire";
      wind = true;
      pools = [blend({ x: 480, y: 325 }, { x: 370, y: 330 }, (time - 5) / 4)];
      move(2, blend({ x: 510, y: 250 }, { x: 415, y: 255 }, (time - 5) / 4));
    }
    if (time >= 10 && time < 15) {
      message = "Leave the dragon’s frontal";
      breath = true;
      actors[2].marked = true;
      move(
        2,
        blend(
          { x: 430, y: 245 },
          mistake ? { x: 430, y: 245 } : { x: 310, y: 290 },
          (time - 10) / 2,
        ),
      );
      if (mistake && time >= 13) {
        failure = true;
        actors[2].hurt = true;
      }
    }
    if (time >= 15) message = "Stop casting · dispel the tank";
  }
  return {
    time,
    cue,
    actors,
    boss,
    dragon,
    pools,
    storm,
    zone,
    adds,
    shield,
    projectile,
    lane,
    breath,
    wind,
    message,
    failure,
    remaining: null as number | null,
  };
}
export type RubyWorld = ReturnType<typeof getRubyState>;
