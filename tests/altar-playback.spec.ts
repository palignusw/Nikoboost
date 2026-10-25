import { test, expect, type Page } from "@playwright/test";
import { altarPlayback, getPlaybackState } from "../src/data/altar-playback";
import type { AltarBossId } from "../src/data/altar-study";
const base = "/tactics/altar-of-fangs";
async function seek(page: Page, value: number) {
  await page
    .getByRole("slider", { name: "Scene position", exact: true })
    .evaluate((el, value) => {
      const input = el as HTMLInputElement;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, String(value));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  await expect(
    page.getByRole("slider", { name: "Scene position", exact: true }),
  ).toHaveValue(String(value));
}

test("timeline contracts preserve sourced windows, conditional endings and coherent actor states", () => {
  const ritual = getPlaybackState("zuljan", 0);
  expect(ritual.remaining).toBe(5);
  expect(getPlaybackState("zuljan", 4.9).remaining).toBeCloseTo(0.1);
  expect(getPlaybackState("zuljan", 5).current.kind).toBe("channel");
  expect(getPlaybackState("zuljan", 5).remaining).toBe(8);
  expect(getPlaybackState("zuljan", 13).remaining).toBeNull();
  expect(
    getPlaybackState("zuljan", 17)
      .actors.filter((a) => a.marked)
      .map((a) => a.id),
  ).toEqual(["P5"]);
  expect(getPlaybackState("zuljan", 22).pools).toHaveLength(4);
  expect(getPlaybackState("zuljan", 21.3).pools).toHaveLength(0);
  expect(getPlaybackState("zuljan", 21.3).projectile).not.toBeNull();
  expect(getPlaybackState("zuljan", 21.3).actors[4].marked).toBe(true);
  expect(getPlaybackState("zuljan", 28).actors[4].status).toContain(
    "Verify venom",
  );
  expect(getPlaybackState("ravi", 8).remaining).toBeNull();
  expect(
    getPlaybackState("ravi", 13).soaks.filter((s) => s.covered).length,
  ).toBeLessThan(3);
  expect(getPlaybackState("ravi", 17).soaks.every((s) => s.covered)).toBe(true);
  expect(getPlaybackState("ravi", 21).shield).toBeNull();
  const almost = getPlaybackState("writhing-coil", 17.9);
  expect(almost.tethers.some((t) => !t.broken)).toBe(true);
  expect(almost.adds).toHaveLength(0);
  expect(getPlaybackState("writhing-coil", 18).adds).toHaveLength(5);
  expect(getPlaybackState("writhing-coil", 3).interruptPlayer?.id).toBe("P3");
  expect(getPlaybackState("writhing-coil", 3).current.title).toContain(
    "Interrupted",
  );
  expect(getPlaybackState("writhing-coil", 2).remaining).toBe(2);
  for (const boss of Object.keys(altarPlayback) as AltarBossId[]) {
    for (let t = 0; t <= altarPlayback[boss].duration; t += 0.1) {
      const state = getPlaybackState(boss, t);
      expect(state.actors).toHaveLength(5);
      expect(
        state.actors.every(
          (a) => a.x >= 20 && a.x <= 580 && a.y >= 20 && a.y <= 400,
        ),
      ).toBe(true);
      if (state.remaining !== null)
        expect(state.remaining).toBeGreaterThanOrEqual(0);
    }
  }
});

test("playback moves actors, pauses, changes speed, completes and replays", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(`${base}/zuljan`);
  const slider = page.getByRole("slider", {
    name: "Scene position",
    exact: true,
  });
  await expect(
    page.getByRole("tab", { name: /Encounter playback/ }),
  ).toHaveAttribute("aria-selected", "true");
  const before = Number(
    await page.locator('[data-player="P2"]').getAttribute("data-x"),
  );
  await page
    .getByRole("button", { name: "Play encounter playback", exact: true })
    .click();
  await page.clock.fastForward(2500);
  expect(Number(await slider.inputValue())).toBeGreaterThan(2);
  expect(
    Number(await page.locator('[data-player="P2"]').getAttribute("data-x")),
  ).toBeLessThan(before);
  await page
    .getByRole("button", { name: "Pause encounter playback", exact: true })
    .click();
  const paused = await slider.inputValue();
  await page.clock.fastForward(1500);
  await expect(slider).toHaveValue(paused);
  await page
    .getByRole("combobox", { name: "Playback speed", exact: true })
    .selectOption("0.5");
  await page
    .getByRole("button", { name: "Play encounter playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  const delta = Number(await slider.inputValue()) - Number(paused);
  expect(delta).toBeGreaterThan(0.35);
  expect(delta).toBeLessThan(0.65);
  await seek(page, 27.8);
  await page
    .getByRole("button", { name: "Play encounter playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  await expect(
    page.getByRole("button", { name: "Replay encounter", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Replay encounter", exact: true })
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
    page.getByRole("button", { name: "Play encounter playback", exact: true }),
  ).toBeVisible();
});

test("scrubbing and chapter jumps keep markers, mechanics and responsive playback in sync", async ({
  page,
}) => {
  test.setTimeout(120000);
  const cases: Record<AltarBossId, number[]> = {
    ravi: [8, 13, 17],
    "writhing-coil": [1, 17.5, 26, 31],
    zuljan: [2.5, 9, 17.5, 22],
  };
  for (const boss of Object.keys(cases) as AltarBossId[]) {
    await page.goto(`${base}/${boss}`);
    for (const time of cases[boss]) {
      await seek(page, time);
      await expect(
        page.getByRole("status", { name: "Playback event", exact: true }),
      ).toContainText(getPlaybackState(boss, time).current.title);
      for (const width of [393, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page
          .getByRole("region", { name: "Encounter playback", exact: true })
          .screenshot({
            path: test
              .info()
              .outputPath(`tactics-live-${boss}-${time}-${width}.png`),
          });
      }
    }
    await page
      .getByRole("button", { name: "Reset encounter playback", exact: true })
      .click();
    await expect(
      page.getByRole("slider", { name: "Scene position", exact: true }),
    ).toHaveValue("0");
    const tabs = page.getByRole("tablist", {
      name: "Lesson view",
      exact: true,
    });
    await tabs.getByRole("tab", { name: /Encounter playback/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      tabs.getByRole("tab", { name: "Study steps", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(
      tabs.getByRole("tab", { name: /Encounter playback/ }),
    ).toHaveAttribute("aria-selected", "true");
    await page
      .getByRole("navigation", { name: "Playback chapters", exact: true })
      .getByRole("button")
      .last()
      .click();
    expect(
      Number(
        await page
          .getByRole("slider", { name: "Scene position", exact: true })
          .inputValue(),
      ),
    ).toBeGreaterThan(0);
  }
  await page.setViewportSize({ width: 320, height: 1000 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
