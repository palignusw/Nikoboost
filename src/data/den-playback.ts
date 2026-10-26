import { getDenLesson, lerpDen, type DenBossId, type Vec } from "./den-guide";
export type DenActor = Vec & {
  id: string;
  role: "Tank" | "Healer" | "DPS";
  marked: boolean;
  status: string;
  poison: boolean;
};
const v = (x: number, y: number): Vec => ({ x, y });
export const denGeometry = {
  mushroom: v(330, 310),
  adds: [v(240, 240), v(435, 240)],
  rimes: [v(205, 310), v(435, 310)],
  echoDrops: [v(100, 95), v(100, 210), v(100, 325)],
  intercepts: [v(230, 169.75), v(180, 210), v(230, 250.25)],
};
export function getDenState(boss: DenBossId, value: number, mistake = false) {
  const lesson = getDenLesson(boss)!;
  const time = Math.max(
    0,
    Math.min(lesson.duration, Number.isFinite(value) ? value : 0),
  );
  const cue =
    lesson.cues.find((c) => time >= c.start && time < c.end) ??
    lesson.cues[lesson.cues.length - 1];
  let bossAt = v(300, 170),
    npc: Vec | null = null;
  const mushroomCaught = !mistake && time >= 11;
  const rimeFailed =
    boss === "sentinel-of-winter" && mistake && time >= 22 && time < 26;
  const echoFailed = boss === "nalorakk" && mistake && time >= 22;
  const failure =
    (boss === "hoardmonger" && mistake && time >= 18 && time < 23) ||
    rimeFailed ||
    echoFailed;
  if (boss === "hoardmonger")
    bossAt = lerpDen(v(300, 170), v(175, 130), time, 0, 5);
  if (boss === "sentinel-of-winter" && time >= 12) {
    bossAt = lerpDen(v(300, 170), v(240, 175), time, 12, 16);
    if (time >= 32) bossAt = lerpDen(v(240, 175), v(435, 175), time, 32, 36);
  }
  if (boss === "nalorakk") {
    bossAt = v(400, 180);
    npc = time < 6 ? v(300, 280) : time < 16 ? v(400, 310) : v(300, 210);
  }
  const actors: DenActor[] = Array.from({ length: 5 }, (_, i) => {
    let p = [v(300, 250), v(215, 310), v(280, 340), v(390, 340), v(460, 290)][
      i
    ];
    let marked = false,
      poison = false,
      status = "Ready";
    if (boss === "hoardmonger") {
      if (i === 0) p = lerpDen(p, v(175, 205), time, 0, 5);
      if (i === 2 && !mistake)
        p = lerpDen(p, denGeometry.mushroom, time, 8, 11);
      if (time >= 18)
        p = lerpDen(
          p,
          [v(140, 235), v(170, 310), v(245, 335), v(295, 355), v(470, 175)][i],
          time,
          18,
          20,
        );
      if (time >= 23) p = lerpDen(p, v(p.x - 8, p.y + 20), time, 24, 25);
      poison = mistake ? time >= 18 : i === 2 && time >= 11 && time < 23;
      marked = i === 4 && time >= 18 && time < 20;
      status =
        time < 6
          ? i === 0
            ? "Choose nearest unused pile"
            : "Leave room for the tank"
          : time < 18
            ? i === 2
              ? mushroomCaught
                ? "Collected · poison active"
                : mistake
                  ? "Leaving mushroom uncovered"
                  : "Cover highlighted mushroom"
              : "Cover other actual mushrooms"
            : time < 23
              ? "Leave the frontal cone"
              : time < 28
                ? "Watch landing · Bellow damage"
                : "Reassess unused piles";
    } else if (boss === "sentinel-of-winter") {
      const bait = [
        v(390, 185),
        v(435, 105),
        v(480, 105),
        v(435, 150),
        v(480, 150),
      ];
      const clear = [
        v(300, 285),
        v(165, 150),
        v(225, 115),
        v(295, 105),
        v(355, 120),
      ];
      p = lerpDen(bait[i], clear[i], time, 4, 8);
      if (i === 2 && time >= 16 && !mistake)
        p = lerpDen(p, denGeometry.rimes[0], time, 16, 20);
      if (time >= 22 && time < 32)
        p = lerpDen(
          p,
          [v(240, 225), v(205, 245), v(240, 270), v(270, 245), v(205, 280)][i],
          time,
          mistake ? 26 : 22,
          mistake ? 28 : 24,
        );
      if (time >= 32)
        p = lerpDen(
          [v(240, 225), v(205, 245), v(240, 270), v(270, 245), v(205, 280)][i],
          [v(435, 205), v(345, 260), v(390, 300), v(435, 310), v(495, 275)][i],
          time,
          32,
          36,
        );
      status =
        time < 4
          ? "Bait together"
          : time < 8
            ? "Leave the squall patch"
            : time < 12
              ? "Dodge impact circles"
              : time < 16
                ? "Focus A · control B"
                : time < 22
                  ? i === 2
                    ? mistake
                      ? "Missing Rimeshatter A"
                      : "Hold Rimeshatter A"
                    : "Keep B controlled"
                  : time < 24
                    ? "Reach the snowdrift"
                    : time < 32
                      ? "Drift inside eye · heal storm"
                      : time < 36
                        ? "Kill B · stop its cast"
                        : time < 42
                          ? i === 3
                            ? "Hold Rimeshatter B"
                            : "Keep clear of squalls"
                          : "Prepare next bait";
    } else {
      const initial = [
        v(400, 255),
        v(450, 285),
        v(330, 110),
        v(325, 210),
        v(330, 320),
      ];
      p =
        i < 2
          ? initial[i]
          : lerpDen(initial[i], denGeometry.echoDrops[i - 2], time, 0, 3.6);
      marked = i >= 2 && time < 4;
      if (time >= 4 && time < 6)
        p = lerpDen(
          p,
          [v(400, 255), v(450, 285), v(290, 155), v(285, 220), v(290, 290)][i],
          time,
          4,
          6,
        );
      const shelter = [
        v(370, 350),
        v(415, 350),
        v(350, 385),
        v(395, 385),
        v(440, 385),
      ];
      if (time >= 6 && time < 10)
        p = lerpDen(
          [v(400, 255), v(450, 285), v(290, 155), v(285, 220), v(290, 290)][i],
          shelter[i],
          time,
          6,
          7.8,
        );
      const slam = [
        v(400, 310),
        v(485, 335),
        v(310, 335),
        v(480, 255),
        v(485, 385),
      ];
      if (time >= 10 && time < 16)
        p = lerpDen(shelter[i], slam[i], time, 10, 13);
      if (time >= 16)
        p = lerpDen(
          slam[i],
          i < 2
            ? [v(350, 155), v(350, 265)][i]
            : mistake && i === 4
              ? v(390, 325)
              : denGeometry.intercepts[i - 2],
          time,
          16,
          18,
        );
      status =
        time < 4
          ? marked
            ? "Place your mark · separated"
            : "Keep shield side clear"
          : time < 6
            ? "Leave echo melee range"
            : time < 10
              ? "Behind Zul’jarra’s shield"
              : time < 14
                ? i === 0
                  ? "Cover Slam · mitigation"
                  : "Stay outside Slam circle"
                : time < 16
                  ? "Prepare interception wall"
                  : time < 22
                    ? i >= 2
                      ? mistake && i === 4
                        ? "Charge lane uncovered"
                        : "Hold assigned charge lane"
                      : "Support the interception wall"
                    : echoFailed
                      ? "Echo reached Zul’jarra"
                      : "Charges blocked · watch later waves";
    }
    if (boss === "sentinel-of-winter" && mistake && time >= 22 && time < 26)
      status = "Rooted · missed Rimeshatter";
    return {
      ...p,
      id: `P${i + 1}`,
      role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
      marked,
      poison,
      status,
    };
  });
  const remaining =
    cue.window && !(boss === "hoardmonger" && mushroomCaught)
      ? Math.max(0, cue.end - time)
      : null;
  const mushroom =
    boss === "hoardmonger" && time >= 6 && time < 18 && !mushroomCaught
      ? {
          ...denGeometry.mushroom,
          remaining: 18 - time,
          growth: (time - 6) / 12,
        }
      : null;
  const rimeIndex =
    boss === "sentinel-of-winter" && time >= 16 && time < 22
      ? 0
      : boss === "sentinel-of-winter" && time >= 36 && time < 42
        ? 1
        : -1;
  const echoes =
    boss === "nalorakk" && time >= 4
      ? denGeometry.echoDrops.map((p, i) => ({
          ...lerpDen(
            p,
            mistake && i === 2 ? v(300, 210) : denGeometry.intercepts[i],
            time,
            18,
            22,
          ),
          intercepted: time >= 22 && !(mistake && i === 2),
        }))
      : [];
  return {
    time,
    cue,
    actors,
    bossAt,
    npc,
    remaining,
    mushroom,
    failure,
    mushroomCaught,
    echoes,
    rime:
      rimeIndex < 0
        ? null
        : {
            ...denGeometry.rimes[rimeIndex],
            remaining: (rimeIndex === 0 ? 22 : 42) - time,
            covered:
              !(mistake && rimeIndex === 0) &&
              time >= (rimeIndex === 0 ? 20 : 36),
          },
    adds:
      boss !== "sentinel-of-winter"
        ? []
        : denGeometry.adds.map((p, i) => ({
            ...p,
            id: i ? "B" : "A",
            visible: time >= 12 && time < (i ? 36 : 16),
            controlled: i === 1 && time >= 12 && time < 32,
            dead: time >= (i ? 36 : 16),
          })),
    bait: boss === "sentinel-of-winter" && time < 4,
    squalls: boss === "sentinel-of-winter" && time >= 4,
    spikeImpacts: boss === "sentinel-of-winter" && time >= 8 && time < 12,
    inDrift: actors.every((a) => Math.hypot(a.x - 240, a.y - 250) < 66),
    tempest: boss === "sentinel-of-winter" && time >= 24 && time < 32,
    shelter: boss === "nalorakk" && time >= 6 && time < 10,
    slam: boss === "nalorakk" && time >= 10 && time < 14,
    frontal: boss === "hoardmonger" && time >= 18 && time < 23,
    intercepting: boss === "nalorakk" && time >= 16 && time < 22,
  };
}
