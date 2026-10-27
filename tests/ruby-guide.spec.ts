import { test, expect, type Page } from "@playwright/test";
import { rubyLessons } from "../src/data/ruby-guide";
import { distance, getRubyState } from "../src/data/ruby-playback";
const base = "/tactics/ruby-life-pools";
async function seek(page: Page, time: number) {
  const range = page.getByRole("slider", { name: "Ruby scene position" });
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
test("Ruby model preserves storm separation, add placement and breath avoidance", () => {
  const good = getRubyState("melidrussa-chillworn", 8);
  expect(good.storm).not.toBeNull();
  for (const actor of good.actors) expect(distance(actor, good.storm!)).toBeGreaterThan(86);
  expect(getRubyState("melidrussa-chillworn", 8, true).failure).toBe(true);
  expect(getRubyState("melidrussa-chillworn", 12).shield).toBe(true);
  const ritual = getRubyState("kokia-blazehoof", 3.5);
  expect(distance(ritual.actors[1], ritual.zone!)).toBeGreaterThan(66);
  expect(getRubyState("kokia-blazehoof", 3.5, true).actors[1].hurt).toBe(true);
  expect(getRubyState("kokia-blazehoof", 7).adds).toHaveLength(1);
  expect(getRubyState("kokia-blazehoof", 12).projectile).not.toBeNull();
  const wind = getRubyState("kyrakka-and-erkhart", 8);
  expect(wind.wind).toBe(true);
  expect(wind.pools[0].x).toBeLessThan(480);
  const breath = getRubyState("kyrakka-and-erkhart", 13);
  for (const actor of breath.actors) {
    if (actor.y >= 100 && actor.y <= 325) {
      const halfWidth = (actor.y - 100) * 0.4;
      expect(actor.x < 430 - halfWidth - 16 || actor.x > 430 + halfWidth + 16).toBe(true);
    }
  }
  expect(getRubyState("kyrakka-and-erkhart", 13, true).actors[2].hurt).toBe(
    true,
  );
  for (const b of rubyLessons) {
    expect(b.cues[0].start).toBe(0);
    expect(b.cues.at(-1)!.end).toBe(b.duration);
    expect(b.choices[b.correct]).toBeTruthy();
    for (const c of b.cues)
      for (const role of ["tank", "healer", "damage"] as const)
        expect(c.role[role].length).toBeGreaterThan(10);
  }
});
test("Ruby lessons support roles, chapters, practice and responsive layouts", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  for (const b of rubyLessons) {
    await page.goto(`${base}/${b.id}`);
    await expect(
      page.getByRole("heading", { level: 2, name: b.name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tank", exact: true }).click();
    await expect(page.getByLabel("Ruby next action")).toContainText(
      b.cues[0].role.tank,
    );
    await page
      .getByRole("combobox", { name: "Ruby mechanic chapter" })
      .selectOption(b.cues[1].id);
    await expect(
      page.getByRole("slider", { name: "Ruby scene position" }),
    ).toHaveValue("5");
    await page
      .getByRole("button", {
        name: `${String.fromCharCode(65 + b.correct)} · ${b.choices[b.correct]}`,
      })
      .click();
    await expect(page.getByLabel("Ruby practice feedback")).toContainText(
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
          .locator("[data-ruby-playback]")
          .screenshot({
            path: test
              .info()
              .outputPath(`tactics-ruby-${b.id}-correct-${width}.png`),
          });
      }
    }
    await page.setViewportSize({ width: 393, height: 1000 });
    await page.getByRole("button", { name: "× Common mistake" }).click();
    await expect(page.locator("[data-ruby-playback]")).toContainText(b.mistake);
    await page
      .locator("[data-ruby-playback]")
      .screenshot({
        path: test.info().outputPath(`tactics-ruby-${b.id}-missed-393.png`),
      });
  }
  await page.goto(base);
  for (const width of [393, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath(`tactics-ruby-full-${width}.png`),
      fullPage: true,
    });
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const b of rubyLessons) expect(xml).toContain(`${base}/${b.id}`);
});
test("Ruby playback supports play, pause, speed, seeking and reset", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${base}/kokia-blazehoof`);
  const range = page.getByRole("slider", { name: "Ruby scene position" });
  await page.getByRole("button", { name: "Play Ruby playback" }).click();
  await page.clock.fastForward(3000);
  expect(Number(await range.inputValue())).toBeGreaterThan(2.5);
  await page.getByRole("button", { name: "Pause Ruby playback" }).click();
  const t = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(t);
  await page
    .getByRole("combobox", { name: "Ruby playback speed" })
    .selectOption("0.5");
  await seek(page, 8);
  await page.getByRole("button", { name: "Reset Ruby playback" }).click();
  await expect(range).toHaveValue("0");
});
