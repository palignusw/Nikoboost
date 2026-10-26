import { tacticsPreview, type TacticRole } from "./tactics";

export type SceneKind =
  | "spread"
  | "stack"
  | "frontal"
  | "soak"
  | "interrupt"
  | "hide"
  | "adds"
  | "heal"
  | "move"
  | "tether"
  | "orbs"
  | "gateway"
  | "swap"
  | "rescue";
export type BossTactic = {
  id: string;
  name: string;
  mechanic: string;
  kind: SceneKind;
  actor: TacticRole;
  summary: string;
  checks: readonly string[];
  roles: readonly [string, string, string];
};
export type TacticDungeon = {
  id: string;
  name: string;
  image: string;
  sourceUpdated: string;
  bosses: readonly BossTactic[];
};
const boss = (
  id: string,
  name: string,
  mechanic: string,
  kind: SceneKind,
  actor: TacticRole,
  summary: string,
  checks: string[],
  roles: [string, string, string],
): BossTactic => ({ id, name, mechanic, kind, actor, summary, checks, roles });
/** Concise original field notes. Sources are linked per dungeon; see docs/tactics-catalog.md. */
export const tacticsDungeons: TacticDungeon[] = [
  {
    id: "altar-of-fangs",
    name: "Altar of Fangs",
    image: "altar-of-fangs",
    sourceUpdated: "2026-08-22",
    bosses: [
      boss(
        "ravi",
        "Rav’i",
        "Ssscavenging",
        "move",
        "tank",
        "Bring the boss to the bone pile without a Twinfang corpse.",
        ["Cover Messy Eater soaks.", "Spread for Triple Shot."],
        [
          "Break the shield.",
          "Prepare for Ravenous Stomp.",
          "Find the empty pile.",
        ],
      ),
      boss(
        "writhing-coil",
        "The Writhing Coil",
        "Death Rattle",
        "tether",
        "dps",
        "Move outward to break the tethers, then gather the spawned adds.",
        ["Interrupt Toxic Atrophy repeatedly.", "Avoid charge and frontal."],
        [
          "Control the spawned adds.",
          "Prepare for ticking damage.",
          "Keep the frontal clear.",
        ],
      ),
      boss(
        "zuljan",
        "Zul’jan",
        "Ritual Of The Fang",
        "soak",
        "dps",
        "Cover the incoming ritual beams rather than leaving them unblocked.",
        [
          "Clear Ritual Venom with physical damage.",
          "Avoid Axegrinder projectiles.",
        ],
        [
          "Use Boneslicer to clear venom.",
          "Support ritual beam soakers.",
          "Defend against Chop Down.",
        ],
      ),
    ],
  },
  {
    id: "murder-row",
    name: "Murder Row",
    image: "murder-row",
    sourceUpdated: "2026-08-18",
    bosses: [
      boss(
        "kystia-manaheart",
        "Kystia Manaheart",
        "Felshield / Nibbles",
        "adds",
        "dps",
        "Focus Nibbles while Kystia is protected; prepare for the vulnerability window.",
        ["Stop Mirror Images.", "Avoid Fel Nova."],
        [
          "Swap onto Nibbles.",
          "Prepare for Destabilized.",
          "Face Nibbles away.",
        ],
      ),
      boss(
        "zaen-bladesorrow",
        "Zaen Bladesorrow",
        "Murder In A Row",
        "hide",
        "dps",
        "Each player needs a separate barrel for cover.",
        ["Use Fire Bomb on freight.", "Avoid moving barrels."],
        [
          "Find your own cover.",
          "Prepare for Killing Spree.",
          "Defend against Envenom.",
        ],
      ),
      boss(
        "xathuux",
        "Xathuux the Annihilator",
        "Legion Strike",
        "frontal",
        "dps",
        "Keep the frontal outside the group; move to its side.",
        ["Destroy Legion Axes promptly.", "Kite around the arena edge."],
        [
          "Swap onto axes.",
          "Prepare for Demonic Rage.",
          "Face the boss outward.",
        ],
      ),
      boss(
        "lithiel-cinderfury",
        "Lithiel Cinderfury",
        "Demonic Gateway / Malefic Wave",
        "gateway",
        "dps",
        "Wait for the wave cast, then use the gate when its exit is safe.",
        ["Interrupt Chaos Bolt.", "Kill adds before the wave."],
        [
          "Clear the adds.",
          "Watch Searing Fel Flame.",
          "Keep the Infernal off gates.",
        ],
      ),
    ],
  },
  {
    id: "den-of-nalorakk",
    name: "Den of Nalorakk",
    image: "den-of-nalorakk",
    sourceUpdated: "2026-10-14",
    bosses: [
      boss(
        "hoardmonger",
        "The Hoardmonger",
        "Spoiled Supplies",
        "soak",
        "dps",
        "Cover mushroom soaks before they detonate; share the damage burden.",
        [
          "Dodge Earthshatter Slam.",
          "Choose resource empowerment deliberately.",
        ],
        [
          "Share mushroom coverage.",
          "Dispel Toxic Spores.",
          "Control the resource choice.",
        ],
      ),
      boss(
        "sentinel-of-winter",
        "Sentinel of Winter",
        "Raging Squall",
        "move",
        "dps",
        "Bait tornadoes together, then rotate away across the slippery floor.",
        [
          "Destroy and interrupt frostspike adds.",
          "Collect their Rimeshatter soaks.",
        ],
        [
          "Focus spawned adds.",
          "Dispel Glacial Torment.",
          "Use snow piles against pushback.",
        ],
      ),
      boss(
        "nalorakk",
        "Nalorakk",
        "Overwhelming Onslaught",
        "stack",
        "dps",
        "Shelter behind Zul’jarra’s shield for the incoming hits.",
        [
          "Place echoes without cleaving allies.",
          "Intercept echoes charging Zul’jarra.",
        ],
        [
          "Cover approaching echoes.",
          "Prepare for repeated hits.",
          "Avoid echoes behind you.",
        ],
      ),
    ],
  },
  {
    id: "the-blinding-vale",
    name: "The Blinding Vale",
    image: "the-blinding-vale",
    sourceUpdated: "2026-10-14",
    bosses: [
      boss(
        "lightblossom-trinity",
        "Lightblossom Trinity",
        "Lightblossom Beam",
        "soak",
        "dps",
        "Assign players to the loam circles when they become soaks.",
        ["Interrupt Light Bolt.", "Leave scorched ground afterward."],
        [
          "Cover a loam circle.",
          "Support the soakers.",
          "Reposition after each set.",
        ],
      ),
      boss(
        "ikuzz",
        "Ikuzz the Light Hunter",
        "Verdant Stomp",
        "move",
        "dps",
        "Choose a knockback path that avoids existing roots.",
        [
          "Free or cleave trapped players.",
          "Expect heavier damage during frenzy.",
        ],
        [
          "Help break roots.",
          "Prepare for Thorncaller Roar.",
          "Keep safe ground accessible.",
        ],
      ),
      boss(
        "lightwarden-ruia",
        "Lightwarden Ruia",
        "Pulverizing Strikes",
        "spread",
        "dps",
        "Separate the targeted frontals so they do not cut through teammates.",
        ["Interrupt Warden’s Wrath.", "Track form-specific mechanics."],
        [
          "Separate targeted attacks.",
          "Handle Grievous Thrash bleeds.",
          "Watch Mangling Claws.",
        ],
      ),
      boss(
        "ziekket",
        "Ziekket",
        "Concentrated Lightbeam",
        "frontal",
        "tank",
        "Aim the beam through defeated adds to remove their bodies.",
        ["Catch orbs before the boss.", "Control live adds."],
        [
          "Kill and control adds.",
          "Watch Oozing Xylem.",
          "Prepare for Thornspike knockback.",
        ],
      ),
    ],
  },
  {
    id: "voidscar-arena",
    name: "Voidscar Arena",
    image: "voidscar-arena",
    sourceUpdated: "2026-08-18",
    bosses: [
      boss(
        "tazrah",
        "Taz’Rah",
        "Nether Dash",
        "spread",
        "dps",
        "Separate the player-targeted lines near the edge without cleaving teammates.",
        ["Rotate away from old puddles.", "Dodge Dark Bloom orbs."],
        [
          "Separate dash lines.",
          "Support group damage.",
          "Defend against Void Blast.",
        ],
      ),
      boss(
        "atroxus",
        "Atroxus",
        "Noxious Breath",
        "frontal",
        "dps",
        "Stay close enough to sidestep the player-targeted breath.",
        ["Destroy Toxic Creeper promptly.", "Avoid Poison Splash puddles."],
        [
          "Swap onto the creeper.",
          "Prepare for Poison Splash.",
          "Kite the fixating creeper.",
        ],
      ),
      boss(
        "charonus",
        "Charonus",
        "Gravitic Orbs",
        "orbs",
        "dps",
        "Lead a fixating orb through a singularity without touching the singularity yourself.",
        ["Spread for Cosmic Crash.", "Point Dark Waves away."],
        [
          "Guide your orb carefully.",
          "Prepare for pulsing damage.",
          "Face Dark Waves outward.",
        ],
      ),
    ],
  },
  {
    id: "kings-rest",
    name: "Kings’ Rest",
    image: "kings-rest",
    sourceUpdated: "2026-08-18",
    bosses: [
      boss(
        "golden-serpent",
        "The Golden Serpent",
        "Spit Gold",
        "spread",
        "dps",
        "Place gold near existing puddles, keeping useful space open.",
        ["Stop Animated Gold reaching boss.", "Prepare for Serpentine Gust."],
        [
          "Slow and kill gold adds.",
          "Cover Serpentine Gust.",
          "Keep adds controlled.",
        ],
      ),
      boss(
        "mchimba",
        "Mchimba the Embalmer",
        "Entomb",
        "rescue",
        "dps",
        "Find the shaking sarcophagus and free the trapped player quickly.",
        ["Keep fire away from coffins.", "Interrupt Wretched Discharge."],
        [
          "Find the trapped teammate.",
          "Heal Drain Fluids target above 90%.",
          "Collect spawned mummies.",
        ],
      ),
      boss(
        "council-of-tribes",
        "The Council of Tribes",
        "Poison Nova",
        "interrupt",
        "dps",
        "Stop Poison Nova and prepare to share the charge damage.",
        ["Share Barrel Through damage.", "Explosive Totem takes priority."],
        [
          "Focus priority totems.",
          "Prepare for Arc Lightning.",
          "Handle Debilitating Backhand.",
        ],
      ),
      boss(
        "dazar",
        "Dazar, the First King",
        "Gilded Destruction",
        "frontal",
        "dps",
        "Stay out of the boss’s forward arc during the empowered melee attacks.",
        ["Focus Reban early.", "Avoid Impaling Spear circles."],
        [
          "Interrupt Deathly Roar.",
          "Prepare for Gilded Destruction.",
          "Defend against Blade Combo.",
        ],
      ),
    ],
  },
  {
    id: "temple-of-sethraliss",
    name: "Temple of Sethraliss",
    image: "temple-of-sethraliss",
    sourceUpdated: "2026-08-18",
    bosses: [
      boss(
        "adderis-and-aspix",
        "Adderis and Aspix",
        "Storm Blessed",
        "swap",
        "dps",
        "Attack the boss without immunity; watch the protection switch.",
        [
          "Spread Gale Force, then collapse for soak.",
          "Move Tempest Winds away.",
        ],
        [
          "Swap off immunity.",
          "Spot-heal Gust targets.",
          "Defend against Overload.",
        ],
      ),
      boss(
        "merektha",
        "Merektha",
        "Knot of Snakes",
        "stack",
        "dps",
        "Bring the affected players into melee for a shared control response.",
        ["Drop Thunder Spit near edges.", "Interrupt Poison Spit adds."],
        [
          "Control and cleave snakes.",
          "Prepare for Serpentstorm.",
          "Defend each Lightning Bite.",
        ],
      ),
      boss(
        "galvazzt",
        "Galvazzt",
        "Lightning Spire",
        "soak",
        "dps",
        "Non-tanks intercept the spire beams before they feed the boss.",
        ["Cover all three spires.", "Move out of Induction puddles."],
        [
          "Cover an available beam.",
          "Plan sustained soak healing.",
          "Keep beams accessible.",
        ],
      ),
      boss(
        "avatar-of-sethraliss",
        "Avatar of Sethraliss",
        "Restore the Avatar",
        "heal",
        "healer",
        "After the Essence Defiler dies, heal the Avatar while allies control the incoming waves.",
        ["Collect Corrupted Lifeforce safely.", "Interrupt Twisted Hexxers."],
        [
          "Control incoming Tormentors.",
          "Heal Avatar; kite Tormentors.",
          "Protect the healer.",
        ],
      ),
    ],
  },
  {
    id: "ruby-life-pools",
    name: "Ruby Life Pools",
    image: "ruby-life-pools",
    sourceUpdated: "2026-10-14",
    bosses: [
      boss(
        "melidrussa-chillworn",
        "Melidrussa Chillworn",
        "Chillstorm",
        "spread",
        "dps",
        "Take the storm away from the party, then avoid its pull.",
        [
          "Bait Hailburst together, then rotate.",
          "Break Ice Bulwark; control whelps.",
        ],
        [
          "Separate with the storm.",
          "Prepare storm healing.",
          "Collect awakened whelps.",
        ],
      ),
      boss(
        "kokia-blazehoof",
        "Kokia Blazehoof",
        "Ritual Of Blazebinding",
        "adds",
        "dps",
        "Place the summoned add where it can be reached without hitting teammates.",
        ["Interrupt Blaze Volley.", "Keep Molten Boulder off your path."],
        [
          "Focus the summoned add.",
          "Prepare for Inferno.",
          "Defend against Searing Blows.",
        ],
      ),
      boss(
        "kyrakka-and-erkhart",
        "Kyrakka and Erkhart Stormvein",
        "Inferno Spit",
        "spread",
        "dps",
        "Drop fire outside the group and account for the next wind direction.",
        [
          "Stop casting for Interrupting Cloudburst.",
          "Avoid Roaring Flamebreath.",
        ],
        [
          "Place fire thoughtfully.",
          "Dispel Stormslam from tank.",
          "Prepare for Stormslam.",
        ],
      ),
    ],
  },
];
export function tacticPath(dungeon: TacticDungeon, boss: BossTactic) {
  return `/tactics/${dungeon.id}/${boss.id}`;
}
export function findTactic(dungeonId: string, bossId: string) {
  const dungeon = tacticsDungeons.find((d) => d.id === dungeonId);
  const boss = dungeon?.bosses.find((b) => b.id === bossId);
  return dungeon && boss ? { dungeon, boss } : undefined;
}
export function guideSource(dungeon: TacticDungeon) {
  return `https://www.method.gg/guides/dungeons/${dungeon.id}`;
}

export type CatalogLesson = Omit<typeof tacticsPreview, "scene"> & {
  scene?: {
    kind: SceneKind;
    actor: TacticRole;
    decision: "position" | "action";
    objective: string;
  };
  bossId?: string;
  dungeonId?: string;
  checks?: readonly string[];
};
const patterns: Record<
  SceneKind,
  {
    goal: string;
    wrong: readonly [string, string];
    decision: "position" | "action";
    point: readonly [number, number];
  }
> = {
  spread: {
    goal: "Separate from teammates",
    wrong: ["Overlap the group", "Move into the tank"],
    decision: "position",
    point: [77, 65],
  },
  stack: {
    goal: "Join the shared safe area",
    wrong: ["Stay isolated", "Leave the group behind"],
    decision: "position",
    point: [50, 48],
  },
  frontal: {
    goal: "Take the side position",
    wrong: ["Stand inside the frontal", "Cross through the boss"],
    decision: "position",
    point: [76, 45],
  },
  soak: {
    goal: "Cover your assigned soak",
    wrong: ["Leave the objective empty", "Double up on an occupied soak"],
    decision: "position",
    point: [65, 47],
  },
  interrupt: {
    goal: "Interrupt the priority cast",
    wrong: ["Let the cast complete", "Wait for another full cast"],
    decision: "action",
    point: [57, 65],
  },
  hide: {
    goal: "Use separate cover",
    wrong: ["Stay in the open", "Share an occupied barrel"],
    decision: "position",
    point: [78, 68],
  },
  adds: {
    goal: "Focus the priority add",
    wrong: ["Ignore the add", "Keep all damage on the boss"],
    decision: "action",
    point: [68, 52],
  },
  heal: {
    goal: "Heal the friendly objective",
    wrong: ["Ignore the Avatar", "Try to damage the Avatar"],
    decision: "action",
    point: [57, 65],
  },
  move: {
    goal: "Use the indicated open area",
    wrong: ["Remain in the hazard", "Move through the group"],
    decision: "position",
    point: [77, 65],
  },
  tether: {
    goal: "Move outward to break the tether",
    wrong: ["Stay close to the centre", "Stop before the tether breaks"],
    decision: "position",
    point: [77, 70],
  },
  orbs: {
    goal: "Guide the orb through the singularity",
    wrong: ["Touch the singularity yourself", "Drag the orb through teammates"],
    decision: "action",
    point: [77, 75],
  },
  gateway: {
    goal: "Wait, then take the safe gateway",
    wrong: ["Take the gateway before checking", "Walk through the wave"],
    decision: "action",
    point: [30, 42],
  },
  swap: {
    goal: "Attack the unshielded boss",
    wrong: ["Attack into immunity", "Ignore the protection switch"],
    decision: "action",
    point: [57, 65],
  },
  rescue: {
    goal: "Open the shaking sarcophagus",
    wrong: ["Ignore the trapped player", "Open an unmarked coffin first"],
    decision: "action",
    point: [72, 48],
  },
};
export function createCatalogLesson(
  dungeon: TacticDungeon,
  boss: BossTactic,
): CatalogLesson {
  let p = patterns[boss.kind];
  if (boss.id === "nalorakk")
    p = { ...p, goal: "Shelter behind Zul’jarra’s shield", point: [50, 54] };
  if (boss.id === "ravi")
    p = { ...p, goal: "Bring the boss to the empty bone pile" };
  if (boss.id === "sentinel-of-winter")
    p = { ...p, goal: "Rotate away from the baited tornadoes" };
  if (boss.id === "ikuzz")
    p = { ...p, goal: "Choose a root-free knockback path" };
  if (boss.id === "ziekket")
    p = {
      ...p,
      goal: "Aim the beam through defeated adds",
      point: [67.5, 70],
      decision: "action",
      wrong: ["Aim away from the bodies", "Leave the bodies untouched"],
    };

  const roles = Object.fromEntries(
    (["dps", "healer", "tank"] as TacticRole[]).map((key, i) => [
      key,
      {
        ...tacticsPreview.roles[key],
        title: `${tacticsPreview.roles[key].label} priorities`,
        text: boss.roles[i],
      },
    ]),
  ) as typeof tacticsPreview.roles;
  return {
    ...tacticsPreview,
    id: `${dungeon.id}-${boss.id}-v1`,
    dungeon: dungeon.name,
    boss: boss.name,
    mechanic: boss.mechanic,
    image: `/images/dungeons/${dungeon.image}.jpg`,
    source: {
      label: "Method · Tactyks’ dungeon guide",
      url: guideSource(dungeon),
    },
    roles,
    bossId: boss.id,
    dungeonId: dungeon.id,
    checks: boss.checks,
    note: "Key-mechanic study, not every encounter ability. Arena geometry, distances and teaching tempo are illustrative. Read the linked full guide before your run.",
    scene: {
      kind: boss.kind,
      actor: boss.actor,
      decision: p.decision,
      objective: p.goal,
    },
    steps: [
      {
        label: "Recognize",
        title: boss.mechanic,
        text: boss.summary,
        action: "Identify the highlighted player, cast or objective.",
        phase: "READ THE MECHANIC",
      },
      {
        label: "Prepare",
        title: p.goal,
        text: boss.summary,
        action: "Trace the blue indication. The layout is a teaching example.",
        phase: "PLAN YOUR RESPONSE",
      },
      {
        label: "Respond",
        title: "Commit to the response.",
        text: boss.summary,
        action:
          "Observe the illustrated outcome, then review the encounter notes.",
        phase: "EXECUTE THE RESPONSE",
      },
      {
        label: "Review",
        title: "Keep the next mechanic in mind.",
        text: boss.checks.join(" "),
        action: "Use the practice decision to test your understanding.",
        phase: "REVIEW AND RESET",
      },
    ],
    choices: [
      {
        id: "correct",
        x: p.point[0],
        y: p.point[1],
        label: p.goal,
        correct: true,
        feedback: `Correct principle: ${boss.summary}`,
      },
      ...p.wrong.map((label, i) => ({
        id: `wrong-${i}`,
        x: i === 0 ? 41 : 50,
        y: i === 0 ? 66 : 37,
        label,
        correct: false,
        feedback: `Reconsider the objective: ${boss.summary}`,
      })),
    ],
  };
}
