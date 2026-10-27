import { expect, test } from "@playwright/test";

test("site navigation is available on tactics pages", async ({ page }, testInfo) => {
  for (const path of ["/tactics", "/tactics/altar-of-fangs/ravi"]) {
    await page.goto(path);
    const nav = page.getByRole("navigation", { name: "Main navigation", exact: true });
    if (testInfo.project.name === "Mobile Chrome") {
      await page.getByRole("button", { name: "Open menu" }).click();
      const mobile = page.getByRole("navigation", { name: "Mobile navigation" });
      await expect(mobile.getByRole("link", { name: "Mythic+", exact: true })).toHaveAttribute("href", "/#mythic");
      await expect(mobile.getByRole("link", { name: "Dungeon Tactics" })).toHaveAttribute("aria-current", "page");
      await page.getByRole("button", { name: "Close menu" }).click();
    } else {
      await expect(nav.getByRole("link", { name: "Mythic+", exact: true })).toHaveAttribute("href", "/#mythic");
      await expect(nav.getByRole("link", { name: "Dungeon Tactics" })).toHaveAttribute("aria-current", "page");
    }
    await expect(page.getByRole("link", { name: /Book a Run/ })).toHaveAttribute("href", "/#mythic");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`tactics-navigation-${path === "/tactics" ? "catalog" : "boss"}.png`) });
  }
});
