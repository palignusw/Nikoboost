import { test, expect } from "@playwright/test";
import { tacticsDungeons } from "../src/data/tactics-catalog";
import { isPublishedTactic } from "../src/data/published-tactics";
test("beginner guide is discoverable, indexable and usable on narrow screens", async ({
  page,
  request,
}) => {
  const route = "/mythic-plus-guide";
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: /Read the beginner guide/ }),
  ).toHaveAttribute("href", route);
  const response = await request.get(route);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("How a Mythic+ run works");
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mythic+ made clear",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/mythic-plus-guide$/,
  );
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(
    page.getByRole("link", { name: "Open rewards planner ↗" }),
  ).toHaveAttribute("href", "/mythic-plus-rewards");
  await expect(
    page.getByRole("link", { name: "Configure a run ↗" }),
  ).toHaveAttribute("href", "/#mythic");
  for (const dungeon of tacticsDungeons.filter((d) => isPublishedTactic(d.id)))
    await expect(
      page.getByRole("link", {
        name: new RegExp(dungeon.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      }),
    ).toHaveAttribute("href", `/tactics/${dungeon.id}`);
  for (const width of [320, 393, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width === 393 || width === 1440)
      await page.screenshot({
        path: test.info().outputPath(`tactics-beginner-guide-${width}.png`),
        fullPage: true,
      });
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(route);
});
