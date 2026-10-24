import { expect, test } from "@playwright/test";
import {
  decodePlan,
  encodePlan,
  getWeeklyGoal,
  restoreWeek,
} from "../src/lib/rewardsPlanner";

const storageKey = "nikoboost:mythic-plus:vault-planner:v1";

test("weekly goal counts qualifying keys rather than total runs", () => {
  expect(getWeeklyGoal([12, 2, 2, 2], 318, 2)).toEqual({
    key: 10,
    required: 4,
    qualifying: 1,
    missing: 3,
  });
  expect(getWeeklyGoal([20, 11, 10, 10], 318, 2).missing).toBe(0);
  expect(getWeeklyGoal([6, 6, 6, 6], 311, 3).missing).toBe(4);
  expect(() => getWeeklyGoal([], 999, 2)).toThrow();
});

test("share links round trip and reject malformed or excessive plans", () => {
  expect(decodePlan(encodePlan([10, 2, 10, 12]))).toEqual([12, 10, 10, 2]);
  for (const value of [
    null,
    "99x1",
    "10x201",
    "10x0",
    "10x-2",
    "10x1,2x200",
    "<script>",
    "10x1,",
  ])
    expect(decodePlan(value)).toBeNull();
  expect(decodePlan("10x200")).toHaveLength(200);
  expect(decodePlan("")).toEqual([]);
});

test("plan keys without changing earned rewards, then mark them completed", async ({
  page,
}) => {
  await page.goto("/mythic-plus-rewards");
  const goal = page.getByTestId("weekly-goal");
  await expect(goal.getByTestId("goal-runs")).toHaveText("4 × +10");
  await goal.getByRole("button", { name: "Add missing runs" }).click();
  await expect(goal.getByTestId("goal-runs")).toHaveText("Ready");
  await expect(page.getByTestId("vault-current-1")).toHaveText("Locked");
  await expect(page.getByTestId("vault-planned-1")).toContainText("318 iLvl");
  for (let i = 0; i < 4; i++)
    await page
      .getByRole("button", {
        name: "Mark planned key +10 completed",
        exact: true,
      })
      .first()
      .click();
  await expect(page.getByTestId("vault-current-1")).toContainText("318");
  await expect(
    page.getByRole("button", {
      name: "Remove completed key +10 run",
      exact: true,
    }),
  ).toHaveCount(4);
  await page.getByRole("button", { name: "Reset planner" }).click();
  await expect(goal.getByTestId("goal-runs")).toHaveText("4 × +10");
  await page.getByRole("button", { name: "Undo last change" }).click();
  await page.reload();
  await expect(page.getByTestId("vault-current-1")).toContainText("318");
});

test("mixed-key example explains why the next three high keys matter", async ({
  page,
}) => {
  await page.goto("/mythic-plus-rewards");
  await page.getByRole("button", { name: /Try a mixed-key example/ }).click();
  await expect(page.getByTestId("vault-current-0")).toContainText("318");
  await expect(page.getByTestId("vault-current-1")).toContainText("311");
  await expect(page.getByTestId("goal-runs")).toHaveText("3 × +10");
  await page.getByRole("button", { name: "Add missing runs" }).click();
  await expect(page.getByTestId("vault-current-1")).toContainText("311");
  await expect(page.getByTestId("vault-planned-1")).toContainText("318");
});

test("shared week requires import, preserves completion state, and supports undo", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ runs: [2] })),
    storageKey,
  );
  await page.goto("/mythic-plus-rewards?plan=10x3&done=12x1");
  await expect(
    page.getByRole("button", { name: "Remove key +2 run", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Import shared plan" }).click();
  await expect(
    page.getByRole("button", { name: "Remove key +10 run", exact: true }),
  ).toHaveCount(3);
  await expect(
    page.getByRole("button", {
      name: "Remove completed key +12 run",
      exact: true,
    }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page.getByLabel("Your plan link")).toHaveValue(
    /plan=10x3&done=12x1/,
  );
  await page.getByRole("button", { name: "Undo last change" }).click();
  await expect(
    page.getByRole("button", { name: "Remove key +2 run", exact: true }),
  ).toHaveCount(1);
});

test("invalid share links preserve the saved week", async ({ page }) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ runs: [12] })),
    storageKey,
  );
  await page.goto("/mythic-plus-rewards?plan=20x9999");
  await expect(page.getByRole("status")).toContainText("invalid");
  await expect(
    page.getByRole("button", { name: "Remove key +12 run", exact: true }),
  ).toHaveCount(1);
});

test("custom Crest yield changes estimate and creates planned keys only", async ({
  page,
}) => {
  await page.goto("/mythic-plus-rewards");
  await page.getByRole("button", { name: /Crest calculator/ }).click();
  const calculator = page.locator("#crest-calculator");
  await calculator.getByLabel("CREST GOAL", { exact: true }).fill("100");
  await calculator.getByLabel("CURRENT CRESTS", { exact: true }).fill("20");
  await calculator.getByLabel("CRESTS PER RUN", { exact: false }).fill("20");
  await expect(
    calculator.locator('[class*="calculatorResultMain"] strong'),
  ).toHaveText("4");
  await expect(calculator).toContainText("Your custom amount");
  await calculator
    .getByRole("button", { name: "Add farm to weekly plan" })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove key +12 run", exact: true }),
  ).toHaveCount(4);
  await expect(page.getByTestId("vault-current-0")).toHaveText("Locked");
});

test("styled selectors support keyboard selection, Escape and outside dismissal", async ({
  page,
}) => {
  await page.goto("/mythic-plus-rewards");
  const select = page.getByRole("combobox", { name: /Keystone level/ });
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(select).toContainText("+20 Keystone");
  await select.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(select).toBeFocused();
  await select.click();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await select.click();
  await page.getByRole("option", { name: /\+10 Keystone/ }).click();
  await page
    .getByRole("button", { name: "Log completed run", exact: true })
    .click();
  await expect(page.getByTestId("vault-current-0")).toContainText("318");
});

test("tools stay separate, compare equal gear tiers and navigate home", async ({
  page,
}, info) => {
  await page.goto("/mythic-plus-rewards");
  await expect(page).toHaveTitle(
    "Mythic+ Rewards & Weekly Vault Planner | NikoBoost",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/mythic-plus-rewards$/,
  );
  await expect(page.locator("#crest-calculator")).toBeHidden();
  await page.getByRole("button", { name: /Compare rewards/ }).click();
  await expect(page.getByTestId("weekly-goal")).toBeHidden();
  await page.getByRole("combobox", { name: /Second key/ }).click();
  await page.getByRole("option", { name: /\+11 Keystone/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Same gear item levels. Different challenge.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Full \+2–20 reward table/ }).click();
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(19);
  const sizes = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport + 1);
  await page.getByRole("button", { name: /Weekly Vault/ }).click();
  await page.screenshot({
    path: `/tmp/rewards-v2-${info.project.name.replace(/ /g, "-")}.png`,
    fullPage: true,
  });
  await page.getByRole("combobox", { name: /Keystone level/ }).click();
  await page.screenshot({
    path: `/tmp/rewards-select-${info.project.name.replace(/ /g, "-")}.png`,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: /Explore Mythic\+ runs/ }).click();
  await expect(page).toHaveURL(/\/#mythic$/);
});

test("saved weeks validate key levels and enforce a shared 200-run cap", () => {
  expect(restoreWeek({ completed: [10, "12", 99], planned: [2, 3] })).toEqual({
    completed: [10],
    planned: [2, 3],
  });
  expect(
    restoreWeek({ completed: Array(199).fill(10), planned: [12, 12, 12] })
      ?.planned,
  ).toEqual([12]);
  expect(restoreWeek({ completed: null, planned: [] })).toBeNull();
});

test("the teaching example is labeled and never saved as real completed progress", async ({
  page,
}) => {
  await page.goto("/mythic-plus-rewards");
  await page.getByRole("button", { name: /Try a mixed-key example/ }).click();
  await expect(page.getByRole("note")).toContainText("sample keys");
  await page.getByRole("button", { name: "Add missing runs" }).click();
  await page.reload();
  await expect(page.getByTestId("vault-current-0")).toHaveText("Locked");
  await expect(
    page.getByRole("button", { name: /Remove completed key/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Try a mixed-key example/ }).click();
  await page.getByRole("button", { name: "Start my own week" }).click();
  await expect(page.getByRole("note")).toHaveCount(0);
  await expect(page.getByTestId("vault-current-0")).toHaveText("Locked");
});

test("a shared plan from another season cannot overwrite the current week", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, JSON.stringify({ runs: [2] })),
    storageKey,
  );
  await page.goto(
    "/mythic-plus-rewards?season=retired-season&plan=10x3&done=12x1",
  );
  await expect(page.getByRole("status")).toContainText("different season");
  await expect(
    page.getByRole("button", { name: "Import shared plan" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remove key +2 run", exact: true }),
  ).toHaveCount(1);
});
