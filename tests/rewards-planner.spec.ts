import { expect, test } from "@playwright/test";
import { decodePlan, encodePlan, getWeeklyGoal } from "../src/lib/rewardsPlanner";

const storageKey = "nikoboost:mythic-plus:vault-planner:v1";

test("weekly goal counts qualifying keys rather than total runs", () => {
  expect(getWeeklyGoal([12, 2, 2, 2], 318, 2)).toEqual({ key: 10, required: 4, qualifying: 1, missing: 3 });
  expect(getWeeklyGoal([20, 11, 10, 10], 318, 2).missing).toBe(0);
  expect(getWeeklyGoal([6, 6, 6, 6], 311, 3).missing).toBe(4);
  expect(() => getWeeklyGoal([], 999, 2)).toThrow();
});

test("share links round trip and reject malformed or excessive plans", () => {
  expect(decodePlan(encodePlan([10, 2, 10, 12]))).toEqual([12, 10, 10, 2]);
  for (const value of [null, "99x1", "10x201", "10x0", "10x-2", "10x1,2x200", "<script>", "10x1," ]) expect(decodePlan(value)).toBeNull();
  expect(decodePlan("10x200")).toHaveLength(200);
  expect(decodePlan("")).toEqual([]);
});

test("build a weekly goal, reset it and recover with undo", async ({ page }) => {
  await page.goto("/mythic-plus-rewards");
  const goal = page.getByTestId("weekly-goal");
  await expect(goal.getByTestId("goal-runs")).toHaveText("4 × +10");
  await goal.getByRole("button", { name: "Add missing runs" }).click();
  await expect(goal.getByTestId("goal-runs")).toHaveText("Ready");
  await expect(page.getByRole("button", { name: "Remove key +10 run", exact: true })).toHaveCount(4);
  await goal.getByLabel("Dungeon choices").selectOption("3");
  await expect(goal.getByTestId("goal-runs")).toHaveText("4 × +10");
  await page.getByRole("button", { name: "Reset planner" }).click();
  await expect(goal.getByTestId("goal-runs")).toHaveText("8 × +10");
  await page.getByRole("button", { name: "Undo last change" }).click();
  await expect(page.getByRole("button", { name: "Remove key +10 run", exact: true })).toHaveCount(4);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).runs.length, storageKey)).toBe(4);
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove key +10 run", exact: true })).toHaveCount(4);
});

test("shared plan requires import, can be undone and can be shared again", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ runs: [2] })), storageKey);
  await page.goto("/mythic-plus-rewards?plan=12x1,10x3#weekly-planner");
  await expect(page.getByRole("button", { name: "Remove key +2 run", exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Import shared plan" }).click();
  await expect(page.getByRole("button", { name: "Remove key +10 run", exact: true })).toHaveCount(3);
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page.getByLabel("Your plan link")).toHaveValue(/plan=12x1%2C10x3/);
  await page.getByRole("button", { name: "Undo last change" }).click();
  await expect(page.getByRole("button", { name: "Remove key +2 run", exact: true })).toHaveCount(1);
});

test("invalid share links preserve the saved plan", async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ runs: [12] })), storageKey);
  await page.goto("/mythic-plus-rewards?plan=20x9999");
  await expect(page.getByRole("status")).toContainText("invalid");
  await expect(page.getByRole("button", { name: "Remove key +12 run", exact: true })).toHaveCount(1);
});

test("custom Crest yield changes the farm estimate and adds runs to the plan", async ({ page }) => {
  await page.goto("/mythic-plus-rewards");
  const calculator = page.locator("#crest-calculator");
  await calculator.getByLabel("CREST GOAL", { exact: true }).fill("100");
  await calculator.getByLabel("CURRENT CRESTS", { exact: true }).fill("20");
  await calculator.getByLabel("CRESTS PER RUN", { exact: false }).fill("20");
  await expect(calculator.locator('[class*="calculatorResultMain"] strong')).toHaveText("4");
  await expect(calculator).toContainText("Cross-key recommendations are disabled");
  await calculator.getByRole("button", { name: "Add farm to weekly plan" }).click();
  await expect(page.getByRole("button", { name: "Remove key +12 run", exact: true })).toHaveCount(4);
});

test("rewards route has its own metadata, working navigation and responsive tools", async ({ page }, info) => {
  await page.goto("/mythic-plus-rewards");
  await expect(page).toHaveTitle("Mythic+ Rewards & Weekly Vault Planner | NikoBoost");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/mythic-plus-rewards$/);
  await page.getByRole("navigation", { name: "Rewards tools" }).getByRole("link", { name: "Loot table" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(19);
  const sizes = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport + 1);
  await page.goto("/mythic-plus-rewards#weekly-planner");
  await page.getByTestId("weekly-goal").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/tmp/rewards-${info.project.name.replace(/ /g, "-")}.png` });
  await page.getByRole("link", { name: "Explore Mythic+ runs" }).click();
  await expect(page).toHaveURL(/\/#mythic$/);
});
