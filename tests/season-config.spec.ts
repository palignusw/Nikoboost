import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  dungeons,
  dungeonImages,
  mythicRewards,
  mythicBasePrices,
  mythicDefaults,
  mythicExample,
  mythicSettings,
  delveLocations,
  delvePrices,
  delveRewards,
  delveSettings,
  delveArt,
  featuredDelves,
  delveSpecialists,
  servicePricing,
  wowSeason,
} from "../src/data/season";
import { delvePrice } from "../src/data/delves";

// These contracts catch incomplete season edits without pinning the next season to today's names or prices.
test("season data covers every purchasable tier, route and default with local artwork", () => {
  expect(wowSeason.id).toMatch(/^[a-z0-9-]+$/);
  expect(new Set(dungeons).size).toBe(dungeons.length);
  for (const name of dungeons) {
    expect(dungeonImages[name], `Missing image for ${name}`).toBeTruthy();
    expect(
      existsSync(
        join(
          process.cwd(),
          "public/images/dungeons",
          `${dungeonImages[name]}.jpg`,
        ),
      ),
    ).toBe(true);
  }
  const levels = Object.keys(mythicBasePrices)
    .map(Number)
    .sort((a, b) => a - b);
  expect(mythicRewards.map((row) => row.level)).toEqual(levels);
  for (const key of [
    mythicDefaults.key,
    mythicDefaults.compareKey,
    mythicDefaults.farmKey,
    mythicSettings.crestMaxKey,
  ])
    expect(levels).toContain(key);
  for (const key of [...mythicExample.completed, ...mythicExample.planned])
    expect(levels).toContain(key);
  expect(new Set(delveLocations.map((route) => route.id)).size).toBe(
    delveLocations.length,
  );
  expect(Object.keys(delveRewards)).toEqual(Object.keys(delvePrices));
  expect(delvePrices[delveSettings.recommendedTier]).toBeGreaterThan(0);
  expect(
    delveSettings.bundles.every((n) => n >= 1 && n <= delveSettings.maxRuns),
  ).toBe(true);
  for (const id of featuredDelves) {
    expect(delveLocations.some((route) => route.id === id)).toBe(true);
    expect(delveArt[id]).toBeTruthy();
  }
  for (const id of [
    delveSettings.heroArt,
    ...delveSpecialists.map((entry) => entry.art),
  ])
    expect(delveArt[id]).toBeTruthy();
  for (const art of Object.values(delveArt))
    expect(existsSync(join(process.cwd(), "public", art.src))).toBe(true);
});

test("every configured Delve tariff calculates on the server without a hard-coded season range", () => {
  for (const [tier, unit] of Object.entries(delvePrices)) {
    expect(
      delvePrice({ tier: Number(tier), runs: 1, delveId: "any" }).total,
    ).toBe(unit);
    const runs = delveSettings.maxRuns;
    const base = unit * runs;
    const surcharge = Math.round(base * servicePricing.delves.specific);
    const saving =
      servicePricing.delves.bundles.find((bundle) => runs >= bundle.runs)
        ?.saving ?? 0;
    expect(
      delvePrice({ tier: Number(tier), runs, delveId: delveLocations[0].id })
        .total,
    ).toBe(base + surcharge - Math.round((base + surcharge) * saving));
  }
});
