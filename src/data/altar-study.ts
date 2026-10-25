import { tacticsDungeons } from "./tactics-catalog";

export type AltarBossId = "ravi" | "writhing-coil" | "zuljan";
export type StudyFrame = {
  label: string;
  cue: string;
  action: string;
  why: string;
  caption: string;
};
export type AltarStudy = {
  id: AltarBossId;
  focus: string;
  mechanic: string;
  objective: string;
  frames: readonly StudyFrame[];
  mistakeCue: string;
  wrong: string;
  right: string;
  options: readonly {
    id: string;
    label: string;
    correct: boolean;
    feedback: string;
  }[];
};
/** Original scene design. Geometry and marker locations are teaching choices. */
export const altarStudies: readonly AltarStudy[] = [
  {
    id: "ravi",
    focus: "Tank movement",
    mechanic: "Ssscavenging",
    objective: "Find the pile without a corpse.",
    frames: [
      {
        label: "Look",
        cue: "Check the three piles.",
        action: "Find the empty one.",
        why: "The boss must not feed on a corpse.",
        caption: "A and B have corpses. C is empty.",
      },
      {
        label: "Move",
        cue: "You are the gold tank.",
        action: "Lead Rav’i to C.",
        why: "Move before Ssscavenging.",
        caption: "The boss follows the tank toward the empty pile.",
      },
      {
        label: "Finish",
        cue: "The shield is active.",
        action: "Cover soaks. Break the shield.",
        why: "End the shield phase sooner.",
        caption: "The ring marks the shield; floor circles mark soaks.",
      },
    ],
    mistakeCue: "The boss is beside a corpse.",
    wrong: "A corpse is here. Find the empty pile instead.",
    right: "C is empty. Bring the boss here before the cast.",
    options: [
      { id: "a", label: "Pile A", correct: false, feedback: "A has a corpse." },
      { id: "b", label: "Pile B", correct: false, feedback: "B has a corpse." },
      {
        id: "c",
        label: "Pile C",
        correct: true,
        feedback: "C is the empty pile.",
      },
    ],
  },
  {
    id: "writhing-coil",
    focus: "Group movement",
    mechanic: "Death Rattle",
    objective: "Break the links. Then regroup.",
    frames: [
      {
        label: "Look",
        cue: "Links connect the players.",
        action: "Notice your tether.",
        why: "The links cause group damage.",
        caption: "You are gold. Each player has a link to the centre.",
      },
      {
        label: "Move",
        cue: "The links must snap.",
        action: "Move outward.",
        why: "Snapping them stops that damage.",
        caption: "The gold player moves out; the broken link fades.",
      },
      {
        label: "Finish",
        cue: "Five adds appear.",
        action: "Gather and control them.",
        why: "Focus damage together.",
        caption: "Players regroup after breaking their links.",
      },
    ],
    mistakeCue: "The gold player is still linked.",
    wrong: "Too early to stack. Break your tether first.",
    right: "Move outward first; regroup for the adds afterwards.",
    options: [
      {
        id: "a",
        label: "Move outward",
        correct: true,
        feedback: "Break your tether first.",
      },
      {
        id: "b",
        label: "Move to centre",
        correct: false,
        feedback: "Your tether stays intact.",
      },
      {
        id: "c",
        label: "Join your ally",
        correct: false,
        feedback: "This does not break your tether.",
      },
    ],
  },
  {
    id: "zuljan",
    focus: "Beam assignment",
    mechanic: "Ritual Of The Fang",
    objective: "Cover the missing beam.",
    frames: [
      {
        label: "Look",
        cue: "Four beams point inward.",
        action: "Find an uncovered beam.",
        why: "All four need covering.",
        caption: "Trace each line from its source toward the boss.",
      },
      {
        label: "Move",
        cue: "Three players are in place.",
        action: "Take the open fourth beam.",
        why: "Do not double up.",
        caption: "The lower-right beam still reaches the boss.",
      },
      {
        label: "Finish",
        cue: "Four players intercept.",
        action: "Hold your assignment.",
        why: "Be ready for incoming damage.",
        caption: "Each source now meets a player before the boss.",
      },
    ],
    mistakeCue: "Two players share one beam.",
    wrong: "This leaves a beam uncovered. Check the lower-right line.",
    right: "Move to B to cover the fourth beam.",
    options: [
      {
        id: "a",
        label: "Upper-left beam",
        correct: false,
        feedback: "An ally already covers it.",
      },
      {
        id: "b",
        label: "Lower-right beam",
        correct: true,
        feedback: "This is the uncovered beam.",
      },
      {
        id: "c",
        label: "Beside the boss",
        correct: false,
        feedback: "This is outside the beam.",
      },
    ],
  },
];
export const altarDungeon = tacticsDungeons.find(
  (d) => d.id === "altar-of-fangs",
)!;
export function getAltarStudy(id: string) {
  return altarStudies.find((s) => s.id === id);
}
