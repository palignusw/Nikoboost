import { expect, type Page } from "@playwright/test";

export async function runSetup(page: Page, runs = 1) {
  await page.getByRole("button", { name: /Mythic Plus 10,/ }).click();
  await page.getByRole("button", { name: new RegExp(`^${runs} runs?(,|$)`) }).click();
  await page.getByRole("button", { name: /I Play/ }).first().click();
}

export async function nextStep(page: Page) {
  const button = page.getByRole("button", { name: /Continue/i }).first();
  await expect(button).toBeEnabled();
  await button.click();
  // Navigation ignores clicks during its 650 ms transition lock.
  await page.waitForTimeout(700);
}

export async function openReservation(page: Page) {
  await page.goto("/");
  await runSetup(page);
  await nextStep(page);
  await page.getByRole("button", { name: "Select Rogue", exact: true }).click();
  await nextStep(page);
  await page.getByRole("button", { name: /Any dungeon/ }).first().click();
  await page.getByRole("button", { name: /No loot traders/ }).click();
  await page.locator('[class*="regionGrid"]').getByRole("button", { name: /EU/ }).click();
  await nextStep(page);
  await page.getByRole("button", { name: /Reserve run/i }).first().click();
  const modal = page.getByRole("dialog", { name: "Reserve your run." });
  await expect(modal).toBeVisible();
  return modal;
}
