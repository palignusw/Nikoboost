
import { test, expect, type Page } from "@playwright/test";

const GOLD = {
  key10: 80_000,
  key12: 100_000,
};

async function openConfigurator(page: Page) {
  await page.goto("/");

  await page.getByRole("link", {
    name: /Build Your Run/i,
  }).click();

  await expect(page).toHaveURL(/#mythic$/);
}

async function selectKey(page: Page, level: number) {
  const keyGrid = page.locator('[class*="keyGrid"]');

  const button = keyGrid.getByRole("button", {
    name: `+${level}`,
    exact: true,
  });

  await button.click();
  await expect(button).toHaveClass(/activeOption/);
}

async function selectRuns(page: Page, runs: number) {
  const quickRuns = page.locator('[class*="quickRuns"]');

  const button = quickRuns.getByRole("button", {
    name: new RegExp(`^${runs}\\s*RUNS?$`, "i"),
  });

  await button.click();
  await expect(button).toHaveClass(/activeOption/);
}

// Find the displayed total within the order summary.


async function expectTotal(
  page: Page,
  expected: number
) {
  const formatted = expected.toLocaleString("en-US");

  const total = page.getByTestId("order-total");

  await expect(total).toBeVisible();

  await expect(total).toHaveText(
    new RegExp(`^${formatted}\\s*GOLD$`)
  );
}



test.describe("NikoBoost pricing", () => {
  test("Default +10 run costs 80,000 gold", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 10);

    await expectTotal(page, GOLD.key10);
  });

  test("+12 run costs 100,000 gold", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 12);

    await expectTotal(page, GOLD.key12);
  });

  test("Four +10 runs receive 5% discount", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 10);
    await selectRuns(page, 4);

    const expected = Math.round(
      GOLD.key10 * 4 * 0.95
    );

    expect(expected).toBe(304_000);

    await expectTotal(page, expected);

    await expect(
      page.getByText("SAVE 5% WITH THIS PACKAGE")
    ).toBeVisible();
  });

  test("Eight +10 runs receive 10% discount", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 10);
    await selectRuns(page, 8);

    const expected = Math.round(
      GOLD.key10 * 8 * 0.9
    );

    expect(expected).toBe(576_000);

    await expectTotal(page, expected);

    await expect(
      page.getByText("SAVE 10% WITH THIS PACKAGE")
    ).toBeVisible();
  });

  test("AFK adds 10% to the base price", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 10);

    const afkButton = page.getByText(
      "AFK / Minimal",
      { exact: true }
    ).first();

    await afkButton.click();

    const expected = GOLD.key10 * 1.1;

    await expectTotal(page, expected);
  });

  test("Changing key level recalculates total", async ({ page }) => {
    await openConfigurator(page);

    await selectKey(page, 10);
    await expectTotal(page, 80_000);

    await selectKey(page, 12);
    await expectTotal(page, 100_000);

    await selectKey(page, 10);
    await expectTotal(page, 80_000);
  });
});
