import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/delves", "/mythic-plus-rewards", "/gold-prices", "/mythic-plus-guide", "/tactics"];
async function checkGrid(page: Page, path: string) {
  const nav = page.locator("header .container").first();
  const content = path === "/" ? page.locator("#mythic > .container")
    : path === "/tactics" ? page.locator("main")
    : page.getByRole("navigation", { name: "Breadcrumb", exact: true }).locator("..");
  const navigation = await nav.boundingBox();
  const body = await content.boundingBox();
  expect(navigation).not.toBeNull();
  expect(body).not.toBeNull();
  expect(Math.abs(body!.x - navigation!.x), `${path} left edge`).toBeLessThan(1);
  expect(Math.abs(body!.width - navigation!.width), `${path} width`).toBeLessThan(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${path} overflow`).toBe(true);
  if (path === "/delves") {
    const builder = await page.locator("#delve-builder").boundingBox();
    expect(Math.abs(builder!.x - navigation!.x)).toBeLessThan(1);
    expect(Math.abs(builder!.width - navigation!.width)).toBeLessThan(1);
  }
  return body!;
}

test("main pages share the navigation grid at phone, tablet and desktop widths", async ({ page }, info) => {
  test.setTimeout(120000);
  const widths = info.project.name === "Mobile Chrome" ? [320, 393, 768] : [1440, 1920];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    let previous: { x: number; width: number } | undefined;
    for (const path of routes) {
      await page.goto(path);
      const grid = await checkGrid(page, path);
      if (previous) {
        expect(Math.abs(grid.x - previous.x)).toBeLessThan(1);
        expect(Math.abs(grid.width - previous.width)).toBeLessThan(1);
      }
      previous = grid;
      if (width === 393 || width === 1920) {
        await page.screenshot({ path: info.outputPath(`tactics-grid-${path === "/" ? "home" : path.slice(1)}-${width}.png`) });
      }
    }
  }
});

test("all dungeon guides align with the shared site grid", async ({ page }, info) => {
  test.setTimeout(120000);
  const width = info.project.name === "Mobile Chrome" ? 393 : 1440;
  await page.setViewportSize({ width, height: 1000 });
  for (const dungeon of ["altar-of-fangs", "den-of-nalorakk", "kings-rest", "murder-row", "the-blinding-vale", "voidscar-arena", "temple-of-sethraliss", "ruby-life-pools"]) {
    const path = `/tactics/${dungeon}`;
    await page.goto(path);
    await checkGrid(page, path);
    if (dungeon === "altar-of-fangs" || dungeon === "ruby-life-pools") {
      await page.screenshot({ path: info.outputPath(`tactics-grid-${dungeon}-${width}.png`) });
    }
  }
});

test("client-side service navigation does not shift the page grid", async ({ page }, info) => {
  const mobile = info.project.name === "Mobile Chrome";
  await page.setViewportSize({ width: mobile ? 393 : 1440, height: 1000 });
  await page.goto("/");
  const original = await checkGrid(page, "/");
  for (const [label, path] of [["Delves", "/delves"], ["Rewards & Tools", "/mythic-plus-rewards"], ["Dungeon Tactics", "/tactics"], ["Gold Prices", "/gold-prices"]]) {
    if (mobile) await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: mobile ? "Mobile navigation" : "Main navigation", exact: true });
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    const grid = await checkGrid(page, path);
    expect(Math.abs(grid.x - original.x)).toBeLessThan(1);
    expect(Math.abs(grid.width - original.width)).toBeLessThan(1);
  }
});
