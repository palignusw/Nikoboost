export type Region = "EU" | "NA";

export type Participation =
  | "play"
  | "afk";

export type Role =
  | "dps"
  | "tank"
  | "healer";

export type ArmorType =
  | "Cloth"
  | "Leather"
  | "Mail"
  | "Plate";

/*
 * STARTING PRICES
 *
 * Позже мы просто меняем эти цифры —
 * весь configurator пересчитывается автоматически.
 */

export const basePrices: Record<number, number> = {
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

export type DungeonName =
  (typeof dungeons)[number];

export const classArmor: Record<
  string,
  ArmorType
> = {
  Mage: "Cloth",
  Priest: "Cloth",
  Warlock: "Cloth",

  "Demon Hunter": "Leather",
  Druid: "Leather",
  Monk: "Leather",
  Rogue: "Leather",

  Evoker: "Mail",
  Hunter: "Mail",
  Shaman: "Mail",

  "Death Knight": "Plate",
  Paladin: "Plate",
  Warrior: "Plate",
};

export const classRoles: Record<
  string,
  Role[]
> = {
  Mage: ["dps"],
  Priest: ["dps", "healer"],
  Warlock: ["dps"],

  "Demon Hunter": ["dps", "tank"],
  Druid: [
    "dps",
    "tank",
    "healer",
  ],
  Monk: [
    "dps",
    "tank",
    "healer",
  ],
  Rogue: ["dps"],

  Evoker: ["dps", "healer"],
  Hunter: ["dps"],
  Shaman: ["dps", "healer"],

  "Death Knight": [
    "dps",
    "tank",
  ],
  Paladin: [
    "dps",
    "tank",
    "healer",
  ],
  Warrior: ["dps", "tank"],
};

/*
 * Доплата за loot traders.
 */
export const traderSurcharges: Record<
  number,
  number
> = {
  0: 0,
  1: 0.05,
  2: 0.10,
  3: 0.18,
  4: 0.25,
};

/*
 * AFK / minimal participation.
 */
export const AFK_SURCHARGE =
  0.1;

/*
 * Доплата применяется ТОЛЬКО
 * к конкретно назначенным dungeon runs.
 */
export const SPECIFIC_DUNGEON_SURCHARGE =
  0.1;

/*
 * Если buyer сам хочет играть Tank/Healer,
 * группе сложнее подобрать composition.
 */
export const roleSurcharges: Record<
  Role,
  number
> = {
  dps: 0,
  tank: 0.15,
  healer: 0.15,
};

/*
 * Для Plate / Leather можно собрать
 * полноценную группу из 4 boosters
 * того же armor type.
 *
 * Cloth / Mail ограничиваем тремя.
 */
export function getMaxTraders(
  armor: ArmorType
) {
  if (
    armor === "Plate" ||
    armor === "Leather"
  ) {
    return 4;
  }

  return 3;
}

/*
 * Bundle discount.
 */
export function getRunsDiscount(
  runs: number
) {
  if (runs >= 8) {
    return 0.1;
  }

  if (runs >= 4) {
    return 0.05;
  }

  if (runs >= 2) {
    return 0.03;
  }

  return 0;
}