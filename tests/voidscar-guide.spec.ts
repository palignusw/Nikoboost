import { test, expect, type Page } from "@playwright/test";
import { voidscarLessons } from "../src/data/voidscar-guide";
import {
  getVoidscarState,
  dashRows,
  stars,
  poisonPools,
  distance,
} from "../src/data/voidscar-playback";
const base = "/tactics/voidscar-arena";
async function seek(page: Page, time: number) {
  const range = page.getByRole("slider", {
    name: "Voidscar scene position",
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
test("Voidscar model preserves separated dash lanes, tank kite and safe orb interception", () => {
  const dash = getVoidscarState("tazrah", 2);
  expect(dash.lanes).toHaveLength(5);
  expect(dash.actors.map((a) => a.y)).toEqual(dashRows);
  expect(dash.actors.every((a) => a.marked)).toBe(true);
  for (const [i, lane] of dash.lanes.entries()) {
    expect(lane.from.y).toBe(lane.to.y);
    for (const [j, a] of dash.actors.entries())
      if (i !== j) expect(Math.abs(a.y - lane.to.y)).toBeGreaterThan(36);
  }
  expect(
    getVoidscarState("tazrah", 6.5, true)
      .actors.filter((a) => a.hurt)
      .map((a) => a.id),
  ).toEqual(["P2", "P3"]);
  const bloom = getVoidscarState("tazrah", 12);
  expect(bloom.pools).toHaveLength(5);
  for (let t = 12; t < 18; t += 0.25) {
    const w = getVoidscarState("tazrah", t);
    for (const a of w.actors)
      for (const p of w.projectiles) expect(distance(a, p)).toBeGreaterThan(25);
  }
  expect(getVoidscarState("atroxus", 8).remaining).toBe(3);
  expect(getVoidscarState("atroxus", 10.9).creeper).toBeNull();
  expect(getVoidscarState("atroxus", 11).creeper).not.toBeNull();
  for (let t = 11; t < 19; t += 0.25) {
    const w = getVoidscarState("atroxus", t);
    expect(distance(w.actors[0], w.creeper!)).toBeGreaterThan(36);
    for (const a of w.actors)
      for (const p of poisonPools) expect(distance(a, p)).toBeGreaterThan(41);
  }
  expect(getVoidscarState("atroxus", 16, true).actors[0].hurt).toBe(true);
  expect(getVoidscarState("atroxus", 19).creeper).toBeNull();
  for (let t = 4; t < 8.8; t += 0.1) {
    const w = getVoidscarState("charonus", t);
    expect(w.orb).not.toBeNull();
    for (const s of stars) expect(distance(w.actors[2], s)).toBeGreaterThan(46);
  }
  const pre = getVoidscarState("charonus", 8.5);
  expect(distance(pre.orb!, stars[0])).toBeGreaterThan(40);
  const cleared = getVoidscarState("charonus", 9);
  expect(cleared.orb).toBeNull();
  expect(cleared.singularities).toHaveLength(2);
  const struck = getVoidscarState("charonus", 8.2, true);
  expect(struck.actors[2].disabled).toBe(true);
  expect(struck.failure).toBe(true);
  const moving = getVoidscarState("charonus", 8.7, true);
  expect(distance(struck.actors[2], moving.actors[2])).toBeGreaterThan(1);
  expect(getVoidscarState("charonus", 22.6, true).actors[2].disabled).toBe(
    false,
  );
  expect(getVoidscarState("charonus", 15).impacts).toHaveLength(5);
  for (const b of voidscarLessons)
    for (const miss of [false, true])
      for (let t = 0; t <= b.duration; t += 0.25) {
        const w = getVoidscarState(b.id, t, miss);
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
test("Voidscar playback supports pause, speed, chapters and boss reset", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(base + "/atroxus");
  const range = page.getByRole("slider", {
    name: "Voidscar scene position",
    exact: true,
  });
  await page
    .getByRole("combobox", { name: "Voidscar mechanic chapter", exact: true })
    .selectOption("roar");
  await expect(range).toHaveValue("8");
  await expect(page.locator("[data-voidscar-playback]")).toContainText("3.0s");
  await page
    .getByRole("button", { name: "Play Voidscar playback", exact: true })
    .click();
  await page.clock.fastForward(6000);
  expect(Number(await range.inputValue())).toBeGreaterThan(13.5);
  expect(
    Number(
      await page.locator('[data-voidscar-player="P1"]').getAttribute("data-x"),
    ),
  ).toBeLessThan(280);
  await page
    .getByRole("button", { name: "Pause Voidscar playback", exact: true })
    .click();
  const paused = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(paused);
  await page
    .getByRole("combobox", { name: "Voidscar playback speed", exact: true })
    .selectOption("0.5");
  await page
    .getByRole("button", { name: "Play Voidscar playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  expect(Number(await range.inputValue()) - Number(paused)).toBeGreaterThan(
    0.35,
  );
  expect(Number(await range.inputValue()) - Number(paused)).toBeLessThan(0.65);
  await page
    .getByRole("button", { name: "Reset Voidscar playback", exact: true })
    .click();
  await expect(range).toHaveValue("0");
  await seek(page, 24);
  await page
    .getByRole("button", { name: "Replay Voidscar scene", exact: true })
    .click();
  await page.clock.fastForward(500);
  expect(Number(await range.inputValue())).toBeLessThan(1);
  await page
    .getByRole("navigation", { name: "Voidscar Arena encounters", exact: true })
    .getByRole("link", { name: /Charonus/ })
    .click();
  await expect(range).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "Play Voidscar playback", exact: true }),
  ).toBeVisible();
});
test("Voidscar routes, outcomes, role advice and practice fit mobile and desktop", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const frames: Record<string, number[]> = {
    tazrah: [2, 6, 14],
    atroxus: [2, 9, 16],
    charonus: [3, 7, 15],
  };
  for (const b of voidscarLessons) {
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
      new RegExp(`/tactics/voidscar-arena/${b.id}$`),
    );
    for (const r of ["Tank", "Healer", "DPS"]) {
      await page
        .getByRole("group", { name: "Voidscar learning role", exact: true })
        .getByRole("button", { name: r, exact: true })
        .click();
      await expect(
        page.getByLabel("Voidscar next action", { exact: true }),
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
        await page.locator("[data-voidscar-playback]").screenshot({
          path: test
            .info()
            .outputPath(`tactics-voidscar-${b.id}-${t}-${width}.png`),
        });
      }
    }
    await page
      .getByRole("button", { name: "× Common mistake", exact: true })
      .click();
    await expect(page.locator("[data-voidscar-playback]")).toContainText(
      b.mistake,
    );
    await page.setViewportSize({ width: 393, height: 1000 });
    await page.locator("[data-voidscar-playback]").screenshot({
      path: test.info().outputPath(`tactics-voidscar-${b.id}-missed-393.png`),
    });
    await page
      .getByRole("button", { name: "✓ Correct response", exact: true })
      .click();
    const practice = page.getByRole("region", {
      name: "Voidscar practice decision",
      exact: true,
    });
    await practice
      .getByRole("button")
      .nth((b.correct + 1) % 3)
      .click();
    await expect(
      page.getByRole("status", {
        name: "Voidscar practice feedback",
        exact: true,
      }),
    ).toContainText("Try again");
    await practice.getByRole("button").nth(b.correct).click();
    await expect(
      page.getByRole("status", {
        name: "Voidscar practice feedback",
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
  for (const b of voidscarLessons) expect(xml).toContain(`${base}/${b.id}`);
});
