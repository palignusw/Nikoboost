import { test, expect } from "@playwright/test";
const path = "/tactics/ruby-life-pools";
test("storyboard shows the mark, placement, pull and correct versus mistaken outcome", async ({ page }) => {
    const orders: string[] = [];
    page.on("request", r => { if (r.url().includes("/api/order"))
        orders.push(r.url()); });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chillstorm.");
    await expect(page.getByRole("img", { name: /Chillstorm scene/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The mark is on you." })).toBeVisible();
    await page.getByRole("button", { name: "Next action →" }).click();
    await expect(page.getByRole("heading", { name: "Take Chillstorm away from the group." })).toBeVisible();
    await page.getByRole("button", { name: "× Common mistake" }).click();
    await expect(page.getByText("Staying with the group puts the storm beside everyone.")).toBeVisible();
    await page.getByRole("button", { name: "✓ Correct response" }).click();
    await page.getByRole("button", { name: "Next action →" }).click();
    await expect(page.getByRole("heading", { name: "The storm is down. Move out." })).toBeVisible();
    await expect(page.getByText("ACTIVE STORM", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Next action →" }).click();
    await expect(page.getByText("ACTIVE STORM", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "× Common mistake" }).click();
    await expect(page.getByText("ACTIVE STORM", { exact: true })).toBeVisible();
    expect(orders).toEqual([]);
});
test("free position practice accepts multiple clear places and supports keyboard retry", async ({ page }) => {
    await page.goto(path);
    await page.getByRole("button", { name: "Show me where to move" }).click();
    const arena = page.getByRole("application");
    const box = await arena.boundingBox();
    expect(box).not.toBeNull();
    async function choose(x: number, y: number) { await arena.click({ position: { x: box!.width * x / 100, y: box!.height * y / 100 } }); }
    await choose(43, 64);
    await expect(page.getByRole("status")).toContainText("Too close to the group.");
    await choose(80, 64);
    await expect(page.getByRole("status")).toContainText("Good separation.");
    await choose(18, 80);
    await expect(page.getByRole("status")).toContainText("Good separation.");
    await page.getByRole("button", { name: "Reset position" }).click();
    await expect(page.getByRole("status")).toHaveCount(0);
    await arena.focus();
    for (let i = 0; i < 7; i++)
        await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Good separation.");
    await page.getByRole("button", { name: "Back to the explanation" }).click();
    await expect(page.getByRole("heading", { name: "The mark is on you." })).toBeVisible();
});
test("new preview is noindex, readable on small screens and linked from the boss route", async ({ page, request }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    for (const width of [320, 393, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if ([393, 1440].includes(width)) {
            await page.screenshot({ path: test.info().outputPath(`tactics-chill-mark-${width}.png`), fullPage: true });
            await page.getByRole("button", { name: /03.*Fight the pull/ }).click();
            await page.screenshot({ path: test.info().outputPath(`tactics-chill-pull-${width}.png`), fullPage: true });
            await page.getByRole("button", { name: "× Common mistake" }).click();
            await page.screenshot({ path: test.info().outputPath(`tactics-chill-mistake-${width}.png`), fullPage: true });
            await page.getByRole("button", { name: "✓ Correct response" }).click();
            await page.getByRole("button", { name: /01.*Spot the mark/ }).click();
        }
    }
    await page.goto("/tactics/ruby-life-pools/melidrussa-chillworn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Chillstorm.");
    await expect(page.getByRole("link", { name: /Method/ })).toHaveAttribute("href", "https://www.method.gg/guides/dungeons/ruby-life-pools");
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain(path);
});
