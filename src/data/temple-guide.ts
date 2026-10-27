export type TempleBossId =
  "adderis-and-aspix" | "merektha" | "galvazzt" | "avatar-of-sethraliss";
export type TempleRole = "tank" | "healer" | "damage";
export type TempleCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<TempleRole, string>;
  window?: number;
  source?: string;
  timerLabel?: string;
};
export type TempleLesson = {
  id: TempleBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: TempleCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const templeSources = {
  method: "https://www.method.gg/guides/dungeons/temple-of-sethraliss",
  petko: "https://www.icy-veins.com/wow/temple-of-sethraliss-dungeon-guide",
  hotfix:
    "https://news.blizzard.com/en-us/article/24296142/hotfixes-october-6-2026",
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
): TempleCue => ({
  id,
  start,
  end: start + 5,
  title,
  action,
  done,
  role: { tank, healer, damage },
});
export const templeLessons: TempleLesson[] = [
  {
    id: "adderis-and-aspix",
    name: "Adderis and Aspix",
    subtitle: "Attack the unshielded boss. Spread, then regroup for the soak.",
    duration: 25,
    focus:
      "Aspix begins immune. The shield switch is shown later as an example; in game it happens at a boss’s 40% health.",
    failureTime: 13,
    mistake:
      "P3 stays away from the group and misses the shared Thunder and Lightning hit.",
    question: "Gale Force has knocked the group back. What comes next?",
    choices: [
      "Run in to share Thunder and Lightning",
      "Stay spread for the shared hit",
      "Keep attacking the immune boss",
    ],
    correct: 0,
    cues: [
      c(
        "shield",
        0,
        "Storm Blessed · attack the unshielded boss",
        "Aspix starts immune. Attack Adderis until the shield switches when a boss reaches 40% health.",
        "Switch to the boss without the immunity shield.",
        "Tank the active boss and use mitigation for Overload.",
        "Spot-heal players affected by Gust.",
        "Do not spend damage on the shielded boss.",
      ),
      c(
        "gale",
        5,
        "Gale Force · separate and plan the knockback",
        "Loosely spread your lines. Use safe walls or knockback prevention and avoid puddles and nearby enemies.",
        "The knockback resolves without cleaving the group.",
        "Plan a safe landing while keeping the boss controlled.",
        "Heal the group and avoid being knocked into danger.",
        "Separate your line and prepare to return to melee.",
      ),
      c(
        "soak",
        10,
        "Thunder and Lightning · regroup",
        "After the knockback, quickly collapse in melee to share the hit.",
        "The party shares the damage.",
        "Help the group regroup in a safe melee position.",
        "Prepare group healing for the shared hit.",
        "Return to the group and share the damage.",
      ),
      c(
        "winds",
        15,
        "Tempest Winds · place puddles away",
        "Marked players move out of the group and place the puddles out of the way.",
        "The group has a clear area for the next knockback.",
        "Keep a safe landing and melee space open.",
        "Heal marked players and keep clear of the puddles.",
        "If marked, place your puddle away from the group.",
      ),
      c(
        "swap",
        20,
        "Storm Blessed · switch targets",
        "When a boss reaches 40% health the shield switches. Stop attacking the newly immune boss and switch to the other one.",
        "The group attacks the boss without the shield.",
        "Position the active boss and defend against Overload.",
        "Continue spot-healing Gust targets.",
        "Switch to the boss without immunity.",
      ),
    ],
  },
  {
    id: "merektha",
    name: "Merektha",
    subtitle:
      "Bring the knots together, free your allies, then control the hatchlings.",
    duration: 20,
    focus:
      "P3 and P4 illustrate the two Knot of Snakes targets. Positions, adds and movement speed are schematic.",
    failureTime: 3.5,
    mistake:
      "The affected players stay apart, making it harder to free both with one area control effect.",
    question: "Two players have Knot of Snakes. What is a useful group plan?",
    choices: [
      "Spread to opposite edges",
      "Bring them to melee and use area crowd control",
      "Ignore both players and attack the boss",
    ],
    correct: 1,
    cues: [
      c(
        "knots",
        0,
        "Knot of Snakes · bring the targets together",
        "The two targeted players stack in melee; use an area control effect to free them, then cleave the snakes.",
        "Both players are freed and the snakes are controlled.",
        "Gather snakes near the boss.",
        "Help free affected allies and heal the group.",
        "Bring the targets together and use an appropriate area stop.",
      ),
      c(
        "spit",
        5,
        "Thunder Spit · place circles at the edge",
        "If targeted, drop the circles near the outside and avoid the resulting puddles.",
        "The centre remains available for the party.",
        "Keep space open for the group and use a defensive for Lightning Bite.",
        "Support targeted players and dispel poison as needed.",
        "Place your circle away from the group.",
      ),
      c(
        "hatch",
        10,
        "Hatch and Burrow · control the adds",
        "At full energy Merektha burrows and summons three Toxic Vipers and a Storm Serpent. Interrupt Poison Spit and dodge her charges.",
        "The adds are defeated and Merektha returns.",
        "Gather the adds near safe ground and avoid the charge.",
        "Heal through the phase and dispel poison when needed.",
        "Interrupt Poison Spit, cleave adds and dodge burrow charges.",
      ),
      c(
        "storm",
        15,
        "Serpentstorm · survive the channel",
        "Prepare for group damage and avoid being knocked into existing puddles.",
        "The channel ends with the group on safe ground.",
        "Keep clear of puddles and prepare mitigation.",
        "Use group healing or a cooldown for the channel.",
        "Use a defensive if needed and avoid puddles.",
      ),
    ],
  },
  {
    id: "galvazzt",
    name: "Galvazzt",
    subtitle: "Intercept every spire beam before it reaches the boss.",
    duration: 20,
    focus:
      "Three spires and example assignments are shown. Agree a rotation with your group; soak damage requires healing and defensives.",
    failureTime: 8,
    mistake: "The uncovered beam reaches Galvazzt and gives the boss energy.",
    question:
      "Where should you stand to stop a Lightning Spire feeding Galvazzt?",
    choices: [
      "Between the spire and the boss",
      "Behind the spire",
      "Next to the boss but outside the beam",
    ],
    correct: 0,
    cues: [
      c(
        "assign",
        0,
        "Lightning Spires · assign coverage",
        "Three spires appear. Choose a player for each beam and agree replacements before stacks become dangerous.",
        "Every beam has a player ready to intercept it.",
        "Position the boss to make beams accessible; agree your soak role.",
        "Plan healing for the people soaking beams.",
        "Take an assigned beam and prepare a defensive.",
      ),
      c(
        "beams",
        5,
        "Intercept · stand between spire and boss",
        "Step into each beam between its spire and the boss. Rotate if necessary and keep all beams covered.",
        "The players intercept the beams instead of feeding the boss.",
        "Help with the agreed rotation and keep space safe.",
        "Heal the soakers and coordinate cooldowns.",
        "Intercept your assigned beam and use defensives as needed.",
      ),
      c(
        "induction",
        10,
        "Induction · heal and leave the field",
        "Prepare for the group hit and move out of the field it leaves behind.",
        "The group survives the hit and avoids the field.",
        "Move the boss when needed to keep beams accessible.",
        "Top the group and support injured soakers.",
        "Use a defensive if low and avoid the field.",
      ),
      c(
        "energy",
        15,
        "Watch boss energy · keep coverage",
        "An uncovered spire feeds boss energy. At full energy Consume Charge can be devastating.",
        "The next set is covered before energy becomes dangerous.",
        "Call out or cover a missed beam when safe.",
        "Keep cooldowns available for sustained group damage.",
        "Reassign uncovered beams promptly.",
      ),
    ],
  },
  {
    id: "avatar-of-sethraliss",
    name: "Avatar of Sethraliss",
    subtitle: "Remove the Defiler, collect the orbs and heal the Avatar.",
    duration: 20,
    focus:
      "The Avatar is the friendly objective. Three orbs illustrate one Guardian death; player locations and event timing are schematic.",
    failureTime: 8,
    mistake:
      "One Corrupted Lifeforce is left unsoaked and explodes, damaging the group.",
    question: "The Essence Defiler is defeated. What should the healer do?",
    choices: [
      "Attack the Avatar",
      "Heal the Avatar while allies control the adds",
      "Ignore the Avatar until all waves stop",
    ],
    correct: 1,
    cues: [
      c(
        "defiler",
        0,
        "Essence Defiler · remove the healing block",
        "Focus the Essence Defiler to remove its healing restriction; interrupt the Twisted Hexxer’s Flame Shock.",
        "The Defiler is defeated and the Avatar can be healed.",
        "Control adds and protect the group.",
        "Keep the group alive; prepare to heal the Avatar.",
        "Focus the Defiler and interrupt Flame Shock.",
      ),
      c(
        "orbs",
        5,
        "Corrupted Lifeforce · collect the soaks",
        "When a Corrupted Guardian dies, avoid its death blast and collect the three orbs promptly. Soaking applies a dangerous debuff.",
        "All three orbs are collected before they explode.",
        "Collect an assigned orb with a defensive if needed.",
        "Heal the soakers and avoid taking an orb if allies can cover it.",
        "Share the soaks between players and use defensives if needed.",
      ),
      c(
        "heal",
        10,
        "Restore the Avatar · protect the healer",
        "After the Defiler dies, heal the Avatar. Control and defeat Tormentors while the healer avoids their fixate.",
        "The Avatar gains health while the group controls the adds.",
        "Protect the healer and control the incoming adds.",
        "Heal the Avatar and kite fixating Tormentors.",
        "Control and defeat Tormentors to protect your healer.",
      ),
      c(
        "repeat",
        15,
        "Repeat · keep healing the Avatar",
        "Handle new enemies and soaks, then return to healing when the Avatar is available. The encounter ends at full health.",
        "The Avatar reaches full health.",
        "Control new adds and handle assigned soaks.",
        "Continue restoring the Avatar when safe.",
        "Interrupt enemies and protect the healer.",
      ),
    ],
  },
];
export const getTempleLesson = (id: string) =>
  templeLessons.find((b) => b.id === id);
