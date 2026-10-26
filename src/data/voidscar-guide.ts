export type VoidscarBossId = "tazrah" | "atroxus" | "charonus";
export type VoidscarRole = "tank" | "healer" | "damage";
export type VoidscarCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<VoidscarRole, string>;
  window?: number;
  source?: string;
  timerLabel?: string;
};
export type VoidscarLesson = {
  id: VoidscarBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: VoidscarCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const voidscarSources = {
  method: "https://www.method.gg/guides/dungeons/voidscar-arena",
  petko: "https://www.icy-veins.com/wow/voidscar-arena-dungeon-guide",
  journal:
    "https://www.wowhead.com/guide/midnight/voidscar-arena-dungeon-overview-location-rewards",
  raider: "https://raider.io/news/754-quick-boss-guide-voidscar-arena",
  roar: "https://www.wowhead.com/spell=1262497/monstrous-roar",
  orbs: "https://www.wowhead.com/spell=1263982/gravitic-orbs",
  hotfix:
    "https://news.blizzard.com/en-gb/article/24307310/hotfixes-october-23-2026",
};
const roles = (tank: string, healer: string, damage: string) => ({
  tank,
  healer,
  damage,
});
const c = (
  id: string,
  start: number,
  end: number,
  title: string,
  action: string,
  done: string,
  role: Record<VoidscarRole, string>,
  window?: number,
  source?: string,
  timerLabel?: string,
): VoidscarCue => ({
  id,
  start,
  end,
  title,
  action,
  done,
  role,
  window,
  source,
  timerLabel,
});
export const voidscarLessons: VoidscarLesson[] = [
  {
    id: "tazrah",
    name: "Taz’Rah",
    subtitle: "Separate the dash lanes. Leave room to dodge the bloom.",
    duration: 23,
    focus:
      "Five parallel target lanes illustrate one arrangement. Shade positions, fissures and orb trajectories are examples.",
    failureTime: 6.5,
    mistake: "P3 crowds P2’s dash lane, exposing both players to extra hits.",
    question: "Shades aim Nether Dash at the group. How should you position?",
    choices: [
      "Stack the lines on top of one another",
      "Separate the lanes toward the wall and avoid other players’ lines",
      "Run into an existing fissure",
    ],
    correct: 1,
    cues: [
      c(
        "lanes",
        0,
        4,
        "Nether Dash · establish separate lanes",
        "Space the group along an edge and aim the illustrated dash lanes in the same direction.",
        "Each target has a lane clear of teammates.",
        roles(
          "Move the boss away from where fissures may appear.",
          "Prepare for dash damage and bleeds.",
          "If targeted, avoid pointing your line through allies.",
        ),
      ),
      c(
        "dash",
        4,
        8,
        "Nether Dash · watch the other lines",
        "Shades dash through their targets. Keep other players out of your line.",
        "The dashes finish and the group prepares for fissures.",
        roles(
          "Keep the group’s lanes and tank position clear.",
          "Support players hit by the lines.",
          "Do not cross another player’s dash.",
        ),
      ),
      c(
        "rupture",
        8,
        12,
        "Umbral Rupture · leave the impacts",
        "Move away from the marked fissure locations near the edge.",
        "The impacts resolve and the group has clean ground.",
        roles(
          "Rotate the boss away from the old fissures.",
          "Prepare group healing for the next Bloom.",
          "Leave the impact areas before they resolve.",
        ),
      ),
      c(
        "bloom",
        12,
        18,
        "Dark Bloom · dodge the outgoing orbs",
        "Heal the group hit, then move between the orbs emitted from the fissures.",
        "The outgoing projectiles have passed.",
        roles(
          "Keep the boss away from occupied floor.",
          "Use healing for the group hit and anyone clipped.",
          "Use a defensive if needed and dodge each orb.",
        ),
      ),
      c(
        "blast",
        18,
        23,
        "Void Blast · plan the tank knockback",
        "The tank uses mitigation with clear space behind them.",
        "The tank lands away from fissures.",
        roles(
          "Face a clear landing and use a defensive.",
          "Support the tank after the hit.",
          "Stay clear of old fissures.",
        ),
      ),
    ],
  },
  {
    id: "atroxus",
    name: "Atroxus",
    subtitle: "Dodge the breath. Kite the Creeper away from the tank.",
    duration: 24,
    focus:
      "P3 illustrates one Breath target. The Creeper emerges from a poison pool and follows P1, the tank.",
    failureTime: 16,
    mistake:
      "The Creeper reaches P1 and applies Sickening Bite, increasing the danger of Hulking Claw.",
    question: "A Toxic Creeper fixates the tank. What is the safe group plan?",
    choices: [
      "The tank kites while DPS switch and the healer covers pulses",
      "The tank holds it in melee until Hulking Claw",
      "Everyone ignores the Creeper",
    ],
    correct: 0,
    cues: [
      c(
        "breath",
        0,
        4,
        "Noxious Breath · sidestep the frontal",
        "The marked player and nearby allies move out of the indicated cone.",
        "The frontal has ended.",
        roles(
          "Maintain safe space while the boss turns.",
          "Keep line of sight while avoiding the breath.",
          "Stay close enough to step sideways out of it.",
        ),
      ),
      c(
        "poison",
        4,
        8,
        "Poison Splash · dodge the impacts",
        "Move around the poison pools while the channel damages the group.",
        "The impacts stop; the pools remain dangerous.",
        roles(
          "Keep a path clear for the incoming Creeper.",
          "Heal the group and dispel poison as needed.",
          "Move out of impacts and existing pools.",
        ),
      ),
      c(
        "roar",
        8,
        11,
        "Monstrous Roar · prepare for the Creeper",
        "Prepare for group damage. A Toxic Creeper emerges from a poison pool when the cast completes.",
        "The roar lands and the Creeper appears.",
        roles(
          "Prepare to kite the fixating add.",
          "Use group healing for the roar and following pulses.",
          "Be ready to switch to the Creeper.",
        ),
        3,
        voidscarSources.roar,
        "until the roar lands",
      ),
      c(
        "creeper",
        11,
        19,
        "Toxic Creeper · tank kites, group switches",
        "The tank stays out of bite range; DPS focus the add while the healer covers Toxic Aura.",
        "The Creeper is defeated.",
        roles(
          "Kite the add without letting it melee you.",
          "Plan healing while Toxic Aura persists.",
          "Switch damage to the add promptly.",
        ),
      ),
      c(
        "claw",
        19,
        24,
        "Hulking Claw · mitigate and heal",
        "Prepare for the tank hit and its poison damage.",
        "The tank survives the hit and follow-up damage.",
        roles(
          "Use active mitigation; avoid carrying Bite stacks.",
          "Support the tank and dispel poison if possible.",
          "Keep clear of poison pools.",
        ),
      ),
    ],
  },
  {
    id: "charonus",
    name: "Charonus",
    subtitle:
      "Guide the chasing orb into a star — without entering it yourself.",
    duration: 28,
    focus:
      "One highlighted orb and three example singularities teach the route; actual assignments depend on the encounter.",
    failureTime: 8.2,
    mistake:
      "P3 enters the singularity and becomes Atomized and cannot attack or use abilities.",
    question:
      "Your Gravitic Orb is chasing you. What should touch the singularity?",
    choices: [
      "Your character should run into its centre",
      "The orb should reach it while you remain outside",
      "Ignore the orb until its damage stops",
    ],
    correct: 1,
    cues: [
      c(
        "stars",
        0,
        4,
        "Unstable Singularities · plan a route",
        "Identify a nearby singularity and keep your body outside its dangerous centre.",
        "You know where to lead an orb if targeted.",
        roles(
          "Keep the boss in useful range of the stars.",
          "Prepare for pulsing group damage.",
          "Choose a route around, not through, a star.",
        ),
      ),
      c(
        "orb",
        4,
        10,
        "Gravitic Orb · lead it into the singularity",
        "If fixated, move so the orb trails into a singularity while your character stays outside.",
        "The orb reaches the singularity and the pair disappears.",
        roles(
          "Avoid entering a singularity.",
          "Heal orb targets while their stacks rise.",
          "Lead your own orb in promptly without touching the star.",
        ),
      ),
      c(
        "recover",
        10,
        14,
        "Orb cleared · reset safely",
        "Move away from remaining singularities and prepare for the next cue.",
        "The group has space for the incoming impacts.",
        roles(
          "Prepare mitigation and a safe facing.",
          "Stabilise any players with remaining damage.",
          "Watch for other active orbs and avoid the stars.",
        ),
      ),
      c(
        "crash",
        14,
        18,
        "Cosmic Crash · separate and dodge",
        "Avoid overlapping the impacts and step out of their marked areas.",
        "The impacts resolve.",
        roles(
          "Give the group space while keeping your position safe.",
          "Heal the group through unavoidable damage.",
          "Leave your impact area without clipping allies.",
        ),
      ),
      c(
        "waves",
        18,
        22,
        "Dark Waves · tank faces away",
        "The tank uses mitigation and points the frontal away from the group.",
        "The tank hit resolves.",
        roles(
          "Hold the frontal away from allies.",
          "Support the tank through the hit.",
          "Stay outside the tank’s frontal.",
        ),
      ),
      c(
        "cascade",
        22,
        28,
        "Void Cascade · move away from the projectiles",
        "The marked player creates distance and keeps moving; others leave the projectile path.",
        "The volley has passed.",
        roles(
          "Keep the boss positioned away from occupied lanes.",
          "Heal the target while staying out of the path.",
          "If targeted, create distance and keep moving.",
        ),
      ),
    ],
  },
];
export const getVoidscarLesson = (id: string) =>
  voidscarLessons.find((b) => b.id === id);
