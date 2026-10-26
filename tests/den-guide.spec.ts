import { test, expect, type Page } from "@playwright/test";
import { denLessons, type DenBossId } from "../src/data/den-guide";
import { getDenState, denGeometry } from "../src/data/den-playback";
const base = "/tactics/den-of-nalorakk";
async function seek(page: Page, time: number) {
  const slider = page.getByRole("slider", {
    name: "Den scene position",
    exact: true,
  });
  await slider.evaluate((el, value) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, time);
  await expect(slider).toHaveValue(String(time));
}

test("Den model contracts preserve sourced deadlines, contact, roots, shelter and interception geometry", () => {
  expect(getDenState("hoardmonger", 6).remaining).toBe(12);
  expect(getDenState("hoardmonger", 10).mushroom).not.toBeNull();
  expect(getDenState("hoardmonger", 11).mushroom).toBeNull();
  expect(
    getDenState("hoardmonger", 11)
      .actors.filter((a) => a.poison)
      .map((a) => a.id),
  ).toEqual(["P3"]);
  expect(getDenState("hoardmonger", 18.1, true).failure).toBe(true);
  expect(
    getDenState("hoardmonger", 18.1, true).actors.every((a) => a.poison),
  ).toBe(true);
  expect(
    getDenState("sentinel-of-winter", 11).adds.every((a) => !a.visible),
  ).toBe(true);
  expect(
    getDenState("sentinel-of-winter", 12).adds.filter((a) => a.visible),
  ).toHaveLength(2);
  const first = getDenState("sentinel-of-winter", 16);
  expect(first.adds[0].dead).toBe(true);
  expect(first.adds[1].controlled).toBe(true);
  expect(first.rime?.remaining).toBe(6);
  expect(getDenState("sentinel-of-winter", 21.9).rime?.covered).toBe(true);
  expect(getDenState("sentinel-of-winter", 22).rime).toBeNull();
  const rooted = getDenState("sentinel-of-winter", 24, true);
  expect(rooted.actors.every((a) => a.status.includes("Rooted"))).toBe(true);
  expect(rooted.actors).toEqual(
    getDenState("sentinel-of-winter", 25, true).actors,
  );
  expect(rooted.inDrift).toBe(false);
  expect(getDenState("sentinel-of-winter", 28).inDrift).toBe(true);
  expect(getDenState("sentinel-of-winter", 36).rime?.remaining).toBe(6);
  expect(getDenState("nalorakk", 0).remaining).toBe(4);
  expect(
    getDenState("nalorakk", 0).actors.filter((a) => a.marked),
  ).toHaveLength(3);
  const shelter = getDenState("nalorakk", 8);
  expect(shelter.actors.every((a) => a.y > shelter.npc!.y)).toBe(true);
  const slam = getDenState("nalorakk", 13);
  expect(
    Math.hypot(slam.actors[0].x - slam.npc!.x, slam.actors[0].y - slam.npc!.y),
  ).toBeLessThan(43);
  expect(
    slam.actors
      .slice(1)
      .every((a) => Math.hypot(a.x - slam.npc!.x, a.y - slam.npc!.y) > 43),
  ).toBe(true);
  for (const [i, p] of denGeometry.intercepts.entries()) {
    const start = denGeometry.echoDrops[i];
    expect(
      (p.x - start.x) * (210 - start.y) - (p.y - start.y) * (300 - start.x),
    ).toBeCloseTo(0);
  }
  expect(getDenState("nalorakk", 22).echoes.every((e) => e.intercepted)).toBe(
    true,
  );
  expect(
    getDenState("nalorakk", 22, true).echoes.filter((e) => !e.intercepted),
  ).toHaveLength(1);
  expect(getDenState("nalorakk", 22, true).failure).toBe(true);
  for (const lesson of denLessons)
    for (const mistake of [false, true])
      for (let t = 0; t <= lesson.duration; t += 0.25) {
        const world = getDenState(lesson.id, t, mistake);
        expect(world.actors).toHaveLength(5);
        expect(
          world.actors.every(
            (a) => a.x >= 20 && a.x <= 580 && a.y >= 20 && a.y <= 400,
          ),
        ).toBe(true);
        if (world.remaining !== null)
          expect(world.remaining).toBeGreaterThanOrEqual(0);
      }
});

test("Den playback and boss navigation support movement, pause, speed, reset and manual chapters", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(base + "/sentinel-of-winter");
  const slider = page.getByRole("slider", {
    name: "Den scene position",
    exact: true,
  });
  await page
    .getByRole("button", { name: "Play Den playback", exact: true })
    .click();
  await page.clock.fastForward(6000);
  expect(Number(await slider.inputValue())).toBeGreaterThan(5);
  expect(
    Number(await page.locator('[data-den-player="P2"]').getAttribute("data-x")),
  ).toBeLessThan(435);
  await page
    .getByRole("button", { name: "Pause Den playback", exact: true })
    .click();
  const paused = await slider.inputValue();
  await page.clock.fastForward(1000);
  await expect(slider).toHaveValue(paused);
  await page
    .getByRole("combobox", { name: "Den playback speed", exact: true })
    .selectOption("0.5");
  await page
    .getByRole("button", { name: "Play Den playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  expect(Number(await slider.inputValue()) - Number(paused)).toBeGreaterThan(
    0.35,
  );
  expect(Number(await slider.inputValue()) - Number(paused)).toBeLessThan(0.65);
  await page
    .getByRole("combobox", { name: "Den mechanic chapter", exact: true })
    .selectOption("rime-a");
  await expect(slider).toHaveValue("16");
  await expect(page.getByText("6.0s", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Next Den scene", exact: true })
    .click();
  await expect(slider).toHaveValue("22");
  await page
    .getByRole("button", { name: "Reset Den playback", exact: true })
    .click();
  await expect(slider).toHaveValue("0");
  await seek(page, 43.8);
  await page
    .getByRole("button", { name: "Play Den playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  await expect(
    page.getByRole("button", { name: "Replay Den scene", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Replay Den scene", exact: true })
    .click();
  expect(Number(await slider.inputValue())).toBeLessThan(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(
    page.getByRole("button", { name: "Play Den playback", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Den encounters", exact: true })
    .getByRole("link", { name: /03.*Nalorakk/ })
    .click();
  await expect(page).toHaveURL(base + "/nalorakk");
  await expect(slider).toHaveValue("0");
});

test("all Den bosses have role advice, practice, consequences and readable mobile/desktop scenes", async ({
  page,
}) => {
  test.setTimeout(120000);
  const frames: Record<DenBossId, number[]> = {
    hoardmonger: [3, 9, 12, 20, 25],
    "sentinel-of-winter": [2, 6, 10, 14, 19, 27, 34, 39],
    nalorakk: [2, 8, 12.5, 19.5, 23],
  };
  for (const lesson of denLessons) {
    await page.goto(`${base}/${lesson.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Den of Nalorakk",
    );
    await expect(
      page.getByRole("heading", { level: 2, name: lesson.name, exact: true }),
    ).toBeVisible();
    const group = page.getByRole("group", {
      name: "Den learning role",
      exact: true,
    });
    for (const [label, role] of [
      ["Tank", "tank"],
      ["Healer", "healer"],
      ["DPS", "damage"],
    ] as const) {
      await group.getByRole("button", { name: label, exact: true }).click();
      await expect(
        page.getByLabel("Den next action", { exact: true }),
      ).toContainText(lesson.cues[0].role[role]);
    }
    for (const time of frames[lesson.id]) {
      await seek(page, time);
      for (const width of [393, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${lesson.id} ${time} ${width}`,
        ).toBe(true);
        await page.locator("[data-den-playback]").screenshot({
          path: test
            .info()
            .outputPath(`tactics-den-${lesson.id}-${time}-${width}.png`),
        });
      }
    }
    await page
      .getByRole("group", { name: "Den outcome comparison", exact: true })
      .getByRole("button", { name: "× Missed coverage", exact: true })
      .click();
    await expect(
      page.getByLabel("Den next action", { exact: true }),
    ).toContainText(/uncovered|empty|uncovered echo/i);
    await page.setViewportSize({ width: 393, height: 1000 });
    await page.locator("[data-den-playback]").screenshot({
      path: test.info().outputPath(`tactics-den-${lesson.id}-missed-393.png`),
    });
    const practice = page.getByRole("region", {
      name: "Den practice decision",
      exact: true,
    });
    const wrong = (lesson.practice.correct + 1) % 3;
    await practice.getByRole("button").nth(wrong).click();
    await expect(
      practice.getByRole("status", {
        name: "Den practice feedback",
        exact: true,
      }),
    ).toContainText("Try again.");
    await practice.getByRole("button").nth(lesson.practice.correct).click();
    await expect(
      practice.getByRole("status", {
        name: "Den practice feedback",
        exact: true,
      }),
    ).toContainText("Good call.");
    const reference = page.getByRole("region", {
      name: "Den beginner reference",
      exact: true,
    });
    for (const mechanic of lesson.mechanics) {
      const summary = reference
        .locator("summary")
        .filter({ hasText: mechanic.name });
      await summary.click();
      await expect(
        summary.locator("..").getByText(mechanic.action, { exact: true }),
      ).toBeVisible();
    }
    await page.setViewportSize({ width: 320, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
