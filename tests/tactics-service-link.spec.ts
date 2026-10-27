import { expect, test } from "@playwright/test";

test("tactics visitors can discover Mythic+ runs", async ({ page }, testInfo) => {
  for (const path of ["/tactics", "/tactics/altar-of-fangs/ravi"]) {
    await page.goto(path);
    const card = page.getByRole("complementary", { name: "Mythic+ runs" });
    await expect(card).toContainText("price in gold");
    const link = card.getByRole("link", { name: "Explore Mythic+ runs" });
    await expect(link).toHaveAttribute("href", "/#mythic");
    await card.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`tactics-service-${path === "/tactics" ? "catalog" : "boss"}.png`) });
    if (path !== "/tactics") {
      await link.click();
      await expect(page).toHaveURL(/\/#mythic$/);
      await expect(page.locator("#mythic")).toBeVisible();
    }
  }
});
