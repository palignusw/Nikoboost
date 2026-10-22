/** Midnight S2 / 12.1.5. Sources and pricing rationale: docs/delves-research.md. */
export const DELVES_SEASON = "Midnight Season 2";
export const DELVES_CHECKED = "2026-10-23";
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
// NikoBoost house tariffs, NOT a claimed market average or currency conversion.
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
export function delvePrice(
  config: Pick<DelveConfig, "tier" | "runs" | "delveId">,
) {
  if (
    !Number.isInteger(config.tier) ||
    !delvePrices[config.tier] ||
    !Number.isInteger(config.runs) ||
    config.runs < 1 ||
    config.runs > 20 ||
    (config.delveId !== "any" &&
      !delveLocations.some((d) => d.id === config.delveId))
  )
    throw new Error("Invalid Delve configuration");
  const unit = delvePrices[config.tier];
  const base = unit * config.runs;
  const specific = config.delveId === "any" ? 0 : Math.round(base * 0.05);
  const discountRate = config.runs >= 8 ? 0.1 : config.runs >= 4 ? 0.05 : 0;
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
export function delveName(id: string) {
  return delveLocations.find((d) => d.id === id)?.name ?? "Any available Delve";
}
export const gold = (n: number) => n.toLocaleString("en-US");
