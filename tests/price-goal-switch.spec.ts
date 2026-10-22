import { expect, test } from "@playwright/test";

test("switching Standard Run and Crest Farming recalculates the price", async ({ page }) => {
  await page.goto("/");

  const standard = page.getByRole("button", { name: /Standard Run/ });
  const crest = page.getByRole("button", { name: /Crest Farming/ });
  const total = page.getByTestId("order-total");

  await page.getByRole("button", { name: /Mythic Plus 10,/ }).click();
  await page.getByRole("button", { name: /4 runs, save 5 percent/ }).click();
  await expect(total).toContainText("273,600");

  // AFK adds 10% in both services; only Standard includes role/trader extras.
  await page.getByRole("button", { name: /I Play/ }).first().click();
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.getByRole("button", { name: /Select Shaman/ }).click();
  await page.getByRole("button", { name: /Healer, 15% extra/ }).click();
  await expect(total).toContainText("314,640");

  // Step transitions are briefly locked to prevent double navigation.
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: /Back/ }).first().click();
  await crest.click();
  await expect(total).toContainText("273,600");

  await standard.click();
  await expect(total).toContainText("314,640");
});
