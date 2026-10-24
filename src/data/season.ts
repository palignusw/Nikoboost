/**
 * NIKOBOOST — EDIT THIS FILE WHEN A SEASON CHANGES.
 * Identity → Mythic+ rotation/images/rewards/prices → Delves routes/rewards/prices/art/copy.
 * Both UI and server import these values. Gold tariffs are NikoBoost prices.
 * Never put credentials here: this file is also shipped to browsers.
 * Update id on rollover to invalidate saved plans. See docs/season-update.md.
 */
export const wowSeason = {
  id: "midnight-s2",
  name: "Midnight Season 2",
  expansion: "Midnight",
  number: 2,
  patch: "12.1.5",
  checked: "2026-10-23",
  announcement:
    "https://news.blizzard.com/en-us/article/24294369/midnight-season-2-is-now-live",
} as const;

export const dungeons = [
  "Altar of Fangs",
  "Murder Row",
  "Den of Nalorakk",
  "The Blinding Vale",
  "Voidscar Arena",
  "Kings' Rest",
  "Temple of Sethraliss",
  "Ruby Life Pools",
] as const;

export type DungeonName = (typeof dungeons)[number];

export type CrestType = "Champion" | "Hero" | "Myth";

export type MythicReward = {
  level: number;
  dungeon: number;
  dungeonTrack: string;
  vault: number;
  vaultTrack: string;
  crest: CrestType;
  crestAmount: number;
};

// Seasonal reward data.
// Crest quantities are provisional until final verification.
export const mythicRewards: MythicReward[] = [
  {
    level: 2,
    dungeon: 295,
    dungeonTrack: "Champion 2/6",
    vault: 305,
    vaultTrack: "Hero 1/6",
    crest: "Champion",
    crestAmount: 12,
  },
  {
    level: 3,
    dungeon: 295,
    dungeonTrack: "Champion 2/6",
    vault: 305,
    vaultTrack: "Hero 1/6",
    crest: "Champion",
    crestAmount: 14,
  },
  {
    level: 4,
    dungeon: 298,
    dungeonTrack: "Champion 3/6",
    vault: 308,
    vaultTrack: "Hero 2/6",
    crest: "Hero",
    crestAmount: 10,
  },
  {
    level: 5,
    dungeon: 302,
    dungeonTrack: "Champion 4/6",
    vault: 308,
    vaultTrack: "Hero 2/6",
    crest: "Hero",
    crestAmount: 12,
  },
  {
    level: 6,
    dungeon: 305,
    dungeonTrack: "Hero 1/6",
    vault: 311,
    vaultTrack: "Hero 3/6",
    crest: "Hero",
    crestAmount: 14,
  },
  {
    level: 7,
    dungeon: 305,
    dungeonTrack: "Hero 1/6",
    vault: 315,
    vaultTrack: "Hero 4/6",
    crest: "Hero",
    crestAmount: 16,
  },
  {
    level: 8,
    dungeon: 308,
    dungeonTrack: "Hero 2/6",
    vault: 315,
    vaultTrack: "Hero 4/6",
    crest: "Hero",
    crestAmount: 18,
  },
  {
    level: 9,
    dungeon: 308,
    dungeonTrack: "Hero 2/6",
    vault: 315,
    vaultTrack: "Hero 4/6",
    crest: "Myth",
    crestAmount: 10,
  },
  ...Array.from({ length: 11 }, (_, i) => ({
    level: i + 10,
    dungeon: 311,
    dungeonTrack: "Hero 3/6",
    vault: 318,
    vaultTrack: "Myth 1/6",
    crest: "Myth" as CrestType,
    crestAmount: i === 0 ? 12 : i === 1 ? 14 : 16,
  })),
];

export const vaultThresholds = [1, 4, 8] as const;

export function getMythicReward(level: number): MythicReward | undefined {
  return mythicRewards.find((reward) => reward.level === level);
}

export const dungeonImages: Record<string, string> = {
  "Altar of Fangs": "altar-of-fangs",
  "Murder Row": "murder-row",
  "Den of Nalorakk": "den-of-nalorakk",
  "The Blinding Vale": "the-blinding-vale",
  "Voidscar Arena": "voidscar-arena",
  "Kings' Rest": "kings-rest",
  "Temple of Sethraliss": "temple-of-sethraliss",
  "Ruby Life Pools": "ruby-life-pools",
};

export const mythicBasePrices: Record<number, number> = {
  2: 40000,
  3: 40000,
  4: 45000,
  5: 50000,
  6: 55000,
  7: 60000,
  8: 65000,
  9: 70000,
  10: 72000,
  11: 82000,
  12: 100000,
  13: 110000,
  14: 125000,
  15: 140000,
  16: 165000,
  17: 200000,
  18: 275000,
  19: 600000,
  20: 820000,
};
export const servicePricing = {
  mythic: {
    traders: { 0: 0, 1: 0.05, 2: 0.1, 3: 0.18, 4: 0.25 } as Record<
      number,
      number
    >,
    afk: 0.1,
    specific: 0.1,
    roles: { dps: 0, tank: 0.15, healer: 0.15 },
    bundles: [
      { runs: 8, saving: 0.1 },
      { runs: 4, saving: 0.05 },
      { runs: 2, saving: 0.03 },
    ],
  },
  delves: {
    specific: 0.05,
    bundles: [
      { runs: 8, saving: 0.1 },
      { runs: 4, saving: 0.05 },
    ],
  },
};
export const delveSettings = {
  heroArt: "midnight-delves",
  heroBackdrop: "/images/hero/midnight-hero.jpg",
  recommendedTier: 8,
  defaultRuns: 4,
  maxRuns: 20,
  regularLootCap: 272,
  vaultThresholds: [2, 4, 8],
  bundles: [1, 2, 4, 8],
  challengeNote:
    "Tier 11 Bountiful Delves can award Ascendant Venomstones after the 12.1.5 quest unlock. Bonus rewards depend on your progression.",
};
export const mythicDefaults = { key: 10, compareKey: 12, farmKey: 12 };
export const delveSources = [
  {
    label: "Blizzard: original Midnight locations",
    href: "https://news.blizzard.com/en-gb/article/24244644/unleash-your-skills-in-midnight-s-new-delves",
  },
  {
    label: "Blizzard: Season 2 additions",
    href: "https://news.blizzard.com/en-gb/article/24294370/curse-of-ulatek-now-live-journey-to-the-coiled-isle",
  },
  {
    label: "Blizzard: Labyrinth & 12.1.5 rewards",
    href: "https://news.blizzard.com/en-us/article/24304162/12-1-5-content-update-notes",
  },
  {
    label: "Delve reward reference",
    href: "https://www.icy-veins.com/wow/delves-guide",
  },
];
export const delveSpecialists = [
  {
    kind: "nemesis",
    title: "Venomfall Deeps",
    orderTitle: "Azta’rec / Venomfall Deeps",
    art: "venomfall-deeps",
    badge: "SEASON 2 NEMESIS",
    description:
      "Face Azta’rec on the Coiled Isle. A dedicated encounter with its own objectives. Grouped completion does not grant solo-only rewards.",
    action: "Discuss a Nemesis run ↗",
  },
  {
    kind: "labyrinth",
    title: "Labyrinth of Kindo’jan",
    orderTitle: "Labyrinth of Kindo’jan",
    art: "labyrinth",
    badge: "NEW IN PATCH 12.1.5",
    description:
      "A nine-chamber adventure with its own progression and rewards. Tell us which wings and objectives you want to complete; we confirm the self-play scope and gold quote.",
    action: "Plan a Labyrinth adventure ↗",
  },
] as const;
export const delveLocations = [
  {
    id: "collegiate-calamity",
    name: "Collegiate Calamity",
    zone: "Silvermoon City",
    theme: "An academy in chaos",
    mark: "01",
  },
  {
    id: "the-darkway",
    name: "The Darkway",
    zone: "Silvermoon City",
    theme: "Below the city streets",
    mark: "02",
  },
  {
    id: "shadow-enclave",
    name: "The Shadow Enclave",
    zone: "Eversong Woods",
    theme: "Behind enemy lines",
    mark: "03",
  },
  {
    id: "parhelion-plaza",
    name: "Parhelion Plaza",
    zone: "Isle of Quel’Danas",
    theme: "An open-air expedition",
    mark: "04",
  },
  {
    id: "atal-aman",
    name: "Atal’Aman",
    zone: "Zul’Aman",
    theme: "Into Amani territory",
    mark: "05",
  },
  {
    id: "twilight-crypts",
    name: "Twilight Crypts",
    zone: "Zul’Aman",
    theme: "Secrets beneath the ruins",
    mark: "06",
  },
  {
    id: "grudge-pit",
    name: "The Grudge Pit",
    zone: "Harandar",
    theme: "A fight in the depths",
    mark: "07",
  },
  {
    id: "gulf-of-memory",
    name: "The Gulf of Memory",
    zone: "Harandar",
    theme: "A journey through memory",
    mark: "08",
  },
  {
    id: "shadowguard-point",
    name: "Shadowguard Point",
    zone: "Voidstorm",
    theme: "Beyond the shadows",
    mark: "09",
  },
  {
    id: "sunkiller-sanctum",
    name: "Sunkiller Sanctum",
    zone: "Voidstorm",
    theme: "The heart of the Void",
    mark: "10",
  },
  {
    id: "ring-of-glory",
    name: "The Ring of Glory",
    zone: "The Coiled Isle",
    theme: "A new Season 2 challenge",
    mark: "11",
    fresh: true,
  },
  {
    id: "gnarldor-isle",
    name: "Gnarldor Isle",
    zone: "The Coiled Isle",
    theme: "Explore the cursed island",
    mark: "12",
    fresh: true,
  },
] as const;

export const delvePrices: Record<number, number> = {
  1: 25000,
  2: 25000,
  3: 25000,
  4: 30000,
  5: 35000,
  6: 40000,
  7: 45000,
  8: 50000,
  9: 65000,
  10: 85000,
  11: 110000,
};

// Tier 4 Vault is omitted: public references disagree on that entry.
export const delveRewards: Record<
  number,
  { coffer: number; vault: number | null }
> = {
  1: { coffer: 266, vault: 279 },
  2: { coffer: 269, vault: 282 },
  3: { coffer: 272, vault: 285 },
  4: { coffer: 276, vault: null },
  5: { coffer: 279, vault: 292 },
  6: { coffer: 282, vault: 298 },
  7: { coffer: 292, vault: 302 },
  8: { coffer: 295, vault: 305 },
  9: { coffer: 295, vault: 305 },
  10: { coffer: 295, vault: 305 },
  11: { coffer: 295, vault: 305 },
};

export const delveArt: Record<string, { src: string; alt: string }> = {
  "midnight-delves": {
    src: "/images/delves/midnight-delves.webp",
    alt: "Midnight Delves with Valeera \u2014 official Blizzard screenshot",
  },
  "twilight-crypts": {
    src: "/images/delves/twilight-crypts.webp",
    alt: "Twilight Crypts \u2014 official Blizzard screenshot",
  },
  "sunkiller-sanctum": {
    src: "/images/delves/sunkiller-sanctum.webp",
    alt: "Sunkiller Sanctum \u2014 official Blizzard screenshot",
  },
  "ring-of-glory": {
    src: "/images/delves/ring-of-glory.webp",
    alt: "The Ring of Glory \u2014 official Blizzard screenshot",
  },
  "gnarldor-isle": {
    src: "/images/delves/gnarldor-isle.webp",
    alt: "Gnarldor Isle \u2014 official Blizzard screenshot",
  },
  "venomfall-deeps": {
    src: "/images/delves/venomfall-deeps.webp",
    alt: "Venomfall Deeps \u2014 official Blizzard screenshot",
  },
  labyrinth: {
    src: "/images/delves/labyrinth.webp",
    alt: "Labyrinth of Kindo\u2019jan \u2014 official Blizzard screenshot",
  },
};
export const featuredDelves = [
  "ring-of-glory",
  "gnarldor-isle",
  "twilight-crypts",
  "sunkiller-sanctum",
];

export const delveFaqs = [
  [
    "Which Tier should I choose?",
    "Tier 8 is the usual gearing target: the standard Bountiful Coffer and Delve-based World Vault item levels stop increasing there. Tiers 9–11 are for challenge and additional progression. Tier 11 Bountiful Delves also participate in the 12.1.5 Ascendant Venomstone system after the required unlock.",
  ],
  [
    "Do you provide Restored Coffer Keys?",
    "No. Bring one of your own Restored Coffer Keys for every Bountiful Coffer you want to open. We confirm the active Bountiful locations and your remaining eligibility before arranging the run. A regular clear does not include a Bountiful Coffer.",
  ],
  [
    "Does a bundle guarantee three items from the Vault?",
    "No. Completing 2, 4 or 8 qualifying World activities unlocks up to 1, 2 or 3 choices. You select one item from your entire Great Vault after the weekly reset. Your existing World progress may mean you need fewer runs.",
  ],
  [
    "Will you log into my account?",
    "No. Every fixed-price Delve run is self-play. You stay on your own character, join our group and follow the objectives. No password, account sharing or account registration is needed.",
  ],
  [
    "Can I order a solo Nemesis achievement?",
    "A grouped clear does not award solo-only achievements. Nemesis and Labyrinth requests are manual enquiries: tell us your exact goal, and we confirm what can be delivered through self-play and the gold price before any payment.",
  ],
  [
    "What happens after I reserve?",
    "Your request goes to the NikoBoost team. We contact you through BattleTag or Discord to confirm the route, tier access, availability, timing and in-game gold payment. Submitting the form does not take payment or guarantee an instant start.",
  ],
];

export const mythicSettings = {
  crestMaxKey: 12,
  maxRuns: 50,
  quickRuns: [1, 4, 8],
};

export const mythicExample = {
  completed: [10, 8, 6, 6],
  planned: [] as number[],
  notice:
    "Example loaded: one +10, one +8 and two +6 keys. Try adding three +10s to improve your second choice.",
};
