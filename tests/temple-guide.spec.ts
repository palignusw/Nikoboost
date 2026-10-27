import { test, expect, type Page } from "@playwright/test";
import { templeLessons } from "../src/data/temple-guide";
import { distance, getTempleState } from "../src/data/temple-playback";
const base = "/tactics/temple-of-sethraliss";
async function seek(page: Page, time: number) {
  const range = page.getByRole("slider", { name: "Temple scene position" });
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
test("Temple model preserves shield swaps, beam interception and Avatar roles", () => {
  const shield = getTempleState("adderis-and-aspix", 0);
  expect(shield.shield).toBe(shield.secondBoss);
  const switched = getTempleState("adderis-and-aspix", 21);
  expect(switched.shield).toBe(switched.boss);
  expect(getTempleState("adderis-and-aspix", 13, true).failure).toBe(true);
  const knots = getTempleState("merektha", 3);
  expect(knots.actors.filter((a) => a.marked)).toHaveLength(2);
  expect(distance(knots.actors[2], knots.actors[3])).toBeLessThan(
    distance(
      getTempleState("merektha", 3, true).actors[2],
      getTempleState("merektha", 3, true).actors[3],
    ),
  );
  const hatch = getTempleState("merektha", 12);
  expect(hatch.bossHidden).toBe(true);
  expect(hatch.adds).toHaveLength(4);
  const spires = getTempleState("galvazzt", 8);
  expect(spires.spires).toHaveLength(3);
  expect(spires.beams).toHaveLength(3);
  for (const [i, b] of spires.beams.entries()) {
    expect(b.covered).toBe(true);
    expect(b.to).toEqual(
      expect.objectContaining({
        x: spires.actors[i + 2].x,
        y: spires.actors[i + 2].y,
      }),
    );
    expect(distance(b.to, spires.boss)).toBeGreaterThan(40);
  }
  const missed = getTempleState("galvazzt", 8, true);
  expect(missed.beams[0].covered).toBe(false);
  expect(missed.beams[0].to).toEqual(missed.boss);
  expect(missed.failure).toBe(true);
  expect(distance(getTempleState("avatar-of-sethraliss", 8).actors[0], getTempleState("avatar-of-sethraliss", 8).boss)).toBeGreaterThan(48);
  expect(getTempleState("avatar-of-sethraliss", 5).orbs).toHaveLength(3);
  expect(getTempleState("avatar-of-sethraliss", 8).orbs).toHaveLength(0);
  expect(getTempleState("avatar-of-sethraliss", 8, true).orbs).toHaveLength(1);
  expect(getTempleState("avatar-of-sethraliss", 12).heal).toBe(true);
  for (const b of templeLessons) {
    expect(b.cues[0].start).toBe(0);
    expect(b.cues.at(-1)!.end).toBe(b.duration);
    expect(b.choices[b.correct]).toBeTruthy();
    for (const c of b.cues)
      for (const role of ["tank", "healer", "damage"] as const)
        expect(c.role[role].length).toBeGreaterThan(10);
  }
});
test("Temple lessons support roles, chapters, practice and responsive layouts", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  for (const b of templeLessons) {
    await page.goto(`${base}/${b.id}`);
    await expect(
      page.getByRole("heading", { level: 2, name: b.name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tank", exact: true }).click();
    await expect(page.getByLabel("Temple next action")).toContainText(
      b.cues[0].role.tank,
    );
    await page
      .getByRole("combobox", { name: "Temple mechanic chapter" })
      .selectOption(b.cues[1].id);
    await expect(
      page.getByRole("slider", { name: "Temple scene position" }),
    ).toHaveValue("5");
    await page
      .getByRole("button", {
        name: `${String.fromCharCode(65 + b.correct)} · ${b.choices[b.correct]}`,
      })
      .click();
    await expect(page.getByLabel("Temple practice feedback")).toContainText(
      "Good call",
    );
    for (const width of [320, 393, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${b.id} ${width}`,
      ).toBe(true);
      if (width !== 320) {
        await seek(page, b.failureTime);
        await page
          .locator("[data-temple-playback]")
          .screenshot({
            path: test
              .info()
              .outputPath(`tactics-temple-${b.id}-correct-${width}.png`),
          });
      }
    }
    await page.setViewportSize({ width: 393, height: 1000 });
    await page.getByRole("button", { name: "× Common mistake" }).click();
    await expect(page.locator("[data-temple-playback]")).toContainText(
      b.mistake,
    );
    await page
      .locator("[data-temple-playback]")
      .screenshot({
        path: test.info().outputPath(`tactics-temple-${b.id}-missed-393.png`),
      });
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const b of templeLessons) expect(xml).toContain(`${base}/${b.id}`);
});
test("Temple playback supports play, pause, speed, seeking and reset", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${base}/galvazzt`);
  const range = page.getByRole("slider", { name: "Temple scene position" });
  await page.getByRole("button", { name: "Play Temple playback" }).click();
  await page.clock.fastForward(3000);
  expect(Number(await range.inputValue())).toBeGreaterThan(2.5);
  await page.getByRole("button", { name: "Pause Temple playback" }).click();
  const t = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(t);
  await page
    .getByRole("combobox", { name: "Temple playback speed" })
    .selectOption("0.5");
  await seek(page, 8);
  await page.getByRole("button", { name: "Reset Temple playback" }).click();
  await expect(range).toHaveValue("0");
});
