
import { test, expect } from "@playwright/test";

test.describe("NikoBoost smoke tests", () => {
  test("Homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /WoW Mythic\+ Boost for Gold/i,
      })
    ).toBeVisible();
  });

  test("Main booking button works", async ({ page }) => {
    await page.goto("/");

    const button = page.getByRole("link", {
      name: /Build Your Run/i,
    });

    await expect(button).toBeVisible();

    await button.click();

    await expect(page).toHaveURL(/#mythic$/);
  });

  test("WoW class images load", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(async () => {
      const response = await fetch("/images/classes/rogue.jpg");

      return {
        status: response.status,
        type: response.headers.get("content-type"),
      };
    });

    expect(result.status).toBe(200);
    expect(result.type).toMatch(/^image\//);
  });

  test("Hero video is available", async ({ page }) => {
    await page.goto("/");

    const video = page.locator("video").first();

    await expect(video).toHaveAttribute(
      "autoplay",
      ""
    );

    await expect(video).toHaveAttribute("preload", "none");

    const response = await page.request.get(
      "/videos/midnight-hero.mp4"
    );

    expect(response.ok()).toBeTruthy();
  });

  test("Page has no horizontal overflow", async ({ page }) => {
    await page.goto("/");

    const sizes = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));

    expect(sizes.documentWidth).toBeLessThanOrEqual(
      sizes.viewportWidth + 1
    );
  });
});
