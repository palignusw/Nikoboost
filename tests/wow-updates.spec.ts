import { expect, test } from "@playwright/test";
import { fetchWowUpdates, parseBlizzardUpdates, resolveUpdates } from "../src/lib/wowUpdates";
import { parseMidnightContent } from "../src/lib/wowUpdateContent";
import { wowUpdatesConfig } from "../src/data/wow-updates-config";
import snapshot from "../src/data/wow-updates-snapshot.json";
import type { UpdatesSnapshot } from "../src/lib/wowUpdates";

const article = (id: number, title: string, published = "2026-10-27T12:00:00.000Z") => ({
  id, title, keywords: ["12.1.5"], status: "live", community: "wow-web", published, updated: published,
  url: `/news/${id}/official-notes`, content: '<p>World of Warcraft: Midnight</p><h2>Classes</h2><ul><li>Druid<ul><li>Feral<ul><li>Damage increased by 5%.</li></ul></li></ul></li></ul><script>never render or execute me</script>',
});
const source = (blogs: unknown[]) => `<html><script id="model">model = ${JSON.stringify({ blogs }).replace(/<\/script/gi, "<\\/script")};</script></html>`;
const fixture = source([article(1, "Hotfixes: October 27, 2026"), article(2, "12.1.5 Content Update Notes", "2026-10-13T12:00:00.000Z")]);

test("official update parser validates, deduplicates and never exports remote HTML", () => {
  const parsed = parseBlizzardUpdates(source([
    article(2, "12.1.5 Content Update Notes", "2026-10-13T12:00:00.000Z"),
    article(1, "Hotfixes: October 27, 2026"),
    { ...article(1, "Hotfixes: October 27, 2026"), updated: "2026-10-28T12:00:00.000Z" },
    article(3, "Buy a shiny mount"),
    { ...article(32, "13.0 Content Update Notes"), keywords: ["13.0"] },
    { ...article(30, "Hotfixes: October 27, 2026"), content: "The War Within" },
    article(31, "Hotfixes: January 1, 2026", "2026-01-01T12:00:00.000Z"), article(4, "Classic Content Update Notes"), article(5, "Forever Content Update Notes"),
    { ...article(6, "Content Update Notes"), url: "https://evil.example/notes" },
    { ...article(7, "Content Update Notes"), published: "invalid" },
    { ...article(8, "Content Update Notes"), draft: true },
    { ...article(9, "Content Update Notes"), url: "/news/999/wrong-id" },
  ]));
  expect(parsed.map((x) => x.id)).toEqual([1, 2]);
  expect(parsed[0].scope).toBe("midnight");
  expect(parsed[0].sections[0].lines[0].path).toEqual(["Druid", "Feral"]);
  expect(parsed[0].updatedAt).toBe("2026-10-28T12:00:00.000Z");
  expect(parsed[1].kind).toBe("patch");
  expect(JSON.stringify(parsed)).not.toContain("<script>");
  expect(Object.keys(parsed[0]).sort()).toEqual(["contentMode", "id", "kind", "publishedAt", "scope", "sections", "title", "updatedAt", "url"]);
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

test("updates page reads Midnight notes locally, supports search, filters and shared alignment", async ({ page }, info) => {
  await page.goto("/wow-updates");
  await expect(page).toHaveTitle(/Midnight Patch Notes & Hotfixes/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/wow-updates$/);
  const region = page.getByRole("region", { name: "Latest published updates", exact: true });
  const picker = region.getByRole("navigation", { name: "Choose Midnight update" });
  const notes = region.locator("article");
  await expect(notes).toBeVisible();
  await expect(region.getByRole("note", { name: "Update source status", exact: true })).toContainText("Last successful source check");
  const patches = region.getByRole("button", { name: "Patch notes", exact: true });
  await expect(patches).toBeEnabled({ timeout: 15000 });
  await patches.click();
  await expect(notes).toHaveAttribute("data-kind", "patch");
  await expect(notes.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await region.getByRole("button", { name: "Hotfixes", exact: true }).click();
  await expect(notes).toHaveAttribute("data-kind", "hotfix");
  await expect(notes).toContainText("Druid");
  await notes.getByRole("searchbox").fill("Feral");
  await expect(notes).toContainText("Feral");
  await expect(notes.locator("li")).not.toHaveCount(0);
  await expect(notes.locator('[data-change="buff"]').first()).toBeVisible();
  await notes.locator("section").first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath(`tactics-midnight-badges-${info.project.name.replaceAll(" ", "-")}.png`) });
  await notes.getByRole("searchbox").fill("not-a-real-ability-xyz");
  await expect(notes).toContainText("No changes match");
  await notes.getByRole("button", { name: "Clear search" }).click();
  await region.getByRole("button", { name: "All updates", exact: true }).click();
  for (const href of await picker.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))) expect(href).toMatch(/^#update-\d+$/);
  const second = picker.locator("a").nth(1);
  const hash = await second.getAttribute("href");
  await second.click();
  await expect(notes).toHaveAttribute("id", hash!.slice(1));
  await page.reload();
  await expect(region.locator(`article${hash}`)).toBeVisible();
  for (const width of info.project.name === "Mobile Chrome" ? [320, 393] : [1280, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    const nav = await page.locator("header .container:visible").first().boundingBox();
    const main = await page.locator("main:visible").boundingBox();
    expect(Math.abs(nav!.x - main!.x)).toBeLessThan(1);
    expect(Math.abs(nav!.width - main!.width)).toBeLessThan(1);
    if (width === 393 || width === 1920) {
      await notes.locator("header").scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`tactics-wow-updates-${width}.png`) });
      await notes.locator("section").first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath(`tactics-midnight-reader-${width}.png`) });
    }
  }
});

test("homepage exposes a compact updates block and links to the on-site reader", async ({ page }, info) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "Latest Midnight updates", exact: true });
  await expect(section.locator("article")).toHaveCount(3);
  await expect(section.getByRole("link", { name: /All Midnight patch notes/ })).toHaveAttribute("href", "/wow-updates");
  if (info.project.name === "Mobile Chrome") {
    await page.locator("#mythic-steps").scrollIntoViewIfNeeded();
    await expect(page.getByRole("region", { name: "Live order price", exact: true })).toBeVisible();
  }
  await section.scrollIntoViewIfNeeded();
  await expect(page.getByRole("region", { name: "Live order price", exact: true })).toBeHidden();
  await page.screenshot({ path: info.outputPath("tactics-wow-updates-home.png") });
  await section.getByRole("link", { name: /All Midnight patch notes/ }).click();
  await expect(page).toHaveURL(/\/wow-updates$/);
  const nav = page.locator("header .container:visible").first();
  await expect(nav.getByRole("link", { name: "WoW Updates", exact: true, includeHidden: true })).toHaveAttribute("aria-current", "page");
});


test("Midnight content parser removes other editions, resets only at dates and keeps nested context", () => {
  const html = `<p>Midnight intro, Classic intro.</p><h2>Hotfixes</h2>
    <p><strong>October 27, 2026</strong></p><p><strong>Classes</strong></p>
    <ul><li>Druid<ul><li>Feral<ul><li>Damage &amp; healing +5%.</li></ul></li></ul></li></ul>
    <p><strong>The Burning Crusade Classic</strong></p><ul><li>NOT MIDNIGHT</li></ul>
    <p><strong>Dungeons</strong></p><ul><li>STILL CLASSIC</li></ul>
    <p><strong>October 26, 2026</strong></p><p><strong>Delves</strong></p>
    <ul><li>Vault credit fixed.<img src="https://evil.example/track" onerror="alert(1)"></li></ul>
    <script>alert(1)</script><style>bad css</style><iframe>unsafe text</iframe>`;
  const sections = parseMidnightContent(html, "hotfix");
  expect(sections.map((s) => s.title)).toEqual(["Classes", "Delves"]);
  expect(sections[0].date).toBe("October 27, 2026");
  expect(sections[1].date).toBe("October 26, 2026");
  expect(sections[0].lines[0]).toEqual({ text: "Damage & healing +5%.", path: ["Druid", "Feral"] });
  expect(JSON.stringify(sections)).not.toMatch(/CLASSIC|alert|evil|unsafe|css/);
  expect(parseMidnightContent('<h2>Classes</h2><ul><li>Mage<ul><li>Classic<ul><li>exclude</li></ul></li><li>Fire<ul><li>Keep this</li></ul></li></ul></li></ul>', "patch")[0].lines).toEqual([{ text: "Keep this", path: ["Mage", "Fire"] }]);
  expect(parseMidnightContent('<div><h2>TABLE OF CONTENTS</h2><table><tr><td>duplicate</td></tr></table></div><h2>Items</h2><table><tr><td>Item A</td><td>Updated</td></tr></table>', "patch")[0].lines[0].text).toBe("Item A · Updated");
});
