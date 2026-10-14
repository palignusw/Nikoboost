
import { test, expect, type Page } from "@playwright/test";

// All tests work locally and never submit an order.

async function openConfigurator(page: Page) {
  await page.goto("/");

  await page.getByRole("link", {
    name: /Build Your Run/i,
  }).click();

  await expect(page).toHaveURL(/#mythic$/);
}

async function openCharacterStep(page: Page) {
  await openConfigurator(page);

  await page.getByRole("button", {
    name: /Continue/i,
  }).click();

  await expect(
    page.getByRole("button", {
      name: "Select Rogue",
    })
  ).toBeVisible();
}

test.describe("NikoBoost configurator", () => {

test("Key level can be changed", async ({ page }) => {
  await openConfigurator(page);

  const keyGrid = page.locator('[class*="keyGrid"]');

  const key10 = keyGrid.getByRole("button", {
    name: "+10",
    exact: true,
  });

  const key12 = keyGrid.getByRole("button", {
    name: "+12",
    exact: true,
  });

  // Select +10
  await key10.click();

  await expect(key10).toHaveClass(/activeOption/);

  // Switch to +12
  await key12.click();

  // +12 must become selected
  await expect(key12).toHaveClass(/activeOption/);

  // +10 must no longer be selected
  await expect(key10).not.toHaveClass(/activeOption/);
});


  test("Four runs activate 5% discount", async ({ page }) => {
    await openConfigurator(page);

    const quickRuns = page.locator('[class*="quickRuns"]');

    await quickRuns.getByRole("button", {
      name: /4\s*RUNS/i,
    }).click();

    await expect(
      page.getByText("SAVE 5% WITH THIS PACKAGE")
    ).toBeVisible();

    await expect(
      quickRuns.getByRole("button", {
        name: /4\s*RUNS/i,
      })
    ).toHaveClass(/activeOption/);
  });

  test("Eight runs activate 10% discount", async ({ page }) => {
    await openConfigurator(page);

    await page.locator('[class*="quickRuns"]')
      .getByRole("button", {
        name: /8\s*RUNS/i,
      })
      .click();

    await expect(
      page.getByText("SAVE 10% WITH THIS PACKAGE")
    ).toBeVisible();
  });

  test("Rogue has only DPS role", async ({ page }) => {
    await openCharacterStep(page);

    await page.getByRole("button", {
      name: "Select Rogue",
    }).click();

    const roles = page.locator('[class*="roleButtonGrid"]');

    await expect(
      roles.getByRole("button", { name: /DPS/i })
    ).toBeVisible();

    await expect(
      roles.getByRole("button", { name: /Tank/i })
    ).toHaveCount(0);

    await expect(
      roles.getByRole("button", { name: /Healer/i })
    ).toHaveCount(0);

    await expect(
      page.getByText("Armor: Leather", { exact: true })
    ).toBeVisible();
  });

  test("Paladin supports three roles", async ({ page }) => {
    await openCharacterStep(page);

    await page.getByRole("button", {
      name: "Select Paladin",
    }).click();

    const roles = page.locator('[class*="roleButtonGrid"]');

    await expect(
      roles.getByRole("button", { name: /DPS/i })
    ).toBeVisible();

    await expect(
      roles.getByRole("button", { name: /Tank/i })
    ).toBeVisible();

    await expect(
      roles.getByRole("button", { name: /Healer/i })
    ).toBeVisible();

    await expect(
      page.getByText("Armor: Plate", { exact: true })
    ).toBeVisible();
  });

  test("Mage automatically selects Cloth armor", async ({ page }) => {
    await openCharacterStep(page);

    await page.getByRole("button", {
      name: "Select Mage",
    }).click();

    await expect(
      page.getByText("Armor: Cloth", { exact: true })
    ).toBeVisible();

    const roles = page.locator('[class*="roleButtonGrid"]');

    await expect(
      roles.getByRole("button", { name: /DPS/i })
    ).toBeVisible();

    await expect(
      roles.getByRole("button", { name: /Tank/i })
    ).toHaveCount(0);

    await expect(
      roles.getByRole("button", { name: /Healer/i })
    ).toHaveCount(0);
  });
});
