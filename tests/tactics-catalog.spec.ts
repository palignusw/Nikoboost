import { test, expect } from "@playwright/test";
import {
  tacticsDungeons,
  createCatalogLesson,
  tacticPath,
} from "../src/data/tactics-catalog";
import { dungeons } from "../src/data/season";
import { isPublishedTactic } from "../src/data/published-tactics";
import fs from "node:fs";

test("catalog covers all eight seasonal dungeons and all 28 encounters with usable lessons", async ({
  request,
}) => {
  expect(tacticsDungeons).toHaveLength(8);
  expect(tacticsDungeons.flatMap((d) => d.bosses)).toHaveLength(28);
  const normalize = (s: string) => s.toLowerCase().replace(/[’']/g, "");
  expect(tacticsDungeons.map((d) => normalize(d.name)).sort()).toEqual(
    dungeons.map(normalize).sort(),
  );
  const ids = new Set<string>();
  for (const d of tacticsDungeons) {
    expect(fs.existsSync(`public/images/dungeons/${d.image}.jpg`)).toBe(true);
    for (const b of d.bosses) {
      const url = tacticPath(d, b);
      expect(ids.has(url)).toBe(false);
      ids.add(url);
      const lesson = createCatalogLesson(d, b);
      expect(lesson.steps).toHaveLength(4);
      expect(lesson.choices.filter((c) => c.correct)).toHaveLength(1);
      expect(lesson.checks!.length).toBeGreaterThanOrEqual(2);
      for (const role of ["dps", "healer", "tank"] as const)
        expect(lesson.roles[role].text.length).toBeGreaterThan(4);
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      const html = await response.text();
      expect(html.includes("noindex"), url).toBe(!isPublishedTactic(d.id));
      expect(html, url).toContain(b.name.replace(/&/g, "&amp;"));
      expect(html, url).toContain("Mythic+ Guide");
      expect(html, url).toContain("Mythic+ tactics in");
    }
  }
});

test("catalog filters bosses and navigates to distinct encounter studies", async ({
  page,
}) => {
  await page.goto("/tactics");
  await expect(page.getByRole("status")).toHaveText("28 of 28 encounters");
  await page.getByRole("searchbox").fill("Sentinel");
  await expect(page.getByRole("status")).toHaveText("1 of 28 encounters");
  await page.getByRole("link", { name: /Sentinel of Winter/ }).click();
  await expect(page).toHaveURL(/\/den-of-nalorakk\/sentinel-of-winter$/);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: "Sentinel of Winter",
      exact: true,
    }),
  ).toContainText("Sentinel of Winter");
  await page.goto("/tactics");
  await page.getByRole("combobox").selectOption("altar-of-fangs");
  await expect(page.getByRole("status")).toHaveText("3 of 28 encounters");
  await page.getByRole("searchbox").fill("no-such-boss");
  await expect(
    page.getByRole("heading", { name: "No matching encounters." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all encounters" }).click();
  await expect(page.getByRole("status")).toHaveText("28 of 28 encounters");
});

test("position and action studies support practice and narrow screens", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  for (const path of [
    "/tactics",
    "/tactics/murder-row/lithiel-cinderfury",
    "/tactics/the-blinding-vale/ziekket",
    "/tactics/temple-of-sethraliss/avatar-of-sethraliss",
  ]) {
    await page.goto(path);
    for (const width of [320, 393, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}`,
      ).toBe(true);
      if ([393, 1440].includes(width))
        await page.screenshot({
          path: test
            .info()
            .outputPath(`tactics-${path.split("/").at(-1)}-${width}.png`),
          fullPage: true,
        });
    }
  }
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/tactics/ruby-life-pools",
  );
});


test("catalog search accepts reordered words and mechanic descriptions", async ({ page }) => {
  await page.goto("/tactics");
  const search = page.getByRole("searchbox");
  for (const query of ["ravi altar", "  ALTAR   RAV’I  ", "ravi bone"]) {
    await search.fill(query);
    await expect(page.getByRole("status")).toHaveText("1 of 28 encounters");
    await expect(page.getByRole("link", { name: /Rav’i/ })).toBeVisible();
  }
  await page.getByRole("combobox").selectOption("murder-row");
  await expect(page.getByRole("heading", { name: "No matching encounters." })).toBeVisible();
  await page.getByRole("button", { name: "Show all encounters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("status")).toHaveText("28 of 28 encounters");
});
