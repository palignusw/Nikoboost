import { getBundleSaving } from "@/lib/bundlePricing";
import {
  wowSeason,
  delveLocations,
  delvePrices,
  delveSettings,
  servicePricing,
} from "./season";
export { delveLocations, delvePrices, delveRewards } from "./season";
export const DELVES_SEASON = wowSeason.name;
export const DELVES_CHECKED = wowSeason.checked;
export type DelveConfig = {
  service: "delves";
  kind: "runs" | "nemesis" | "labyrinth";
  tier: number;
  runs: number;
  region: "EU" | "NA";
  format: "regular" | "bountiful";
  delveId: string;
  playerClass: string;
};
export function delvePrice(
  config: Pick<DelveConfig, "tier" | "runs" | "delveId">,
) {
  if (
    !Number.isInteger(config.tier) ||
    !delvePrices[config.tier] ||
    !Number.isInteger(config.runs) ||
    config.runs < 1 ||
    config.runs > delveSettings.maxRuns ||
    (config.delveId !== "any" &&
      !delveLocations.some((d) => d.id === config.delveId))
  )
    throw new Error("Invalid Delve configuration");
  const unit = delvePrices[config.tier];
  const base = unit * config.runs;
  const specific =
    config.delveId === "any"
      ? 0
      : Math.round(base * servicePricing.delves.specific);
  const discountRate = getBundleSaving(
    config.runs,
    servicePricing.delves.bundles,
  );
  const discount = Math.round((base + specific) * discountRate);
  return {
    unit,
    base,
    specific,
    discount,
    discountRate,
    total: base + specific - discount,
  };
}
export function delveName(id: string) {
  return delveLocations.find((d) => d.id === id)?.name ?? "Any available Delve";
}
export const gold = (n: number) => n.toLocaleString("en-US");
