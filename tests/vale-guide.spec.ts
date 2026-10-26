import { test, expect, type Page } from "@playwright/test";
import { valeLessons } from "../src/data/vale-guide";
import {
  getValeState,
  loamPositions,
  dormantPositions,
  insideCone,
} from "../src/data/vale-playback";
const base = "/tactics/the-blinding-vale";
async function seek(page: Page, time: number) {
  const range = page.getByRole("slider", {
    name: "Vale scene position",
    exact: true,
  });
  await range.evaluate((el, v) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, time);
  await expect(range).toHaveValue(String(time));
}
test("Vale model preserves flower coverage, delayed roots, tracking cones and body clearance", () => {
  const soaked = getValeState("lightblossom-trinity", 9);
  expect(soaked.remaining).toBe(7);
  expect(soaked.flowers).toHaveLength(3);
  expect(soaked.flowers.every((f) => f.covered)).toBe(true);
  expect(
    getValeState("lightblossom-trinity", 11, true).flowers.filter(
      (f) => f.covered,
    ),
  ).toHaveLength(2);
  expect(
    getValeState("lightblossom-trinity", 16).flowers.every(
      (f) => f.state === "scorched",
    ),
  ).toBe(true);
  expect(
    getValeState("lightblossom-trinity", 19).actors.every((a) =>
      loamPositions.every((p) => Math.hypot(a.x - p.x, a.y - p.y) > 50),
    ),
  ).toBe(true);
  expect(getValeState("ikuzz", 4).remaining).toBe(4);
  const rooted = getValeState("ikuzz", 8);
  expect(rooted.actors.every((a) => a.rooted)).toBe(true);
  expect(rooted.actors.map((a) => [a.x, a.y])).toEqual(
    getValeState("ikuzz", 9).actors.map((a) => [a.x, a.y]),
  );
  expect(getValeState("ikuzz", 11).actors.every((a) => !a.rooted)).toBe(true);
  expect(getValeState("ikuzz", 9.5, true).actors[2].rooted).toBe(true);
  expect(getValeState("ikuzz", 12).remaining).toBe(10);
  expect(
    getValeState("ikuzz", 21).roots.filter((r) => r.y === 250),
  ).toHaveLength(0);
  for (let t = 12; t < 22; t += 0.25) {
    const w = getValeState("ikuzz", t);
    expect(
      Math.hypot(w.actors[2].x - w.boss.x, w.actors[2].y - w.boss.y),
    ).toBeGreaterThan(100);
    expect(
      w.roots.every(
        (r) => Math.hypot(w.actors[2].x - r.x, w.actors[2].y - r.y) > 36,
      ),
    ).toBe(true);
  }
  expect(getValeState("lightwarden-ruia", 4).remaining).toBe(6);
  expect(
    getValeState("lightwarden-ruia", 7).actors.filter((a) => a.marked),
  ).toHaveLength(3);
  expect(
    getValeState("lightwarden-ruia", 13.5).actors.every((a) => a.health! < 100),
  ).toBe(true);
  expect(
    getValeState("lightwarden-ruia", 15.9).actors.every(
      (a) => a.health === 100 && !a.hurt,
    ),
  ).toBe(true);
  const strikes = getValeState("lightwarden-ruia", 20);
  expect(strikes.cones).toHaveLength(3);
  expect(strikes.actors.slice(2).map((a) => [a.x, a.y])).toEqual(
    getValeState("lightwarden-ruia", 24)
      .actors.slice(2)
      .map((a) => [a.x, a.y]),
  );
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      expect(
        insideCone(strikes.actors[i + 2], strikes.boss, strikes.cones[j]),
      ).toBe(i === j);
  const overlap = getValeState("lightwarden-ruia", 21, true);
  expect(insideCone(overlap.actors[3], overlap.boss, overlap.cones[0])).toBe(
    true,
  );
  expect(overlap.failure).toBe(true);
  const aim = getValeState("ziekket", 7);
  expect(aim.remaining).toBe(3);
  expect(aim.adds).toBe("dormant");
  for (const p of dormantPositions)
    expect(
      (p.x - aim.boss.x) * (aim.beamTarget!.y - aim.boss.y) -
        (p.y - aim.boss.y) * (aim.beamTarget!.x - aim.boss.x),
    ).toBeCloseTo(0);
  expect(getValeState("ziekket", 11).adds).toBe("cleared");
  expect(getValeState("ziekket", 11, true).adds).toBe("dormant");
  expect(getValeState("ziekket", 20, true).adds).toBe("regrown");
  const orbs = getValeState("ziekket", 16);
  expect(orbs.orbs).toHaveLength(0);
  expect(orbs.actors.filter((a) => a.stacks === 1)).toHaveLength(3);
  for (const a of orbs.actors)
    expect(orbs.pools.every((p) => Math.hypot(a.x - p.x, a.y - p.y) > 46)).toBe(
      true,
    );
  for (const b of valeLessons)
    for (const miss of [false, true])
      for (let t = 0; t <= b.duration; t += 0.25) {
        const w = getValeState(b.id, t, miss);
        expect(w.actors).toHaveLength(5);
        expect(
          w.actors.every(
            (a) =>
              Number.isFinite(a.x) &&
              a.x >= 32 &&
              a.x <= 568 &&
              a.y >= 32 &&
              a.y <= 390,
          ),
        ).toBe(true);
        if (w.remaining !== null) expect(w.remaining).toBeGreaterThanOrEqual(0);
      }
});
test("Vale playback supports pause, speed, chapter jumps and boss reset", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(base + "/lightblossom-trinity");
  const range = page.getByRole("slider", {
    name: "Vale scene position",
    exact: true,
  });
  await page
    .getByRole("combobox", { name: "Vale mechanic chapter", exact: true })
    .selectOption("soak");
  await expect(range).toHaveValue("8");
  await expect(page.locator("[data-vale-playback]")).toContainText("8.0s");
  await page
    .getByRole("button", { name: "Play Vale playback", exact: true })
    .click();
  await page.clock.fastForward(2000);
  expect(Number(await range.inputValue())).toBeGreaterThan(9.5);
  expect(
    Number(
      await page.locator('[data-vale-player="P1"]').getAttribute("data-x"),
    ),
  ).toBe(180);
  await page
    .getByRole("button", { name: "Pause Vale playback", exact: true })
    .click();
  const paused = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(paused);
  await page
    .getByRole("combobox", { name: "Vale playback speed", exact: true })
    .selectOption("0.5");
  await page
    .getByRole("button", { name: "Play Vale playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  expect(Number(await range.inputValue()) - Number(paused)).toBeGreaterThan(
    0.35,
  );
  expect(Number(await range.inputValue()) - Number(paused)).toBeLessThan(0.65);
  await page
    .getByRole("button", { name: "Reset Vale playback", exact: true })
    .click();
  await expect(range).toHaveValue("0");
  await seek(page, 22);
  await page
    .getByRole("button", { name: "Replay Vale scene", exact: true })
    .click();
  await page.clock.fastForward(500);
  expect(Number(await range.inputValue())).toBeLessThan(1);
  await page
    .getByRole("navigation", {
      name: "The Blinding Vale encounters",
      exact: true,
    })
    .getByRole("link", { name: /Ikuzz/ })
    .click();
  await expect(range).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "Play Vale playback", exact: true }),
  ).toBeVisible();
});
test("Vale routes, outcomes, role advice and practice fit mobile and desktop", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const frames: Record<string, number[]> = {
    "lightblossom-trinity": [6, 11, 18],
    ikuzz: [4.5, 9, 17],
    "lightwarden-ruia": [7, 14.5, 21],
    ziekket: [7, 11, 16.5],
  };
  for (const b of valeLessons) {
    await page.goto(`${base}/${b.id}`);
    await expect(
      page.getByRole("heading", { level: 2, name: b.name, exact: true }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /^index, follow$/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/tactics/the-blinding-vale/${b.id}$`),
    );
    for (const r of ["Tank", "Healer", "DPS"]) {
      await page
        .getByRole("group", { name: "Vale learning role", exact: true })
        .getByRole("button", { name: r, exact: true })
        .click();
      await expect(
        page.getByLabel("Vale next action", { exact: true }),
      ).toContainText(r.toUpperCase());
    }
    for (const width of [393, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const t of frames[b.id]) {
        await seek(page, t);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.locator("[data-vale-playback]").screenshot({
          path: test
            .info()
            .outputPath(`tactics-vale-${b.id}-${t}-${width}.png`),
        });
      }
    }
    await page
      .getByRole("button", { name: "× Common mistake", exact: true })
      .click();
    await expect(page.locator("[data-vale-playback]")).toContainText(b.mistake);
    await page.setViewportSize({ width: 393, height: 1000 });
    await page.locator("[data-vale-playback]").screenshot({
      path: test.info().outputPath(`tactics-vale-${b.id}-missed-393.png`),
    });
    await page
      .getByRole("button", { name: "✓ Correct response", exact: true })
      .click();
    const practice = page.getByRole("region", {
      name: "Vale practice decision",
      exact: true,
    });
    await practice
      .getByRole("button")
      .nth((b.correct + 1) % 3)
      .click();
    await expect(
      page.getByRole("status", {
        name: "Vale practice feedback",
        exact: true,
      }),
    ).toContainText("Try again");
    await practice.getByRole("button").nth(b.correct).click();
    await expect(
      page.getByRole("status", {
        name: "Vale practice feedback",
        exact: true,
      }),
    ).toContainText("Good call");
    await page
      .getByText("Sources, review & scene limits", { exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: /Blizzard · October hotfixes/ }),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const b of valeLessons) expect(xml).toContain(`${base}/${b.id}`);
});
