import { expect, test } from "@playwright/test";

test("weekly planner restores saved runs after hydration and persists edits", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("test:seeded")) {
      localStorage.setItem(
        "nikoboost:mythic-plus:vault-planner:v1",
        JSON.stringify({ runs: [10, 12] }),
      );
      localStorage.setItem("test:seeded", "true");
    }
  });
  await page.goto("/mythic-plus-rewards");
  await expect(
    page.getByRole("button", { name: "Remove key +10 run", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove key +12 run", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove key +10 run", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("nikoboost:mythic-plus:week:v2")!)
            .planned,
      ),
    )
    .toEqual([12]);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove key +12 run", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove key +10 run", exact: true }),
  ).toHaveCount(0);
});
