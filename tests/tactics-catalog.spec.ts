import { test, expect } from "@playwright/test";
import {
  tacticsDungeons,
  createCatalogLesson,
  tacticPath,
} from "../src/data/tactics-catalog";
import { dungeons } from "../src/data/season";
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
      expect(html, url).toContain("noindex");
      expect(html, url).toContain(b.name.replace(/&/g, "&amp;"));
    }
  }
});

test("catalog filters bosses and navigates to distinct encounter studies", async ({
  page,
}) => {
  await page.goto("/tactics");
  await expect(page.getByRole("status")).toHaveText("28 of 28 encounters");
  await page.getByRole("searchbox").fill("Kyrakka");
  await expect(page.getByRole("status")).toHaveText("1 of 28 encounters");
  await page.getByRole("link", { name: /Kyrakka and Erkhart/ }).click();
  await expect(page).toHaveURL(/\/ruby-life-pools\/kyrakka-and-erkhart$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Kyrakka and Erkhart",
  );
  await page.goto("/tactics");
  await page.getByRole("combobox").selectOption("temple-of-sethraliss");
  await expect(page.getByRole("status")).toHaveText("4 of 28 encounters");
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
  const cases = tacticsDungeons.map(d => ({d,b:d.bosses[0]}));
  for (const id of ["council-of-tribes", "avatar-of-sethraliss", "zaen-bladesorrow"]) {
    const d = tacticsDungeons.find(d => d.bosses.some(b => b.id===id))!;
    cases.push({d,b:d.bosses.find(b=>b.id===id)!});
  }
  for (const {d,b} of cases) {
    await page.goto(tacticPath(d, b));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(b.name);
    await page.getByRole("button", { name: "I get it. Let me try." }).click();
    const lesson = createCatalogLesson(d, b);
    await page
      .getByRole("button", {
        name: `2. ${lesson.choices[1].label}`,
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText(
      lesson.scene?.decision === "action" ? "Try a different action." : "Try a different position.",
    );
    await page
      .getByRole("button", {
        name: `1. ${lesson.choices[0].label}`,
        exact: true,
      })
      .click();
    await expect(page.getByRole("status")).toContainText("That’s the idea.");
  }
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
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "/tactics",
  );
});
