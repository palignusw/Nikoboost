export type ValeBossId =
  "lightblossom-trinity" | "ikuzz" | "lightwarden-ruia" | "ziekket";
export type ValeRole = "tank" | "healer" | "damage";
export type ValeCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<ValeRole, string>;
  window?: number;
  source?: string;
  timerLabel?: string;
};
export type ValeLesson = {
  id: ValeBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: ValeCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const valeSources = {
  method: "https://www.method.gg/guides/dungeons/the-blinding-vale",
  petko: "https://www.icy-veins.com/wow/blinding-vale-dungeon-guide",
  journal:
    "https://www.wowhead.com/guide/midnight/the-blinding-vale-dungeon-overview-location-rewards",
  raider: "https://raider.io/news/751-quick-boss-guide-blinding-vale",
  beam: "https://www.wowhead.com/spell=1235574/lightblossom-beam",
  stomp: "https://www.wowhead.com/spell=1236747/verdant-stomp",
  strikes: "https://www.wowhead.com/spell=1240210/pulverizing-strikes",
  aim: "https://www.wowhead.com/spell=1246607/concentrated-lightbeam",
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
  role: Record<ValeRole, string>,
  window?: number,
  source?: string,
  timerLabel?: string,
): ValeCue => ({
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
export const valeLessons: ValeLesson[] = [
  {
    id: "lightblossom-trinity",
    name: "Lightblossom Trinity",
    subtitle: "Dodge first. Cover the flowers during the beam.",
    duration: 22,
    focus:
      "Three loam patches change state: dangerous ground → dash route → assigned soaks → scorched ground.",
    failureTime: 11,
    mistake:
      "P3 stands in front of the flower instead of inside it; that flower gains Light-Gorged.",
    question: "Lightblossom Beam starts. Where do assigned players stand?",
    choices: [
      "Inside their assigned flowers until the channel ends",
      "Anywhere between Kezkitt and a flower",
      "Outside every circle throughout the fight",
    ],
    correct: 0,
    cues: [
      c(
        "control",
        0,
        4,
        "Light Bolt / Thornblade · control and make space",
        "Stop Kezkitt’s cast. The Thornblade target separates for Lekshi’s follow-up.",
        "The cast is stopped and the jump has resolved.",
        roles(
          "Keep the trio close while preserving space.",
          "Support the bleed target.",
          "Interrupt; if marked, leave the group.",
        ),
      ),
      c(
        "loam",
        4,
        8,
        "Bedrock Slam / Lightsower Dash · stay out",
        "Prepare tank mitigation and avoid the fresh loam and the dash path.",
        "The dash passes; Lightblossom Beam starts.",
        roles(
          "Prepare a defensive; position near a planned patch.",
          "Cover Bedrock Surge party damage.",
          "Wait beside your assigned flower, outside the dash.",
        ),
      ),
      c(
        "soak",
        8,
        16,
        "Lightblossom Beam · enter all three flowers",
        "The assigned tank and two DPS enter the circles. Hold coverage through the channel.",
        "The beam ends and the flowers become scorched ground.",
        roles(
          "Cover the assigned flower without abandoning the bosses.",
          "Heal the three soakers.",
          "Stand inside your flower, not in front of it.",
        ),
        8,
        valeSources.beam,
        "beam channel remaining",
      ),
      c(
        "leave",
        16,
        22,
        "Light-Scorched Earth · leave and reposition",
        "Exit the scorched patches and move the trio to clean floor.",
        "The group has space for the next garden.",
        roles(
          "Move the trio before another Slam.",
          "Keep healing through Overgrowth.",
          "Leave the old patches promptly.",
        ),
      ),
    ],
  },
  {
    id: "ikuzz",
    name: "Ikuzz the Light Hunter",
    subtitle: "Plan the knockback. Free roots. Kite the gaze.",
    duration: 28,
    focus:
      "Root positions and knockback distance are illustrative. The Gaze target routes the boss through roots without touching them.",
    failureTime: 9.5,
    mistake:
      "P3 is knocked into an existing root and cannot regroup with the others.",
    question: "Bloodthirsty Gaze targets you. What clears roots safely?",
    choices: [
      "Stand inside a root yourself",
      "Guide Ikuzz across roots while keeping your own route clear",
      "Run into Ikuzz to stop the pursuit",
    ],
    correct: 1,
    cues: [
      c(
        "position",
        0,
        4,
        "Verdant Stomp · choose a clear landing",
        "Check the knockback path and stay away from old roots and edges.",
        "The stomp hits.",
        roles(
          "Keep useful clean ground near the boss.",
          "Check your landing before the hit.",
          "Stand near the boss with a clear path behind you.",
        ),
      ),
      c(
        "regroup",
        4,
        8,
        "After the stomp · prepare the new roots",
        "Regroup where roots can be cleaved together, or use an available root break.",
        "New Bloodthorn Roots emerge.",
        roles(
          "Stay close enough to help cleave the roots.",
          "Avoid becoming isolated.",
          "Return on clean ground before the roots appear.",
        ),
        4,
        valeSources.stomp,
        "until new roots emerge",
      ),
      c(
        "roots",
        8,
        12,
        "Bloodthorn Roots · free the group",
        "Destroy the roots or use a suitable freedom/root-break effect.",
        "The affected players can move again.",
        roles(
          "Bring cleave to trapped players.",
          "Support trapped allies while they are freed.",
          "Switch to nearby roots; help isolated players.",
        ),
      ),
      c(
        "gaze",
        12,
        22,
        "Bloodthirsty Gaze · keep your distance",
        "The marked player leads Ikuzz over roots while staying clear of them.",
        "The pursuit ends without the target being caught.",
        roles(
          "Give the target a clear route.",
          "Keep healing while the target kites.",
          "If marked, keep moving and let the boss crush roots.",
        ),
        10,
        valeSources.journal,
        "pursuit remaining",
      ),
      c(
        "roar",
        22,
        28,
        "Thorncaller Roar · defend and heal",
        "Prepare personals and group healing, especially once Frenzy begins at 50% health.",
        "The damaging channel ends.",
        roles(
          "Preserve safe routes during Frenzy.",
          "Plan stronger healing below 50%.",
          "Use a defensive rather than risking a root.",
        ),
      ),
    ],
  },
  {
    id: "lightwarden-ruia",
    name: "Lightwarden Ruia",
    subtitle: "Read the form. Separate the marked cones.",
    duration: 29,
    focus:
      "Moonkin → Bear at 70% → Haranir at 40%. The scene shows selected examples, not a timed health progression.",
    failureTime: 21,
    mistake: "P3 crosses toward P4, overlapping the marked cone lanes.",
    question: "Pulverizing Strikes marks you. What should you do?",
    choices: [
      "Run around to dodge your own tracked cone",
      "Stack every marked player together",
      "Separate first, then hold your lane so allies avoid it",
    ],
    correct: 2,
    cues: [
      c(
        "moonkin",
        0,
        4,
        "Moonkin · interrupt and dodge",
        "Interrupt Warden’s Wrath and leave Lightfall impacts.",
        "The casts are handled.",
        roles(
          "Request kicks for the tank-targeted casts.",
          "Watch for missed Wrath damage.",
          "Kick and leave ground impacts.",
        ),
      ),
      c(
        "lightfire",
        4,
        10,
        "Lightfire · leave room for its expiry",
        "The three marked players leave space for the beams that emerge at expiry.",
        "The debuffs expire.",
        roles(
          "Leave the marked players space.",
          "Support the debuffed players while moving.",
          "Do not place your expiry on teammates.",
        ),
        6,
        valeSources.journal,
        "until Lightfire expires",
      ),
      c(
        "beams",
        10,
        13,
        "Lightfire Beams · dodge their paths",
        "Avoid the outgoing beams; being clipped also silences you.",
        "The beam paths are clear.",
        roles(
          "Keep the tanking lane usable.",
          "Avoid a silence during heavy tank damage.",
          "Step out of the outgoing paths.",
        ),
      ),
      c(
        "thrash",
        13,
        16,
        "Bear · heal Grievous Thrash to full",
        "The bleed affects the group. Top each affected player or use an appropriate bleed removal.",
        "The affected players reach full health or remove the bleed.",
        roles(
          "Use self-healing and mitigation for Mangling Claws.",
          "Finish topping each bleeding ally.",
          "Help with self-healing or a bleed cleanse.",
        ),
      ),
      c(
        "spread",
        16,
        19,
        "Pulverizing Strikes · separate before the channel",
        "Marked players establish different lanes. Unmarked players move clear.",
        "Each marked cone has its own space.",
        roles(
          "Do not stand in a marked lane.",
          "Find a safe position with line of sight.",
          "Spread your mark before holding position.",
        ),
      ),
      c(
        "strikes",
        19,
        25,
        "Pulverizing Strikes · hold your lane",
        "The cones track marked targets. Avoid crossing another marked lane.",
        "The six-second effect ends.",
        roles(
          "Stay out of overlapping cones.",
          "Heal the targeted players from a clear lane.",
          "Hold your separated position; do not spin the cone.",
        ),
        6,
        valeSources.strikes,
        "strikes effect remaining",
      ),
      c(
        "haranir",
        25,
        29,
        "Haranir · expect rapid overlaps",
        "Below 40%, combine movement with healing and defensive plans.",
        "The next live cue determines your action.",
        roles(
          "Plan mitigation across overlapping attacks.",
          "Save coverage for Thrash plus other damage.",
          "Keep reacting; the earlier mechanics still matter.",
        ),
      ),
    ],
  },
  {
    id: "ziekket",
    name: "Ziekket",
    subtitle: "Dormant is not dead. Use the beam to clear the bodies.",
    duration: 24,
    focus:
      "Three representative lashers and three representative orbs teach positioning; these are not total spawn counts.",
    failureTime: 11,
    mistake:
      "The beam misses the Dormant lashers, so their bodies remain available to reawaken.",
    question: "Lashers become Dormant. What permanently removes them?",
    choices: [
      "More ordinary damage into their bodies",
      "Aim Concentrated Lightbeam through them",
      "Ignore them and collect every orb yourself",
    ],
    correct: 1,
    cues: [
      c(
        "adds",
        0,
        5,
        "Awaken the Lightbloom · group and control adds",
        "Group the lashers and stop their casts while bringing them to Dormant.",
        "The killable lashers become Dormant.",
        roles(
          "Gather lashers near a planned beam lane.",
          "Heal through Oozing Xylem.",
          "Interrupt Lightspore Shot and cleave the adds.",
        ),
      ),
      c(
        "aim",
        5,
        10,
        "Concentrated Lightbeam · aim through the bodies",
        "The targeted player positions the beam line through the Dormant lashers. Others stay out of it.",
        "The cast completes with the bodies in its path.",
        roles(
          "Keep the beam lane stable.",
          "Prepare to heal the beam target.",
          "If targeted, line up the Dormant bodies.",
        ),
        5,
        valeSources.aim,
        "beam cast remaining",
      ),
      c(
        "beam",
        10,
        13,
        "Concentrated Lightbeam · clear the Dormant lashers",
        "The beam liquefies bodies into Lightsap. The target still takes beam damage.",
        "The bodies are removed and the group avoids Lightsap.",
        roles(
          "Prepare to reposition onto clean floor.",
          "Support the target through beam damage.",
          "Keep allies out of your line; leave resulting Lightsap.",
        ),
      ),
      c(
        "orbs",
        13,
        19,
        "Lightbloom’s Essence · intercept and share",
        "Intercept the orbs before Ziekket. Share stacks rather than overloading one player.",
        "The orbs are collected by players.",
        roles(
          "Prevent the boss from reaching an uncollected orb.",
          "Use the healing buff, but watch the stacking damage.",
          "Collect assigned orbs; do not greed every stack.",
        ),
      ),
      c(
        "spike",
        19,
        24,
        "Thornspike · plan the knockback",
        "The tank uses mitigation with clear floor behind them.",
        "The tank recovers safely; watch the next add wave.",
        roles(
          "Avoid being knocked into Lightsap.",
          "Cover the hit and bleed.",
          "Keep clean routes available.",
        ),
      ),
    ],
  },
];
export const getValeLesson = (id: string) =>
  valeLessons.find((b) => b.id === id);
