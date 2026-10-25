import type { AltarBossId } from "./altar-study";

export type PlayerId = "P1" | "P2" | "P3" | "P4" | "P5";
export type Point = { x: number; y: number };
export type PlaybackCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  instruction: string;
  kind: "cast" | "channel" | "movement" | "event" | "condition";
  phase: number;
  target: string;
  verifiedDuration?: number;
  source?: string;
  interrupted?: boolean;
};
export type PlaybackActor = Point & {
  id: PlayerId;
  role: "Tank" | "Healer" | "DPS";
  status: string;
  marked: boolean;
  venom: boolean;
};
export const timingSources = {
  ritual:
    "https://us.forums.blizzard.com/en/wow/t/altar-of-fangs-adjustments-august-21/2339724",
  ritualChannel: "https://www.wowhead.com/spell=1300876/ritual-of-the-fang",
  stomp: "https://www.wowhead.com/spell=1307894/ravenous-stomp",
  atrophy: "https://www.wowhead.com/spell=1310358/toxic-atrophy",
  boneslicer: "https://www.wowhead.com/spell=1301413/boneslicer",
} as const;
const cue = (
  id: string,
  start: number,
  end: number,
  phase: number,
  kind: PlaybackCue["kind"],
  title: string,
  instruction: string,
  target: string,
  verifiedDuration?: number,
  source?: string,
  interrupted?: boolean,
): PlaybackCue => ({
  id,
  start,
  end,
  phase,
  kind,
  title,
  instruction,
  target,
  verifiedDuration,
  source,
  interrupted,
});
/** Cast values come from linked spell data; all spacing, movement and outcomes are authored examples, not a boss rotation. */
export const altarPlayback: Record<
  AltarBossId,
  { duration: number; cues: readonly PlaybackCue[] }
> = {
  ravi: {
    duration: 25,
    cues: [
      cue(
        "stomp",
        0,
        3,
        0,
        "cast",
        "Ravenous Stomp",
        "Prepare healing. Watch which piles receive meat.",
        "Whole party",
        3,
        timingSources.stomp,
      ),
      cue(
        "read",
        3,
        6,
        0,
        "event",
        "Fresh Meat lands",
        "A and B received meat. C is empty in this example.",
        "Piles A / B",
      ),
      cue(
        "position",
        6,
        11,
        1,
        "condition",
        "Pre-position before Ssscavenging",
        "P1 leads the boss toward C before energy reaches zero. No fixed travel deadline is assumed.",
        "P1 · tank",
      ),
      cue(
        "soak-cue",
        11,
        14,
        2,
        "condition",
        "Shield + Messy Eater",
        "P3, P4 and P5 cover the example chunks. These are group assignments, not player debuffs.",
        "P3 / P4 / P5",
      ),
      cue(
        "shield",
        14,
        21,
        2,
        "condition",
        "Cover chunks. Break the shield.",
        "Move onto the circles while damaging the shield. The channel ends when the shield breaks, not after a fixed timer.",
        "Assigned soakers + group damage",
      ),
      cue(
        "recover",
        21,
        25,
        2,
        "event",
        "Shield broken · example outcome",
        "Reset for the next mechanic. The illustrated shield break depends on this teaching scenario.",
        "Whole party",
      ),
    ],
  },
  "writhing-coil": {
    duration: 36,
    cues: [
      cue(
        "kick1",
        0,
        3,
        0,
        "cast",
        "Toxic Atrophy · cast 1 / 3",
        "P3 takes the first interrupt. In this example it lands before the cast finishes.",
        "P3 · first kick",
        4,
        timingSources.atrophy,
        true,
      ),
      cue(
        "stop1",
        3,
        4,
        0,
        "event",
        "Interrupted by P3",
        "First cast covered. P4 is next.",
        "P3",
      ),
      cue(
        "kick2",
        4,
        7,
        0,
        "cast",
        "Toxic Atrophy · cast 2 / 3",
        "P4 takes the second interrupt. P3 does not duplicate it.",
        "P4 · second kick",
        4,
        timingSources.atrophy,
        true,
      ),
      cue(
        "stop2",
        7,
        8,
        0,
        "event",
        "Interrupted by P4",
        "Second cast covered. P5 is next.",
        "P4",
      ),
      cue(
        "kick3",
        8,
        11,
        0,
        "cast",
        "Toxic Atrophy · cast 3 / 3",
        "P5 takes the third interrupt. The backup remains available.",
        "P5 · third kick",
        4,
        timingSources.atrophy,
        true,
      ),
      cue(
        "stop3",
        11,
        12,
        0,
        "event",
        "Interrupted by P5",
        "All three casts covered. These are example assignments, not required classes.",
        "P5",
      ),
      cue(
        "tethers",
        12,
        18,
        1,
        "condition",
        "Death Rattle / Vine Grip",
        "All five players move out. Uncoil begins only after the last attached player breaks their link.",
        "All five players",
      ),
      cue(
        "group",
        18,
        22,
        2,
        "movement",
        "Uncoil · player fixates",
        "Bring the fixating adds into a controlled cleave area. Do not assume a tank taunt handles every fixate.",
        "Fixated players",
      ),
      cue(
        "burst",
        22,
        29,
        2,
        "condition",
        "Controlled Uncoil damage window",
        "Use the planned damage window; maintain control and add interrupts. This phase is shortened for teaching.",
        "Whole party",
      ),
      cue(
        "reform",
        29,
        33,
        2,
        "movement",
        "Reform · avoid the lines",
        "Leave the illustrated reform paths. The transition timing here is schematic.",
        "Whole party",
      ),
      cue(
        "reset",
        33,
        36,
        2,
        "event",
        "Boss reformed",
        "Damage dealt to the split carries into the reformed boss. Prepare the next cycle.",
        "Whole party",
      ),
    ],
  },
  zuljan: {
    duration: 28,
    cues: [
      cue(
        "ritual-cast",
        0,
        5,
        0,
        "cast",
        "Ritual of the Fang",
        "P2–P5 reach their assigned beam lanes before the cast finishes. P1 stays with the boss.",
        "Four assigned soakers",
        5,
        timingSources.ritual,
      ),
      cue(
        "ritual-beams",
        5,
        13,
        0,
        "channel",
        "Ritual of the Fang · beams active",
        "Hold the four lanes. Ritual Venom is active on the soakers; plan its clear.",
        "P2 / P3 / P4 / P5",
        8,
        timingSources.ritualChannel,
      ),
      cue(
        "edge",
        13,
        16,
        1,
        "movement",
        "Move to the planned edge clear",
        "This example uses a shared edge clear. Actual assignments depend on the group and healing plan.",
        "Venom players",
      ),
      cue(
        "boneslicer",
        16,
        21,
        1,
        "cast",
        "Boneslicer",
        "P5 is the chosen axe target in this example. Venom players use the planned line; do not eat unrelated frontals.",
        "P5 · axe target",
        5,
        timingSources.boneslicer,
      ),
      cue(
        "axe-flight",
        21,
        21.65,
        1,
        "event",
        "Axe released · wait for the hit",
        "Hold the planned line until the physical hit. Projectile travel here is illustrative, not a sourced reaction timer.",
        "P5 · chosen target",
      ),
      cue(
        "blood",
        21.65,
        24,
        2,
        "event",
        "Physical hit → blood pools",
        "Leave the blood and inspect your debuff. The illustrated outcome assumes a successful clear; one hit is not guaranteed to clear every stack.",
        "All venom players",
      ),
      cue(
        "clean",
        24,
        28,
        2,
        "movement",
        "Reset in usable space",
        "Keep the centre open. If venom remains, follow the next agreed clear instead of assuming the mechanic is finished.",
        "Whole party",
      ),
    ],
  },
};
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const p = clamp01(n);
  return p * p * (3 - 2 * p);
};
const move = (
  a: Point,
  b: Point,
  t: number,
  start: number,
  end: number,
): Point => {
  const p = smooth((t - start) / (end - start));
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
};
const ids: PlayerId[] = ["P1", "P2", "P3", "P4", "P5"];
export const beamSources: Point[] = [
  { x: 95, y: 75 },
  { x: 505, y: 75 },
  { x: 95, y: 345 },
  { x: 505, y: 345 },
];
export const beamSlots: Point[] = [
  { x: 185, y: 135 },
  { x: 415, y: 135 },
  { x: 185, y: 285 },
  { x: 415, y: 285 },
];
const raviStart: Point[] = [
  { x: 300, y: 267 },
  { x: 205, y: 300 },
  { x: 265, y: 345 },
  { x: 355, y: 345 },
  { x: 450, y: 330 },
];
const raviSoaks: Point[] = [
  { x: 255, y: 287 },
  { x: 365, y: 320 },
  { x: 490, y: 300 },
];
const coilStart: Point[] = [
  { x: 175, y: 115 },
  { x: 425, y: 115 },
  { x: 135, y: 285 },
  { x: 300, y: 335 },
  { x: 465, y: 285 },
];
const coilOut: Point[] = [
  { x: 110, y: 80 },
  { x: 490, y: 80 },
  { x: 80, y: 330 },
  { x: 300, y: 360 },
  { x: 520, y: 330 },
];
const coilStack: Point[] = [
  { x: 230, y: 275 },
  { x: 300, y: 305 },
  { x: 370, y: 275 },
  { x: 260, y: 342 },
  { x: 340, y: 342 },
];
const coilReset: Point[] = [
  { x: 300, y: 80 },
  { x: 480, y: 145 },
  { x: 440, y: 340 },
  { x: 190, y: 330 },
  { x: 100, y: 200 },
];
const addStart: Point[] = [
  { x: 165, y: 100 },
  { x: 435, y: 100 },
  { x: 120, y: 260 },
  { x: 300, y: 300 },
  { x: 480, y: 260 },
];
const addStack: Point[] = [
  { x: 260, y: 148 },
  { x: 300, y: 134 },
  { x: 340, y: 148 },
  { x: 277, y: 190 },
  { x: 327, y: 190 },
];
const zulStart: Point[] = [
  { x: 300, y: 280 },
  { x: 220, y: 225 },
  { x: 245, y: 330 },
  { x: 375, y: 225 },
  { x: 365, y: 340 },
];
export const clearStack: Point = { x: 485, y: 335 };
const clearSlots: Point[] = [clearStack, clearStack, clearStack, clearStack];
const resetSlots: Point[] = [
  { x: 410, y: 110 },
  { x: 555, y: 180 },
  { x: 330, y: 330 },
  { x: 550, y: 365 },
];
export function getPlaybackState(boss: AltarBossId, value: number) {
  const timeline = altarPlayback[boss],
    time = Math.max(
      0,
      Math.min(timeline.duration, Number.isFinite(value) ? value : 0),
    );
  const index = Math.max(
    0,
    timeline.cues.findIndex((c) => time >= c.start && time < c.end),
  );
  const current =
    time === timeline.duration
      ? timeline.cues[timeline.cues.length - 1]
      : timeline.cues[index];
  const actors: PlaybackActor[] = ids.map((id, i) => {
    let p: Point,
      status = "Ready",
      marked = false,
      venom = false;
    if (boss === "ravi") {
      p = raviStart[i];
      if (i === 0) {
        p = move(p, { x: 410, y: 242 }, time, 6, 11);
        status =
          time < 6 ? "Watch piles" : time < 11 ? "Lead to C" : "Hold boss";
      } else if (i === 1)
        status =
          time < 11
            ? "Prepare healing"
            : time < 21
              ? "Shield-phase healing"
              : "Recover";
      else {
        p = move(p, raviSoaks[i - 2], time, 12, 16);
        status =
          time < 11
            ? "Prepare shield damage"
            : time < 16
              ? "Assigned soak"
              : time < 21
                ? "Cover + shield damage"
                : "Recover";
        if (time >= 21) p = move(raviSoaks[i - 2], raviStart[i], time, 21, 25);
      }
    } else if (boss === "writhing-coil") {
      p = move(coilStart[i], coilOut[i], time, 13, 16.2 + i * 0.45);
      if (time >= 18) p = move(coilOut[i], coilStack[i], time, 18, 22);
      if (time >= 29) p = move(coilStack[i], coilReset[i], time, 29, 33);
      status =
        time < 12
          ? i >= 2
            ? `Kick ${i - 1} assigned`
            : "Backup / support"
          : time < 18
            ? time >= 16.2 + i * 0.45
              ? "Link broken"
              : "Move out · linked"
            : time < 29
              ? "Control + cleave"
              : "Avoid reform paths";
      marked = time >= 18 && time < 29;
    } else {
      p =
        i === 0
          ? zulStart[0]
          : move(zulStart[i], beamSlots[i - 1], time, 1, 4.7);
      if (i > 0 && time >= 13)
        p = move(beamSlots[i - 1], clearSlots[i - 1], time, 13, 16);
      if (i > 0 && time >= 21.65)
        p = move(clearSlots[i - 1], resetSlots[i - 1], time, 21.65, 24);
      venom = i > 0 && time >= 5;
      marked = i === 4 && time >= 16 && time < 21.65;
      status =
        i === 0
          ? "Tank · hold boss"
          : time < 5
            ? "Reach beam"
            : time < 13
              ? "Soak · venom active"
              : time < 16
                ? "Move to edge clear"
                : time < 21
                  ? i === 4
                    ? "Axe target · planned clear"
                    : "Planned clear"
                  : time < 21.65
                    ? "Wait for physical hit"
                    : time < 24
                      ? "Leave blood · check stacks"
                      : "Verify venom · next clear if needed";
    }
    const landed = current.id.match(/^stop([1-3])$/)?.[1];
    if (landed && i === Number(landed) + 1) status = "Interrupt landed";
    return {
      ...p,
      id,
      role: i === 0 ? "Tank" : i === 1 ? "Healer" : "DPS",
      status,
      marked,
      venom,
    };
  });
  const bossPosition =
    boss === "ravi"
      ? move({ x: 300, y: 190 }, { x: 410, y: 165 }, time, 6, 11)
      : { x: 300, y: 210 };
  const tethers =
    boss === "writhing-coil" && time >= 12 && time < 18
      ? actors.map((a, i) => ({ actor: a, broken: time >= 16.2 + i * 0.45 }))
      : [];
  const adds =
    boss === "writhing-coil" && time >= 18 && time < 33
      ? addStart.map((p, i) =>
          move(
            time >= 29 ? addStack[i] : p,
            time >= 29 ? { x: 300, y: 210 } : addStack[i],
            time,
            time >= 29 ? 29 : 18,
            time >= 29 ? 33 : 22,
          ),
        )
      : [];
  const remaining =
    current.verifiedDuration === undefined
      ? null
      : Math.max(0, current.verifiedDuration - (time - current.start));
  return {
    time,
    current,
    actors,
    interruptPlayer:
      actors.find((a) => a.status === "Interrupt landed") ?? null,
    bossPosition,
    tethers,
    adds,
    remaining,
    castProgress: current.verifiedDuration
      ? clamp01((time - current.start) / current.verifiedDuration)
      : null,
    soaks:
      boss === "ravi" && time >= 11 && time < 21
        ? raviSoaks.map((p, i) => ({
            ...p,
            player: ids[i + 2],
            covered:
              Math.hypot(actors[i + 2].x - p.x, actors[i + 2].y - p.y) < 13,
          }))
        : [],
    shield:
      boss === "ravi" && time >= 11 && time < 21
        ? 1 - clamp01((time - 14) / 7)
        : null,
    beams: boss === "zuljan" && time >= 5 && time < 13,
    clearPath: boss === "zuljan" && time >= 16 && time < 21.65,
    projectile:
      boss === "zuljan" && time >= 21 && time < 21.65
        ? move({ x: 300, y: 210 }, clearStack, time, 21, 21.65)
        : null,
    pools:
      boss === "zuljan" && time >= 21.65
        ? clearSlots.map((p, i) => ({
            x: p.x + (i % 2 ? 10 : -10),
            y: p.y + (i < 2 ? -8 : 8),
          }))
        : [],
    reform: boss === "writhing-coil" && time >= 29 && time < 33,
    bossVisible: boss !== "writhing-coil" || time < 18 || time >= 33,
  };
}
