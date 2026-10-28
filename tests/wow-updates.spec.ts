import { expect, test } from "@playwright/test";
import { fetchWowUpdates, parseBlizzardUpdates, resolveUpdates } from "../src/lib/wowUpdates";
import { wowUpdatesConfig } from "../src/data/wow-updates-config";
import snapshot from "../src/data/wow-updates-snapshot.json";
import type { UpdatesSnapshot } from "../src/lib/wowUpdates";

const article = (id: number, title: string, published = "2026-10-27T12:00:00.000Z") => ({
  id, title, status: "live", community: "wow-web", published, updated: published,
  url: `/news/${id}/official-notes`, content: "<script>never render or execute me</script>",
});
const source = (blogs: unknown[]) => `<html><script id="model">model = ${JSON.stringify({ blogs }).replace(/<\/script/gi, "<\\/script")};</script></html>`;
const fixture = source([article(1, "Hotfixes: October 27, 2026"), article(2, "12.1.5 Content Update Notes", "2026-10-13T12:00:00.000Z")]);

test("official update parser validates, deduplicates and never exports remote HTML", () => {
  const parsed = parseBlizzardUpdates(source([
    article(2, "12.1.5 Content Update Notes", "2026-10-13T12:00:00.000Z"),
    article(1, "Hotfixes: October 27, 2026"),
    { ...article(1, "Hotfixes: October 27, 2026"), updated: "2026-10-28T12:00:00.000Z" },
    article(3, "Buy a shiny mount"), article(4, "Classic Content Update Notes"), article(5, "Forever Content Update Notes"),
    { ...article(6, "Content Update Notes"), url: "https://evil.example/notes" },
    { ...article(7, "Content Update Notes"), published: "invalid" },
    { ...article(8, "Content Update Notes"), draft: true },
    { ...article(9, "Content Update Notes"), url: "/news/999/wrong-id" },
  ]));
  expect(parsed.map((x) => x.id)).toEqual([1, 2]);
  expect(parsed[0].scope).toBe("shared");
  expect(parsed[0].updatedAt).toBe("2026-10-28T12:00:00.000Z");
  expect(parsed[1].kind).toBe("patch");
  expect(JSON.stringify(parsed)).not.toContain("<script>");
  expect(Object.keys(parsed[0]).sort()).toEqual(["id", "kind", "publishedAt", "scope", "title", "updatedAt", "url"]);
  for (const invalid of ["blocked", '<script id="model">alert(1)</script>', source([]), source([article(1, "Promotional news")])]) expect(() => parseBlizzardUpdates(invalid)).toThrow();
});

test("official update fetch checks response limits and fallback preserves the verified date", async () => {
  const fetcher = async (url: RequestInfo | URL, options?: RequestInit) => {
    expect(url).toBe(wowUpdatesConfig.sourceUrl);
    expect(options?.redirect).toBe("error");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    return new Response(fixture, { headers: { "content-type": "text/html" } });
  };
  const live = await fetchWowUpdates(fetcher as typeof fetch);
  expect(live.items).toHaveLength(2);
  expect(Number.isFinite(Date.parse(live.checkedAt))).toBe(true);
  const fallback = await resolveUpdates(async () => { throw new Error("source blocked"); }, snapshot as UpdatesSnapshot);
  expect(fallback.mode).toBe("saved");
  expect(fallback.checkedAt).toBe(snapshot.checkedAt);
  expect(fallback.items).toEqual(snapshot.items);
  expect((await resolveUpdates(async () => live, snapshot as UpdatesSnapshot)).mode).toBe("cached");
  for (const response of [
    new Response("blocked", { status: 403 }),
    new Response(fixture, { headers: { "content-type": "text/plain" } }),
    new Response(fixture, { headers: { "content-type": "text/html", "content-length": String(wowUpdatesConfig.maxResponseBytes + 1) } }),
    new Response("x".repeat(wowUpdatesConfig.maxResponseBytes + 1), { headers: { "content-type": "text/html" } }),
  ]) await expect(fetchWowUpdates((async () => response) as typeof fetch)).rejects.toThrow();
});

test("updates page has metadata, safe source links, filters and shared page alignment", async ({ page }, info) => {
  await page.goto("/wow-updates");
  await expect(page).toHaveTitle(/WoW Patch Notes & Hotfixes/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/wow-updates$/);
  const list = page.getByLabel("Official updates list");
  await expect(list.locator("article").first()).toBeVisible();
  await expect(page.getByLabel("Update source status")).toContainText("Last successful source check");
  const patches = page.getByRole("button", { name: "Patch notes", exact: true });
  await expect(patches).toBeEnabled({ timeout: 15000 });
  await patches.click();
  await expect(list.locator('article[data-kind="hotfix"]')).toHaveCount(0);
  expect(await list.locator('article[data-kind="patch"]').count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Hotfixes", exact: true }).click();
  await expect(list.locator('article[data-kind="patch"]')).toHaveCount(0);
  await expect(list).toContainText("Retail & Classic");
  await page.getByRole("button", { name: "All updates", exact: true }).click();
  for (const href of await list.locator("h3 a").evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))) {
    expect(href).toMatch(/^https:\/\/worldofwarcraft\.blizzard\.com\/en-us\/news\/\d+\/[a-z0-9-]+$/i);
  }
  for (const width of info.project.name === "Mobile Chrome" ? [320, 393] : [1280, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const nav = await page.locator("header .container:visible").first().boundingBox();
    const main = await page.locator("main:visible").boundingBox();
    expect(Math.abs(nav!.x - main!.x)).toBeLessThan(1);
    expect(Math.abs(nav!.width - main!.width)).toBeLessThan(1);
    if (width === 393 || width === 1920) await page.screenshot({ path: info.outputPath(`tactics-wow-updates-${width}.png`), fullPage: true });
  }
});

test("homepage exposes a compact updates block and links to the full index", async ({ page }, info) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "Latest WoW updates", exact: true });
  await expect(section.locator("article")).toHaveCount(3);
  await expect(section.getByRole("link", { name: /All patch notes/ })).toHaveAttribute("href", "/wow-updates");
  await section.scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath("tactics-wow-updates-home.png") });
  await section.getByRole("link", { name: /All patch notes/ }).click();
  await expect(page).toHaveURL(/\/wow-updates$/);
  const nav = page.locator("header .container:visible").first();
  await expect(nav.getByRole("link", { name: "WoW Updates", exact: true, includeHidden: true })).toHaveAttribute("aria-current", "page");
});
