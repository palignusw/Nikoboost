import { expect, test } from "@playwright/test";
import { delvePrice } from "../src/data/delves";
import { delveSettings } from "../src/data/season";

test("Delve example matches the selectable price and explains both goals", async ({ page }) => {
  await page.goto("/delves");
  const example = delvePrice({ tier: delveSettings.recommendedTier, runs: 1, delveId: "any" }).total.toLocaleString("en-US");
  await expect(page.getByLabel("Example gold price")).toContainText(`${example} gold`);
  await expect(page.getByLabel("Example gold price")).toContainText("1 regular run · any available Delve");
  await expect(page.getByRole("button", { name: /Weekly Vault/ })).toContainText("no Coffer Key needed");
  await page.getByRole("button", { name: /Bountiful runs/ }).click();
  await expect(page.getByRole("button", { name: /Bountiful runs/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("One key for every Coffer.")).toBeVisible();
  await page.getByRole("button", { name: /Weekly Vault/ }).click();
  await page.getByRole("button", { name: /^1 Single run/ }).click();
  await expect(page.getByTestId("delve-total")).toHaveText(`${example} gold`);
  for (const width of [320, 393, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width !== 320) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({path: test.info().outputPath(`tactics-delve-clarity-${width}.png`)});
    }
  }
});
