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
  for (const price of [
    ...Object.values(mythicBasePrices),
    ...Object.values(delvePrices),
  ]) {
    expect(Number.isSafeInteger(price)).toBe(true);
    expect(price).toBeGreaterThan(0);
  }
  const percentages = [
    servicePricing.mythic.afk,
    servicePricing.mythic.specific,
    servicePricing.delves.specific,
    ...Object.values(servicePricing.mythic.traders),
    ...Object.values(servicePricing.mythic.roles),
    ...servicePricing.mythic.bundles.map((b) => b.saving),
    ...servicePricing.delves.bundles.map((b) => b.saving),
  ];
  for (const rate of percentages) {
    expect(Number.isFinite(rate)).toBe(true);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThan(1);
  }

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
      servicePricing.delves.bundles
        .filter((bundle) => runs >= bundle.runs)
        .sort((a, b) => b.runs - a.runs)[0]?.saving ?? 0;
    expect(
      delvePrice({ tier: Number(tier), runs, delveId: delveLocations[0].id })
        .total,
    ).toBe(base + surcharge - Math.round((base + surcharge) * saving));
  }
});

test("bundle discounts do not depend on the order of configured packages", async () => {
  const { getBundleSaving } = await import("../src/lib/bundlePricing");
  for (const service of [servicePricing.mythic, servicePricing.delves]) {
    for (const runs of [1, 2, 3, 4, 7, 8, 20, 50]) {
      const eligible = service.bundles
        .filter((bundle) => bundle.runs <= runs)
        .sort((a, b) => b.runs - a.runs);
      const expected = eligible[0]?.saving ?? 0;
      expect(getBundleSaving(runs, service.bundles)).toBe(expected);
      expect(getBundleSaving(runs, [...service.bundles].reverse())).toBe(
        expected,
      );
    }
  }
  // The highest eligible threshold is authoritative even if its percentage is lower.
  expect(
    getBundleSaving(8, [
      { runs: 8, saving: 0.05 },
      { runs: 4, saving: 0.1 },
    ]),
  ).toBe(0.05);
  expect(getBundleSaving(8, [])).toBe(0);
  for (const cap of Object.values(servicePricing.mythic.maxTraders)) {
    expect(cap).toBeLessThanOrEqual(4);
    expect(Object.hasOwn(servicePricing.mythic.traders, cap)).toBe(true);
  }
});
