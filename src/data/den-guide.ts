export type DenBossId = "hoardmonger" | "sentinel-of-winter" | "nalorakk";
export type DenRole = "tank" | "healer" | "damage";
export type Vec = { x: number; y: number };
export type DenCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  response: string;
  role: Record<DenRole, string>;
  window?: number;
  source?: string;
};
export type DenMechanic = {
  name: string;
  trigger: string;
  action: string;
  done: string;
  source: string;
};
export type DenLesson = {
  id: DenBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  limits: string;
  cues: DenCue[];
  mechanics: DenMechanic[];
  practice: {
    question: string;
    choices: string[];
    correct: number;
    feedback: string;
  };
};
export const denSources = {
  method: "https://www.method.gg/guides/dungeons/den-of-nalorakk",
  petko: "https://www.icy-veins.com/wow/den-of-nalorakk-dungeon-guide",
  journal:
    "https://www.wowhead.com/guide/midnight/den-of-nalorakk-dungeon-overview-location-rewards",
  mushrooms: "https://www.wowhead.com/npc=244584/rotten-mushroom",
  rime: "https://www.wowhead.com/spell=1263590/rimeshatter",
  maul: "https://www.wowhead.com/spell=1242860/echoing-maul",
  winterPlan:
    "https://www.icy-veins.com/wow/news/stop-wiping-to-sentinel-of-winter-in-den-of-nalorakk/",
  hotfix:
    "https://news.blizzard.com/en-gb/article/24307310/hotfixes-october-23-2026",
} as const;
const roles = (tank: string, healer: string, damage: string) => ({
  tank,
  healer,
  damage,
});
export const denLessons: DenLesson[] = [
  {
    id: "hoardmonger",
    name: "The Hoardmonger",
    subtitle: "Choose the upgrade. Catch the mushrooms.",
    duration: 30,
    focus:
      "One mushroom is highlighted to teach contact and its deadline; this is not the total spawn count.",
    limits:
      "Resource positions, movement, damage and the order of this demonstration are schematic. Mushroom count increases with Overflowing Supplies. The suggested meat → bones → mushrooms order is a group plan, not a mandatory rule.",
    cues: [
      {
        id: "resources",
        start: 0,
        end: 6,
        title: "Resourceful Measures · choose the nearest unused pile",
        response: "POSITION",
        action:
          "Before the health trigger, the tank makes the chosen unused pile nearest. This example chooses meat first.",
        done: "The chosen resource is collected; its upgrade remains for Mythic+.",
        role: roles(
          "Lead toward the chosen unused pile before the trigger.",
          "Prepare for the upgraded group damage.",
          "Keep attacking while leaving room for repositioning.",
        ),
      },
      {
        id: "mushroom",
        start: 6,
        end: 18,
        title: "Spoiled Supplies · catch the highlighted mushroom",
        response: "SOAK",
        action:
          "Touch an uncovered mushroom before it finishes growing. P3 covers this example; share other mushrooms according to poison stacks.",
        done: "Contact destroys your mushroom. Cover the others too; watch Toxic Spores on whoever collected them.",
        window: 12,
        source: denSources.mushrooms,
        role: roles(
          "Help cover mushrooms without taking every poison stack.",
          "Heal collectors; poison-dispel when your class can.",
          "Touch an uncovered mushroom and keep track of your poison.",
        ),
      },
      {
        id: "slam",
        start: 18,
        end: 23,
        title: "Earthshatter Slam · leave the frontal",
        response: "DODGE",
        action:
          "Move sideways out of the boss’s indicated cone. The floor remains dangerous after Bonespike Slam is unlocked.",
        done: "The slam has resolved and you are outside any bone spikes.",
        role: roles(
          "Leave the cone and keep useful resource positioning.",
          "Move before continuing a heal.",
          "Do not finish a cast inside the cone.",
        ),
      },
      {
        id: "bellow",
        start: 23,
        end: 28,
        title: "Hearty Bellow · survive the knockback",
        response: "DEFEND",
        action:
          "Prepare for group damage and the meat-upgraded knockback. Keep clear ground behind you.",
        done: "The initial hit resolves; the healer still covers the following damage-over-time effect.",
        role: roles(
          "Have clear space behind you.",
          "Heal the hit and continuing damage.",
          "Use a personal defensive if needed; watch your landing.",
        ),
      },
      {
        id: "reset",
        start: 28,
        end: 30,
        title: "Reassess before the next upgrade",
        response: "PREPARE",
        action:
          "Check unused resources, poison stacks and clear ground before the next cycle.",
        done: "The group is ready for the next actual game cue.",
        role: roles(
          "Choose the next unused pile.",
          "Stabilise poison and Bellow damage.",
          "Help cover remaining mushrooms without overloading one player.",
        ),
      },
    ],
    mechanics: [
      {
        name: "Resourceful Measures",
        trigger: "90%, 70% and 40% boss health.",
        action:
          "Make the chosen unused pile nearest. Mythic+ upgrades accumulate; taking a new one does not remove previous upgrades.",
        done: "The resource is consumed.",
        source: denSources.journal,
      },
      {
        name: "Spoiled Supplies / Toxic Spores",
        trigger: "Mushrooms grow around the room.",
        action:
          "Touch each before its 12-second growth ends. Contact destroys it and applies stacking poison; share coverage and use available poison dispels.",
        done: "All actual mushrooms have been collected.",
        source: denSources.mushrooms,
      },
      {
        name: "Earthshatter / Bonespike Slam",
        trigger: "The boss aims a frontal cone.",
        action:
          "Step out. After the bone upgrade, avoid the spikes left on the floor too.",
        done: "The hit resolves and your ground is clear.",
        source: denSources.journal,
      },
      {
        name: "Ravenous / Hearty Bellow",
        trigger: "The boss roars.",
        action:
          "Heal the group hit and subsequent damage. The meat upgrade adds a knockback: keep clear space behind you.",
        done: "The damage-over-time effect has ended.",
        source: denSources.journal,
      },
    ],
    practice: {
      question:
        "A mushroom is still growing, but one player already has several poison stacks. What is the next call?",
      choices: [
        "Leave it; the healer can cover the explosion.",
        "Another healthy player covers it; support and dispel the poison.",
        "Everyone runs onto that one mushroom together.",
      ],
      correct: 1,
      feedback:
        "Prevent the burst without putting every poison stack on one collector. Every actual mushroom still needs coverage.",
    },
  },
  {
    id: "sentinel-of-winter",
    name: "Sentinel of Winter",
    subtitle: "Bait together. Kill one add. Use its snowdrift.",
    duration: 44,
    focus:
      "Selected coordinated plan: kill add A, control B through the storm, then kill B. Keep interrupts covered if control fails.",
    limits:
      "This is an authored sequence, not a pull timer. Add deaths and the storm window are shortened examples. The shaded squall patch represents a bait area, not a verified tornado count. Snowdrifts from these boss adds are distinct from dangerous snowy arena edges.",
    cues: [
      {
        id: "bait",
        start: 0,
        end: 4,
        title: "Raging Squall · bait in one clear area",
        response: "BAIT",
        action:
          "Gather at the agreed bait position while the squalls are about to appear. Stay on usable ground, away from the dangerous arena edge.",
        done: "The squall drop locations are committed; move away together.",
        role: roles(
          "Keep the group’s bait area usable.",
          "Stay with the agreed bait position.",
          "Do not leave early and scatter the new squalls.",
        ),
      },
      {
        id: "rotate",
        start: 4,
        end: 8,
        title: "Squalls appear · leave the bait area",
        response: "MOVE",
        action:
          "Move into clear space. Account for the slippery floor and keep watching the roaming squalls.",
        done: "You are clear of the dropped squalls.",
        role: roles(
          "Lead toward clear ground for the next adds.",
          "Move early; the ice makes corrections harder.",
          "Rotate with the group rather than crossing the bait area.",
        ),
      },
      {
        id: "spikes",
        start: 8,
        end: 12,
        title: "Shattering Frostspike · dodge the two impacts",
        response: "DODGE",
        action:
          "Leave the two impact circles. Adds will appear there; these impact circles are not soaks.",
        done: "The icicles have landed and the adds are visible.",
        role: roles(
          "Prepare to bring the boss near add A.",
          "Avoid the impacts before healing.",
          "Switch to add A after the impacts.",
        ),
      },
      {
        id: "adds",
        start: 12,
        end: 16,
        title: "Focus A · control B · cover Winter’s Shroud",
        response: "KILL / CONTROL",
        action:
          "Kill the first add near the boss. Use suitable hard control on the second, with interrupts ready if it starts casting.",
        done: "Add A dies and leaves a snowdrift. Its Rimeshatter now needs a collector.",
        role: roles(
          "Bring the boss near the first add.",
          "Help cover casts or control if your class can.",
          "Focus A and maintain the agreed control on B.",
        ),
      },
      {
        id: "rime-a",
        start: 16,
        end: 22,
        title: "Rimeshatter A · stand in the landing circle",
        response: "SOAK",
        action:
          "One assigned player stays in the shard circle until the hit. P3 covers it here; leaving before impact does not count.",
        done: "The shard lands with a player inside.",
        window: 6,
        source: denSources.rime,
        role: roles(
          "Keep the boss near the useful snowdrift.",
          "Support the collector and dispel Glacial Torment.",
          "If assigned, hold the circle until the shard hits.",
        ),
      },
      {
        id: "prepare",
        start: 22,
        end: 24,
        title: "Snowdrift ready · prepare for Frozen Tempest",
        response: "POSITION",
        action:
          "Reach the snowdrift left by add A. Keep add B controlled and the next path clear.",
        done: "The group can stand in the snowdrift inside the storm’s eye.",
        role: roles(
          "Keep the boss close enough to use the drift.",
          "Prepare healing for the storm.",
          "Reach the drift before the pushback begins.",
        ),
      },
      {
        id: "tempest",
        start: 24,
        end: 32,
        title: "Frozen Tempest · use the drift inside the eye",
        response: "HOLD",
        action:
          "Stand in the boss-add snowdrift within the eye of the storm. It prevents forced movement, but the party still needs healing.",
        done: "The storm ends. Resume the plan for the remaining add.",
        role: roles(
          "Keep the boss and usable drift aligned.",
          "Heal through the storm; the drift does not remove its damage.",
          "Stay in the drift and avoid roaming squalls.",
        ),
      },
      {
        id: "second",
        start: 32,
        end: 36,
        title: "Storm finished · kill B and cover its cast",
        response: "INTERRUPT / KILL",
        action:
          "Move to the second add, resume damage and stop Winter’s Shroud.",
        done: "Add B dies; prepare its Rimeshatter soak as well.",
        role: roles(
          "Move safely to the remaining add.",
          "Remove Glacial Torment when possible.",
          "Stop the cast and kill B.",
        ),
      },
      {
        id: "rime-b",
        start: 36,
        end: 42,
        title: "Rimeshatter B · the second death needs a soak too",
        response: "SOAK",
        action:
          "Cover the new shard circle until impact. P4 is the collector in this example.",
        done: "The second shard hits a collector.",
        window: 6,
        source: denSources.rime,
        role: roles(
          "Keep the area usable for the next cycle.",
          "Support the second collector.",
          "If assigned, stay until this shard lands too.",
        ),
      },
      {
        id: "reset",
        start: 42,
        end: 44,
        title: "Both shards handled · watch the next bait",
        response: "PREPARE",
        action: "Regroup in clear ground for the next actual squall cue.",
        done: "The group is ready to repeat the mechanics.",
        role: roles(
          "Plan the next clear position.",
          "Stabilise the group.",
          "Keep watching squalls and add spawns.",
        ),
      },
    ],
    mechanics: [
      {
        name: "Raging Squall",
        trigger: "New tornadoes are about to spawn.",
        action:
          "Bait together on usable ground, then move after locations commit. Keep avoiding the moving squalls.",
        done: "The group is clear of the bait area.",
        source: denSources.winterPlan,
      },
      {
        name: "Shattering Frostspike / Winter’s Shroud",
        trigger: "Two impact circles become two adds.",
        action:
          "Dodge the impacts. Focus the agreed add and interrupt Shroud. Controlling one add through the storm is an optional coordinated plan.",
        done: "The relevant add is dead and its post-death soak is covered.",
        source: denSources.journal,
      },
      {
        name: "Rimeshatter",
        trigger: "A Fractured Shivercore dies.",
        action:
          "An assigned player must be inside its shard-impact circle when it lands 6 seconds later.",
        done: "The shard impacts a player; otherwise the group takes Rime Detonation.",
        source: denSources.rime,
      },
      {
        name: "Frozen Tempest / Snowdrift",
        trigger: "The storm pushes players away.",
        action:
          "Use the dead add’s snowdrift within the storm eye. It prevents forced movement, while the healer handles storm damage.",
        done: "The storm has ended.",
        source: denSources.journal,
      },
      {
        name: "Glacial Torment",
        trigger: "A player receives the magic damage-over-time debuff.",
        action:
          "Use an available magic dispel and heal targets that cannot be dispelled immediately.",
        done: "The debuff is removed or expires.",
        source: denSources.petko,
      },
    ],
    practice: {
      question:
        "Add A died and a shard circle appeared. Is it another Frostspike to dodge?",
      choices: [
        "Yes: everyone leaves it empty.",
        "Kill B immediately and ignore the shard.",
        "No: an assigned player holds Rimeshatter until impact.",
      ],
      correct: 2,
      feedback:
        "Frostspike impacts are dodged before the adds spawn. Rimeshatter after an add dies is deliberately soaked; missing it damages and roots the group.",
    },
  },
  {
    id: "nalorakk",
    name: "Nalorakk",
    subtitle: "Place the echoes. Shelter. Protect Zul’jarra.",
    duration: 26,
    focus:
      "One early Echoing Maul wave is shown. Later cycles can contain additional echoes; cover every actual charge lane.",
    limits:
      "Echo positions, charge travel and non-sourced phase gaps are schematic. The three placed echoes illustrate one marked wave, not a cap on the fight’s echo count. The tank’s shield position must account for existing echoes. October 23 hotfix: Echoing Maul’s incorrect-location bug was addressed.",
    cues: [
      {
        id: "maul",
        start: 0,
        end: 4,
        title: "Echoing Maul · place the marks on the agreed side",
        response: "PLACE",
        action:
          "Marked players move to separated drop positions near the agreed edge. Do not overlap allies or existing echoes.",
        done: "The 4-second mark resolves and echoes appear. Move away from them.",
        window: 4,
        source: denSources.maul,
        role: roles(
          "Keep a clear position behind you for Zul’jarra’s shield.",
          "Support marked players while staying clear of the drops.",
          "If marked, reach your drop position before it resolves.",
        ),
      },
      {
        id: "leave",
        start: 4,
        end: 6,
        title: "Echoes placed · leave their melee area",
        response: "MOVE",
        action:
          "Leave the new echoes. Keep the tank’s back free of echoes for the upcoming shield.",
        done: "The group can safely reach Zul’jarra’s protective side.",
        role: roles(
          "Do not have an echo behind your tanking position.",
          "Move away from echo melee range.",
          "Rejoin from a path clear of echoes.",
        ),
      },
      {
        id: "shield",
        start: 6,
        end: 10,
        title: "Overwhelming Onslaught · shelter behind Zul’jarra",
        response: "SHELTER",
        action:
          "Zul’jarra moves behind the tank and raises her shield. Stand behind her, on the side away from the boss.",
        done: "All Onslaught hits resolve, including the final knockback. The tank then handles Forceful Slam.",
        role: roles(
          "Use a tanking angle with clear space behind you.",
          "Heal the group even while it is sheltered.",
          "Stay behind the shield through the attack.",
        ),
      },
      {
        id: "slam",
        start: 10,
        end: 14,
        title: "Forceful Slam · the tank covers the impact",
        response: "TANK SOAK",
        action:
          "After the knockback, the tank returns into the impact circle at Zul’jarra. Other players stay out of this heavy hit.",
        done: "The slam hits the prepared tank instead of leaving Zul’jarra undefended.",
        role: roles(
          "Return promptly and use mitigation for the impact.",
          "Support the tank from outside the circle.",
          "Stay outside the tank’s impact circle.",
        ),
      },
      {
        id: "slam-hit",
        start: 14,
        end: 16,
        title: "Slam intercepted · prepare to protect Zul’jarra",
        response: "PREPARE",
        action:
          "Reposition for the echo-charge lanes when Fury of the War God begins.",
        done: "The group can form an interception wall around Zul’jarra.",
        role: roles(
          "Help cover a charge lane.",
          "Prepare healing for interception hits.",
          "Identify your side of the interception wall.",
        ),
      },
      {
        id: "wall",
        start: 16,
        end: 18,
        title: "Fury of the War God · form a wall",
        response: "INTERCEPT",
        action:
          "Stand between the echoes and the now-vulnerable Zul’jarra. Cover every actual lane, not just the one nearest you.",
        done: "The group is in position before the echoes reach her.",
        role: roles(
          "Cover a lane with the group.",
          "Keep the interceptors healthy.",
          "Stand in a lane rather than behind Zul’jarra.",
        ),
      },
      {
        id: "charge",
        start: 18,
        end: 22,
        title: "Echoes charge · remain in their paths",
        response: "BODY-BLOCK",
        action:
          "Intercept each charging echo before it reaches Zul’jarra. The first player in its path takes Echoing Fury.",
        done: "Every charging echo has hit an interceptor.",
        role: roles(
          "Use a defensive when covering hits.",
          "Heal interceptors and cover your assigned lane.",
          "Hold your lane until its echo is intercepted.",
        ),
      },
      {
        id: "reset",
        start: 22,
        end: 26,
        title: "Check all lanes · prepare for later waves",
        response: "REASSESS",
        action:
          "Confirm no charge reached Zul’jarra. Existing echoes matter again in later cycles; do not assume they all vanish after one charge.",
        done: "The group is ready for the next actual Maul or shield cue.",
        role: roles(
          "Keep the next shield side clear.",
          "Recover after the intercepted hits.",
          "Watch every existing echo on the next cycle.",
        ),
      },
    ],
    mechanics: [
      {
        name: "Echoing Maul / Spectral Slash",
        trigger: "Three players receive Maul marks.",
        action:
          "Place separated echoes on an agreed side within 4 seconds. Avoid existing echoes and leave their melee area after dropping.",
        done: "The marks resolve and the group is clear of the echoes.",
        source: denSources.maul,
      },
      {
        name: "Overwhelming Onslaught",
        trigger: "Zul’jarra raises her protective shield behind the tank.",
        action:
          "Stand behind her relative to the boss for all hits. Shield protection reduces damage; healing is still needed.",
        done: "The sequence and knockback resolve.",
        source: denSources.journal,
      },
      {
        name: "Forceful Slam",
        trigger: "Onslaught ends and the boss targets Zul’jarra.",
        action:
          "The prepared tank covers the impact after the knockback. Other players remain outside its radius.",
        done: "The tank has intercepted the slam.",
        source: denSources.method,
      },
      {
        name: "Fury of the War God",
        trigger: "Zul’jarra becomes vulnerable and echoes charge her.",
        action:
          "Make an interception wall and body-block every charge. A charge reaching her triggers Demoralizing Scream.",
        done: "Every actual charge has been intercepted.",
        source: denSources.journal,
      },
      {
        name: "Forceful Roar / later cycles",
        trigger: "Knockbacks or another marked wave occur.",
        action:
          "Keep clear ground behind you. Place new echoes away from allies and account for old echoes that persist into another Fury.",
        done: "The movement is resolved and the next protective position is usable.",
        source: denSources.journal,
      },
    ],
    practice: {
      question:
        "Onslaught just knocked the group back. Who goes into Forceful Slam at Zul’jarra?",
      choices: [
        "The tank, with mitigation and healing support.",
        "Nobody: every ground circle should be dodged.",
        "All five players stack inside it.",
      ],
      correct: 0,
      feedback:
        "This is a tank interception after the shield sequence. Leaving it empty exposes Zul’jarra; the rest of the group avoids the heavy impact.",
    },
  },
];
export const getDenLesson = (id: string) => denLessons.find((d) => d.id === id);
export const lerpDen = (
  a: Vec,
  b: Vec,
  t: number,
  from: number,
  to: number,
): Vec => {
  const p = Math.max(0, Math.min(1, (t - from) / (to - from))),
    q = p * p * (3 - 2 * p);
  return { x: a.x + (b.x - a.x) * q, y: a.y + (b.y - a.y) * q };
};
