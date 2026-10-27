export type RubyBossId =
  "melidrussa-chillworn" | "kokia-blazehoof" | "kyrakka-and-erkhart";
export type RubyRole = "tank" | "healer" | "damage";
export type RubyCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<RubyRole, string>;
  window?: number;
  source?: string;
  timerLabel?: string;
};
export type RubyLesson = {
  id: RubyBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: RubyCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const rubySources = {
  method: "https://www.method.gg/guides/dungeons/ruby-life-pools",
  petko: "https://www.icy-veins.com/wow/ruby-life-pools-dungeon-guide",
  journal:
    "https://www.wowhead.com/guide/midnight/ruby-life-pools-dungeon-overview-mythic-plus",
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
): RubyCue => ({
  id,
  start,
  end: start + 5,
  title,
  action,
  done,
  role: { tank, healer, damage },
});
export const rubyLessons: RubyLesson[] = [
  {
    id: "melidrussa-chillworn",
    name: "Melidrussa Chillworn",
    subtitle: "Group the hail. Place Chillstorm away. Break the shield.",
    duration: 20,
    focus:
      "P3 is an example Chillstorm target. The arena and timing are illustrative; the interactive placement exercise is linked below.",
    failureTime: 8,
    mistake:
      "P3 leaves Chillstorm beside the group, making the pull and explosion harder to avoid.",
    question: "You have Chillstorm. What should you do?",
    choices: [
      "Place the storm away from the group, then move out",
      "Stay stacked inside the storm",
      "Run into existing Hailbombs",
    ],
    correct: 0,
    cues: [
      c(
        "hail",
        0,
        "Hailburst · group then move",
        "Stay together to bait the Hailbombs in a manageable area, then move away from them together.",
        "The group leaves the bombs behind and has room for the next mechanic.",
        "Move the boss with the group as floor space fills.",
        "Prepare healing for the group hit.",
        "Bait the bombs together, then avoid touching them.",
      ),
      c(
        "storm",
        5,
        "Chillstorm · separate and escape",
        "If targeted, place the storm away from teammates, then move out and resist its pull. Avoid being knocked into bombs when it ends.",
        "The storm explodes away from the group and everyone has safe space.",
        "Keep the group away from the storm and existing bombs.",
        "Prepare healing for the channel and explosion.",
        "Place the storm away, then move out against the pull.",
      ),
      c(
        "shield",
        10,
        "Ice Bulwark · break the shield",
        "At 66% and 33% health, whelps awaken and Melidrussa shields herself. Break Ice Bulwark to end Frost Overload.",
        "The shield breaks and the dangerous channel ends.",
        "Pick up the whelps and use mitigation.",
        "Use group healing for Frost Overload and support the tank.",
        "Save damage for the shield and cleave controlled whelps.",
      ),
      c(
        "shard",
        15,
        "Frigid Shard · interrupt",
        "Keep interrupts on Frigid Shard to reduce tank damage; use spare control for whelps.",
        "The cast is stopped and the tank remains safe.",
        "Use mitigation if a tank cast gets through.",
        "Support the tank and dispel Cold Claws when needed.",
        "Assign and use an interrupt on Frigid Shard.",
      ),
    ],
  },
  {
    id: "kokia-blazehoof",
    name: "Kokia Blazehoof",
    subtitle: "Place the add safely, interrupt it and dodge rolling boulders.",
    duration: 20,
    focus:
      "P3 is an example Ritual target. The add, impact area and projectile path are schematic, not to scale.",
    failureTime: 3.5,
    mistake:
      "P3 places the Ritual impact inside the group and risks hitting teammates.",
    question:
      "Ritual of Blazebinding targets you. Where should the add appear?",
    choices: [
      "In an accessible spot away from allies",
      "Inside the group",
      "Far away where the group cannot reach it",
    ],
    correct: 0,
    cues: [
      c(
        "ritual",
        0,
        "Ritual of Blazebinding · place the add",
        "If targeted, move to an accessible spot away from allies. The impact summons a Blazebound Firestorm.",
        "The add appears where the group can attack without being cleaved.",
        "Keep space open and prepare to collect the add.",
        "Avoid the impact and prepare for group damage.",
        "Place the impact near the group but not on teammates.",
      ),
      c(
        "add",
        5,
        "Blazebound Firestorm · focus and interrupt",
        "Switch to the add, interrupt Blaze Volley, and prepare for its Inferno group damage.",
        "The add is defeated and dangerous casts are managed.",
        "Collect the add and interrupt Blaze Volley when needed.",
        "Heal through Inferno and support the group.",
        "Focus the add and interrupt Blaze Volley.",
      ),
      c(
        "boulder",
        10,
        "Molten Boulder · leave its path",
        "Watch the boulder cast, bait it away from the route and step out of its rolling path. It explodes when it hits terrain.",
        "The group avoids the rolling boulder and its impact.",
        "Keep a safe path while positioning the boss.",
        "Avoid the path and heal anyone clipped.",
        "Step out of the rolling lane and stay clear of its wall impact.",
      ),
      c(
        "tank",
        15,
        "Searing Blows · defend the tank",
        "Use mitigation for Searing Blows and keep enough space for the next Ritual and boulder.",
        "The tank survives and the group can reposition.",
        "Use a defensive for each Searing Blows cast.",
        "Support the tank through the hit.",
        "Keep the next add placement and boulder lanes clear.",
      ),
    ],
  },
  {
    id: "kyrakka-and-erkhart",
    name: "Kyrakka and Erkhart Stormvein",
    subtitle:
      "Place fire carefully, dodge the breath and stop casting for Cloudburst.",
    duration: 20,
    focus:
      "P3 illustrates one target. Wind direction and fire placement are examples; the actual encounter has multiple marked players.",
    failureTime: 13,
    mistake:
      "P3 remains in Kyrakka’s Roaring Flamebreath and takes avoidable damage.",
    question: "Erkhart begins Interrupting Cloudburst. What should casters do?",
    choices: [
      "Stop casting before it finishes",
      "Finish a long cast through the hit",
      "Move into Kyrakka’s breath",
    ],
    correct: 0,
    cues: [
      c(
        "fire",
        0,
        "Inferno Spit · place fire out of the way",
        "Marked players move out of the group and leave fire in a place that will not block the next safe area.",
        "Fire is placed away from the group.",
        "Keep the boss and group away from occupied floor.",
        "Heal marked players and plan for group damage.",
        "If marked, move away to drop your fire safely.",
      ),
      c(
        "wind",
        5,
        "Winds of Change · anticipate movement",
        "Watch the wind direction: it pushes players and fire puddles. Position so the moving fire will not cross the group.",
        "The group avoids the moving fire and keeps a clear route.",
        "Keep the boss positioned around the moving hazards.",
        "Heal the group while staying out of the moving fire.",
        "Move with awareness of where wind will push the fire.",
      ),
      c(
        "breath",
        10,
        "Roaring Flamebreath · leave the frontal",
        "Kyrakka lands near a player and aims a frontal. Step out of the indicated area.",
        "The frontal ends without hitting the group.",
        "Keep the boss under control while avoiding the breath.",
        "Avoid the frontal while maintaining healing range.",
        "Move sideways out of Kyrakka’s frontal.",
      ),
      c(
        "cloudburst",
        15,
        "Interrupting Cloudburst · stop casting",
        "Stop spellcasts before Cloudburst finishes. The healer should also dispel the tank’s Stormslam debuff before the next hit.",
        "The group avoids being interrupted and the tank is ready for the next hit.",
        "Use mitigation for Stormslam and prepare for the next cast.",
        "Stop casting for Cloudburst; dispel the tank’s Stormslam debuff.",
        "Stop casting before Cloudburst completes.",
      ),
    ],
  },
];
export const getRubyLesson = (id: string) =>
  rubyLessons.find((b) => b.id === id);
