import { servicePricing } from "./season";
export type Region = "EU" | "NA";
import { dungeons } from "./wowSeason";

export { dungeons };
export type { DungeonName } from "./wowSeason";

export type Participation = "play" | "afk";

export type Role = "dps" | "tank" | "healer";

export type ArmorType = "Cloth" | "Leather" | "Mail" | "Plate";

/*
 * STARTING PRICES
 *
 * Позже мы просто меняем эти цифры —
 * весь configurator пересчитывается автоматически.
 */

export { mythicBasePrices as basePrices } from "./season";

export const classArmor: Record<string, ArmorType> = {
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

export const classRoles: Record<string, Role[]> = {
  Mage: ["dps"],
  Priest: ["dps", "healer"],
  Warlock: ["dps"],

  "Demon Hunter": ["dps", "tank"],
  Druid: ["dps", "tank", "healer"],
  Monk: ["dps", "tank", "healer"],
  Rogue: ["dps"],

  Evoker: ["dps", "healer"],
  Hunter: ["dps"],
  Shaman: ["dps", "healer"],

  "Death Knight": ["dps", "tank"],
  Paladin: ["dps", "tank", "healer"],
  Warrior: ["dps", "tank"],
};

/*
 * Доплата за loot traders.
 */
export const traderSurcharges = servicePricing.mythic.traders;

/*
 * AFK / minimal participation.
 */
export const AFK_SURCHARGE = servicePricing.mythic.afk;

/*
 * Доплата применяется ТОЛЬКО
 * к конкретно назначенным dungeon runs.
 */
export const SPECIFIC_DUNGEON_SURCHARGE = servicePricing.mythic.specific;

/*
 * Если buyer сам хочет играть Tank/Healer,
 * группе сложнее подобрать composition.
 */
export const roleSurcharges = servicePricing.mythic.roles;

/*
 * Для Plate / Leather можно собрать
 * полноценную группу из 4 boosters
 * того же armor type.
 *
 * Cloth / Mail ограничиваем тремя.
 */
export function getMaxTraders(armor: ArmorType) {
  if (armor === "Plate" || armor === "Leather") {
    return 4;
  }

  return 3;
}

/*
 * Bundle discount.
 */
export function getRunsDiscount(runs: number) {
  return (
    servicePricing.mythic.bundles.find((bundle) => runs >= bundle.runs)
      ?.saving ?? 0
  );
}
