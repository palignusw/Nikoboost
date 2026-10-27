import { test, expect } from "@playwright/test";
import { mythicBasePrices, servicePricing } from "../src/data/season";
import { getBundleSaving } from "../src/lib/bundlePricing";
import { delvePrice } from "../src/data/delves";
import { servicePriceRows } from "../src/lib/servicePriceTable";

test("published gold tables match booking prices and remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/gold-prices");
  for (const service of ["mythic", "delves"] as const) {
    const region = page.getByRole("region", {
      name: `${service === "mythic" ? "Mythic+" : "Delves"} gold price table`,
      exact: true,
    });
    const rows = servicePriceRows(service);
    await expect(region.locator("tbody tr")).toHaveCount(rows.length);
    for (const row of rows) {
      const expected = [1, 4, 8].map((runs) => {
        const base = mythicBasePrices[row.level] * runs;
        return service === "mythic"
          ? base -
              Math.round(
                base * getBundleSaving(runs, servicePricing.mythic.bundles),
              )
          : delvePrice({ tier: row.level, runs, delveId: "any" }).total;
      });
      expect(row.totals).toEqual(expected);
      await expect(
        region
          .getByRole("row", {
            name: new RegExp(
              `^${service === "mythic" ? "\\+" : "Tier "}${row.level} `,
            ),
          })
          .getByRole("cell"),
      ).toHaveText(expected.map((n) => n.toLocaleString("en-US")));
    }
  }
  await expect(
    page.getByRole("link", {
      name: "Configure your Mythic+ run ↗",
      exact: true,
    }),
  ).toHaveAttribute("href", "/#mythic");
  await expect(
    page.getByRole("link", {
      name: "Configure your Delves run ↗",
      exact: true,
    }),
  ).toHaveAttribute("href", "/delves#delve-builder");
  await page
    .getByText("Why can the configurator show a different price?", {
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Crest Farming is a separate Mythic/),
  ).toBeVisible();
  await context.close();
});

test("gold prices page has no horizontal overflow at phone and compact desktop widths", async ({
  page,
}) => {
  await page.goto("/gold-prices");
  for (const width of [320, 393, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("h1:visible")).toHaveText(
      "WoW Boost Prices in Gold",
    );
  }
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "Gold Prices", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});


test("price tables offer a mobile scrolling hint", async ({ page }, testInfo) => {
  await page.goto("/gold-prices");
  await page.setViewportSize({ width: 320, height: 900 });
  for (const service of ["Mythic+", "Delves"]) {
    const table = page.getByRole("region", { name: `${service} gold price table`, exact: true });
    await expect(table.getByText(/Swipe sideways/)).toBeVisible();
    await table.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`tactics-price-${service === "Mythic+" ? "mythic" : "delves"}-mobile.png`) });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByText(/Swipe sideways/).first()).toBeHidden();
  await page.getByRole("region", { name: "Mythic+ gold price table", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath("tactics-price-desktop.png") });
});
