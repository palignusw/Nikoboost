import { test, expect } from "@playwright/test";
import { openReservation } from "./helpers/configurator";

test("Delves uses the existing reservation design, official photos and matching fonts", async ({
  page,
}, info) => {
  await page.goto("/");
  await openReservation(page);
  const original = page.getByRole("dialog", {
    name: "Reserve your run.",
    exact: true,
  });
  const reference = await original.evaluate((el) => ({
    font: getComputedStyle(el).fontFamily.split(",")[0],
    heading: getComputedStyle(el.querySelector("h2")!).fontFamily.split(",")[0],
    background: getComputedStyle(el).backgroundColor,
    radius: getComputedStyle(el).borderRadius,
    sectionSize: getComputedStyle(el.querySelector("form h3")!).fontSize,
    actionFont: getComputedStyle(
      el.querySelector("button[type=submit]")!,
    ).fontFamily.split(",")[0],
  }));
  await page.goto("/delves");
  await expect(page.locator("main img")).toHaveCount(7);
  const hero = page.locator("main img").first();
  await expect(hero).toBeVisible();
  await expect
    .poll(() => hero.evaluate((im: HTMLImageElement) => im.naturalWidth))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: /Reserve this expedition/ }).click();
  const modal = page.getByRole("dialog", {
    name: "Reserve your run.",
    exact: true,
  });
  await expect(modal.getByText("Contact & character details")).toBeVisible();
  await expect(
    modal.getByText("Preferred start time", { exact: true }),
  ).toBeVisible();
  const actual = await modal.evaluate((el) => ({
    font: getComputedStyle(el).fontFamily.split(",")[0],
    heading: getComputedStyle(el.querySelector("h2")!).fontFamily.split(",")[0],
    background: getComputedStyle(el).backgroundColor,
    radius: getComputedStyle(el).borderRadius,
    sectionSize: getComputedStyle(el.querySelector("form h3")!).fontSize,
    actionFont: getComputedStyle(
      el.querySelector("button[type=submit]")!,
    ).fontFamily.split(",")[0],
  }));
  expect(actual).toEqual(reference);
  const details = modal.locator("details");
  if (info.project.name.includes("Mobile")) {
    await expect(details).not.toHaveAttribute("open");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
  } else await expect(details).toHaveAttribute("open", "");
  await modal
    .getByRole("button", { name: "Choose date & time", exact: true })
    .click();
  await modal
    .getByRole("button", { name: "Select a date", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Choose preferred start date" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Choose preferred start date" }),
  ).toHaveCount(0);
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: /Preferred time / }).click();
  await expect(
    page.getByRole("dialog", { name: "Choose preferred time" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeVisible();
  await modal
    .getByRole("button", { name: "Flexible time", exact: true })
    .click();
  await modal.screenshot({
    path: `/tmp/delves-booking-${info.project.name.replaceAll(" ", "-")}.png`,
  });
  await page.keyboard.press("Escape");
  await expect(modal).toHaveCount(0);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `/tmp/delves-redesign-${info.project.name.replaceAll(" ", "-")}.png`,
    fullPage: true,
  });
});
