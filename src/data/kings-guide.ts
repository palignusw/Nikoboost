export type KingsBossId =
  "golden-serpent" | "mchimba" | "council-of-tribes" | "dazar";
export type KingsRole = "tank" | "healer" | "damage";
export type KingsCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<KingsRole, string>;
  window?: number;
  source?: string;
  timerLabel?: string;
};
export type KingsLesson = {
  id: KingsBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: KingsCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const kingsSources = {
  method: "https://www.method.gg/guides/dungeons/kings-rest",
  petko: "https://www.icy-veins.com/wow/kings-rest-dungeon-guide",
};
const c = (
  id: string,
  start: number,
  title: string,
  action: string,
  done: string,
  tank: string,
  healer: string,
  damage: string,
): KingsCue => ({
  id,
  start,
  end: start + 5,
  title,
  action,
  done,
  role: { tank, healer, damage },
});
export const kingsLessons: KingsLesson[] = [
  {
    id: "golden-serpent",
    name: "The Golden Serpent",
    subtitle: "Place gold together. Stop the adds before they reach the boss.",
    duration: 15,
    focus:
      "P3 illustrates one Spit Gold target. Gold positions and the number of adds shown are examples.",
    failureTime: 8,
    mistake: "Animated Gold reaches the boss and empowers it.",
    question: "What should the group do when gold puddles become adds?",
    choices: [
      "Let them reach the boss",
      "Slow and defeat them before they reach the boss",
      "Stand in the gold puddles",
    ],
    correct: 1,
    cues: [
      c(
        "spit",
        0,
        "Spit Gold · place puddles together",
        "Marked players drop gold near existing puddles, away from useful space.",
        "Puddles are grouped where the party can deal with the adds.",
        "Keep the boss clear of the puddles.",
        "Heal marked players and prepare for group damage.",
        "If targeted, place the puddle near existing gold.",
      ),
      c(
        "gold",
        5,
        "Lucre’s Call · control Animated Gold",
        "Gold puddles turn into adds moving toward the boss. Slow, control and cleave them down.",
        "The adds are defeated before reaching the boss.",
        "Keep the boss away from the approaching gold.",
        "Heal while helping control the adds when possible.",
        "Switch to the adds and use slows or crowd control.",
      ),
      c(
        "gust",
        10,
        "Serpentine Gust · heal the group",
        "Prepare for the group-wide channel and use healing or defensives as needed.",
        "The group survives the channel.",
        "Use mitigation and stay in healing range.",
        "Use group healing and cooldowns as needed.",
        "Use a defensive if needed and stay in healing range.",
      ),
    ],
  },
  {
    id: "mchimba",
    name: "Mchimba the Embalmer",
    subtitle: "Keep coffins accessible. Find and free your trapped ally.",
    duration: 15,
    focus:
      "Four sarcophagi are shown schematically; P3 is the example trapped player. Look for the shaking coffin in game.",
    failureTime: 8,
    mistake:
      "The trapped player is not freed quickly, allowing additional mummies to appear.",
    question: "A teammate is entombed. Which coffin should you open?",
    choices: [
      "The coffin that is shaking",
      "Any coffin at random",
      "Ignore the coffins and damage the boss",
    ],
    correct: 0,
    cues: [
      c(
        "fire",
        0,
        "Burn Corruption · protect the paths",
        "Drop fire away from the boss and sarcophagi so the party can reach them.",
        "The coffins remain accessible.",
        "Keep the boss clear of the coffin paths.",
        "Heal the targeted player and avoid fire.",
        "If targeted, place fire away from coffins.",
      ),
      c(
        "entomb",
        5,
        "Entomb · find the shaking coffin",
        "Spread out, look for the shaking sarcophagus, and click it to free the trapped player quickly.",
        "The trapped player is released.",
        "Help locate the shaking coffin while controlling the boss.",
        "Keep the group alive while helping locate the coffin.",
        "Find and open the shaking coffin promptly.",
      ),
      c(
        "mummies",
        10,
        "Awakening Slam · interrupt mummies",
        "Prepare for group damage, then cleave the two mummies and interrupt Wretched Discharge.",
        "The mummies are defeated with their casts interrupted.",
        "Collect the mummies and interrupt when possible.",
        "Top the group for the slam and heal the Drain Fluids target above 90% if the channel completes.",
        "Interrupt Wretched Discharge and cleave the mummies.",
      ),
    ],
  },
  {
    id: "council-of-tribes",
    name: "The Council of Tribes",
    subtitle: "Share the charge. Stop Poison Nova. Destroy priority totems.",
    duration: 15,
    focus:
      "P3 is an example Barrel Through target. The group’s formation and totem locations are schematic.",
    failureTime: 3.5,
    mistake: "P3 takes Barrel Through without the group sharing its damage.",
    question:
      "A player is targeted by Barrel Through. What should the group do?",
    choices: [
      "Spread away from the marked player",
      "Group in a safe spot to share the charge",
      "Ignore the charge and stand in axes",
    ],
    correct: 1,
    cues: [
      c(
        "soak",
        0,
        "Barrel Through · share the charge",
        "Group in a safe spot around the target to split damage; avoid spinning axes.",
        "The group shares the charge.",
        "Join the group if safe and plan for Debilitating Backhand.",
        "Prepare healing for the shared hit.",
        "Move to the marked player in a safe spot.",
      ),
      c(
        "interrupt",
        5,
        "Poison Nova · interrupt",
        "Interrupt Poison Nova. Arc Lightning cleaves from the tank, so keep other players clear.",
        "The cast is interrupted.",
        "Keep the tank cleave away from allies.",
        "Prepare for Arc Lightning damage.",
        "Assign an interrupt for Poison Nova.",
      ),
      c(
        "totems",
        10,
        "Call the Elements · switch targets",
        "Destroy the Explosive Totem first, then Thundering and Torrent Totems.",
        "The dangerous totems are destroyed.",
        "Keep the boss and dangerous ground controlled.",
        "Prepare group healing while totems are active.",
        "Switch to Explosive first, then Thundering and Torrent.",
      ),
    ],
  },
  {
    id: "dazar",
    name: "Dazar, the First King",
    subtitle: "Focus Reban. Spread for leaps. Face empowered attacks away.",
    duration: 15,
    focus:
      "The marked P3 represents one leap target; the diagram illustrates spacing, not the total number of targets.",
    failureTime: 8,
    mistake:
      "P3 overlaps another player’s leap area, causing avoidable extra damage.",
    question: "How should marked players handle a leap?",
    choices: [
      "Stack the impact circles",
      "Spread so the impact circles do not overlap",
      "Move into the tank’s frontal",
    ],
    correct: 1,
    cues: [
      c(
        "reban",
        0,
        "Reban · focus and interrupt",
        "Focus Reban early and interrupt Deathly Roar. Avoid Hunting Leap’s frontal through the tank.",
        "Reban is defeated and its additional mechanics stop.",
        "Position safely for Hunting Leap.",
        "Support the tank and group during the add.",
        "Focus Reban and interrupt Deathly Roar.",
      ),
      c(
        "leap",
        5,
        "Aerial Smash / Quaking Leap · spread",
        "Marked players spread from each other so their leap impacts do not overlap.",
        "The leaps land without hitting other players.",
        "Give marked players room.",
        "Prepare for group damage, especially when Dazar is mounted.",
        "Spread your marker away from allies.",
      ),
      c(
        "frontal",
        10,
        "Gilded Destruction · face away",
        "The boss’s melee attacks become frontal. The tank faces the boss away while the group avoids the front.",
        "The empowered attacks end without cleaving the group.",
        "Face the boss away and use a defensive for Blade Combo.",
        "Prepare for group damage and tank damage.",
        "Stay behind or to the side, out of the frontal.",
      ),
    ],
  },
];
export const getKingsLesson = (id: string) =>
  kingsLessons.find((b) => b.id === id);
