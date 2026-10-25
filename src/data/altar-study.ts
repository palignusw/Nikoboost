import { tacticsDungeons } from "./tactics-catalog";
export type AltarBossId = "ravi" | "writhing-coil" | "zuljan";
export type StudyFrame = {
  label: string;
  cue: string;
  action: string;
  why: string;
  caption: string;
  event: string;
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
  practicePrompt: string;
  practiceContext: string;
  calls: readonly { label: string; text: string }[];
  options: readonly {
    id: string;
    label: string;
    correct: boolean;
    feedback: string;
  }[];
};
export const altarSources = [
  {
    label: "Tactyks · mechanic execution",
    url: "https://www.method.gg/guides/dungeons/altar-of-fangs",
    detail: "Player-authored guide · 22 Aug 2026",
  },
  {
    label: "Petko · boss and role priorities",
    url: "https://www.icy-veins.com/wow/altar-of-fangs-dungeon-guide",
    detail: "Player-authored guide · 12 Oct 2026",
  },
  {
    label: "Skandar · published +21–23 route",
    url: "https://keystone.guru/route/altar-of-fangs/vviWp8V/skandar-tank-altar-of-fangs-rank-1-route-21-to-23-01-title-keys",
    detail: "Author’s route notes · coordinated group plan",
  },
] as const;
/** Guide-backed mechanics plus explicitly suggested group assignments; not a claim that every high-key team plays identically. */
export const altarStudies: readonly AltarStudy[] = [
  {
    id: "ravi",
    focus: "Position + shield damage",
    mechanic: "Ssscavenging",
    objective: "Arrive prepared. Shorten the dangerous phase.",
    frames: [
      {
        label: "Read",
        event: "Ravenous Stomp → Fresh Meat",
        cue: "Stomp reveals which piles received meat.",
        action: "Identify the empty pile early.",
        why: "The nearest pile is chosen when energy runs out.",
        caption: "C is empty in this example. Recheck after each Stomp.",
      },
      {
        label: "Set up",
        event: "Before Ssscavenging",
        cue: "The next shield is approaching.",
        action: "Pre-position. Keep burst available.",
        why: "Feeding Frenzy makes the healing check worse.",
        caption: "The tank moves early; damage dealers prepare for the shield.",
      },
      {
        label: "Execute",
        event: "Shield + Messy Eater",
        cue: "The eating phase has started.",
        action: "Cover chunks. Burn the shield.",
        why: "Missed chunks add damage; breaking the shield ends the channel.",
        caption:
          "Handle the circles while focusing the shield. Do not trade a missed soak for more damage.",
      },
    ],
    mistakeCue: "The boss feeds beside Fresh Meat.",
    wrong:
      "Late positioning makes the shield phase harder. Set up before the cast.",
    right: "Plan useful burst for the shield while still covering the chunks.",
    practicePrompt: "The feeding phase is next. What is the damage plan?",
    practiceContext:
      "Your team is already moving to the empty pile. Choose the next team call.",
    calls: [
      {
        label: "Preparation",
        text: "Agree who covers each side’s chunks; choose damage tools that will be ready for the shield.",
      },
      {
        label: "Defensives",
        text: "Plan healing for the channel and personals for overlaps. Do not assume the healer can cover an extended shield alone.",
      },
      {
        label: "Adaptation",
        text: "Do not hold every cooldown indefinitely. Match the chosen tools to your actual next shield window.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Prepare burst for the shield; cover chunks",
        correct: true,
        feedback: "Shorten the channel without missing the soaks.",
      },
      {
        id: "b",
        label: "Spend everything now; handle the shield later",
        correct: false,
        feedback: "You may enter the dangerous phase without useful damage.",
      },
      {
        id: "c",
        label: "Ignore chunks to maximise shield damage",
        correct: false,
        feedback: "Missed chunks add group damage.",
      },
    ],
  },
  {
    id: "writhing-coil",
    focus: "Interrupts + Uncoil window",
    mechanic: "Toxic Atrophy / Uncoil",
    objective: "Assign the kicks. Make the split phase count.",
    frames: [
      {
        label: "Assign",
        event: "Three consecutive casts",
        cue: "Toxic Atrophy repeats three times.",
        action: "Cover all three interrupts.",
        why: "One kick is not the whole sequence.",
        caption:
          "Agree a primary order and a backup before the pull. Names depend on your composition.",
      },
      {
        label: "Break",
        event: "Death Rattle → tether break",
        cue: "Every player must break their own link.",
        action: "Use movement. Snap the links quickly.",
        why: "Do not prolong the heavy group damage.",
        caption:
          "Keep movement available for this transition; regroup after your link breaks.",
      },
      {
        label: "Burst",
        event: "Uncoil → five fixating adds",
        cue: "The boss splits into five adds.",
        action: "Group the adds. Control and cleave.",
        why: "Their remaining health determines the reformed boss’s health.",
        caption:
          "Use damage here, cover add casts, and avoid the reform lines. Fixates require everyone’s positioning.",
      },
    ],
    mistakeCue: "The gold player’s link has not broken.",
    wrong: "Rushing the stack with a tether intact delays the damage window.",
    right:
      "Use the grouped Uncoil phase for damage, with interrupt and control coverage.",
    practicePrompt: "The five adds are grouped. What is the next call?",
    practiceContext:
      "The links are broken. Adds can fixate players and still cast.",
    calls: [
      {
        label: "Interrupt order",
        text: "Name first, second and third interrupters, then a backup. Check actual kick cooldowns; two people must not spend their kick on one cast.",
      },
      {
        label: "Damage window",
        text: "Plan cleave and control for Uncoil. Player fixates make this a group-positioning task. If fixated, use control to avoid the add’s melee.",
      },
      {
        label: "Exit",
        text: "Keep watching casts and reform lines while dealing damage. A clean burst window still needs mechanics.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Cleave now; maintain kicks and control",
        correct: true,
        feedback: "Use the window without surrendering cast coverage.",
      },
      {
        id: "b",
        label: "Scatter the adds to make individual duels",
        correct: false,
        feedback: "Scattering loses the planned cleave window.",
      },
      {
        id: "c",
        label: "Stop all interrupts and focus only on damage",
        correct: false,
        feedback: "The adds still cast.",
      },
    ],
  },
  {
    id: "zuljan",
    focus: "Soak → edge → clear",
    mechanic: "Ritual Venom / Boneslicer",
    objective: "Plan the venom clear before you soak.",
    frames: [
      {
        label: "Soak",
        event: "Ritual Of The Fang",
        cue: "Four lanes need assigned soakers.",
        action: "Cover the beams. Track your venom.",
        why: "A successful soak is not the end of the mechanic.",
        caption: "Use agreed lanes; watch Ritual Venom’s remaining duration.",
      },
      {
        label: "Clear",
        event: "Venom active → planned Boneslicer",
        cue: "Venom must be removed before it expires.",
        action: "Clear at the edge with Boneslicer.",
        why: "Physical damage clears venom; the clear leaves blood pools.",
        caption:
          "The selected route uses Boneslicer at the edge. This is a deliberate clear, not an instruction to eat every frontal.",
      },
      {
        label: "Reset",
        event: "Clear confirmed → leave blood",
        cue: "Blood remains where stacks were removed.",
        action: "Leave the pools. Recheck your stacks.",
        why: "Keep the centre usable for the next cycle.",
        caption:
          "Check that venom is gone; do not assume one hit always clears every stack.",
      },
    ],
    mistakeCue: "The clear leaves blood in the middle.",
    wrong:
      "A central clear takes away space for later movement. Use the planned edge position.",
    right:
      "Take the planned edge clear before expiry, then leave blood and verify the debuff.",
    practicePrompt: "You have Ritual Venom. Where does the plan go next?",
    practiceContext: "The beams are handled. Your debuff is still active.",
    calls: [
      {
        label: "Assignments",
        text: "Agree beam lanes and a clear position before pulling. Do not improvise the plan after soaking.",
      },
      {
        label: "Selected route",
        text: "Skandar’s published +21–23 plan moves venom players to the edge for Boneslicer, keeping blood out of the middle.",
      },
      {
        label: "Support",
        text: "Have healing ready for beam damage and the clear. Boneslicer is the default here; chasing an axe is not this plan.",
      },
    ],
    options: [
      {
        id: "a",
        label: "Wait in the centre until venom expires",
        correct: false,
        feedback: "The debuff cannot be left to expire.",
      },
      {
        id: "b",
        label: "Use the planned edge Boneslicer; leave blood",
        correct: true,
        feedback: "Soak, move to the edge, clear, then reset.",
      },
      {
        id: "c",
        label: "Treat every physical hit as automatically safe",
        correct: false,
        feedback: "The clear still needs timing, positioning and healing.",
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
