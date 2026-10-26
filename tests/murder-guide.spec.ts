import { test, expect, type Page } from "@playwright/test";
import { murderLessons } from "../src/data/murder-guide";
import {
  getMurderState,
  coverPositions,
  isCovered,
} from "../src/data/murder-playback";
const base = "/tactics/murder-row";
async function seek(page: Page, time: number) {
  const range = page.getByRole("slider", {
    name: "Murder scene position",
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
test("Murder model preserves cover, marks, add control and gateway geometry", () => {
  expect(getMurderState("kystia-manaheart", 14).clones).toHaveLength(5);
  expect(getMurderState("kystia-manaheart", 16.5).clones).toHaveLength(0);
  expect(getMurderState("kystia-manaheart", 16.5, true).failure).toBe(true);
  expect(getMurderState("kystia-manaheart", 18).remaining).toBe(20);
  expect(getMurderState("kystia-manaheart", 37.9).remaining).toBeCloseTo(0.1);
  const covered = getMurderState("zaen-bladesorrow", 13.5);
  expect(covered.actors.every((a, i) => isCovered(a, coverPositions[i]))).toBe(
    true,
  );
  const exposed = getMurderState("zaen-bladesorrow", 13.5, true);
  expect(isCovered(exposed.actors[2], coverPositions[2])).toBe(false);
  expect(getMurderState("zaen-bladesorrow", 14.5, true).actors[2].hurt).toBe(
    true,
  );
  expect(getMurderState("zaen-bladesorrow", 11).freight).toBe("gone");
  expect(getMurderState("xathuux", 4).remaining).toBe(5);
  expect(
    getMurderState("xathuux", 8.9).actors.filter((a) => a.marked),
  ).toHaveLength(1);
  const axe = getMurderState("xathuux", 9);
  expect(axe.axe).not.toBeNull();
  expect(
    Math.hypot(axe.axe!.x - axe.boss.x, axe.axe!.y - axe.boss.y),
  ).toBeLessThan(100);
  expect(getMurderState("xathuux", 12.5).axe).toBeNull();
  expect(getMurderState("xathuux", 12.5, true).axe).not.toBeNull();
  const fingers = getMurderState("lithiel-cinderfury", 7);
  expect(fingers.actors.filter((a) => a.marked)).toHaveLength(4);
  expect(fingers.actors[0].marked).toBe(false);
  const w = getMurderState("lithiel-cinderfury", 19);
  expect(w.gateTravel).toBe(true);
  expect(w.adds).toBe("cleared");
  expect(w.infernal).not.toBeNull();
  expect(
    w.actors.every(
      (a) =>
        Math.hypot(a.x - w.ring!.center.x, a.y - w.ring!.center.y) <
        w.ring!.radius - 10,
    ),
  ).toBe(true);
  expect(getMurderState("lithiel-cinderfury", 19, true).actors[2].hurt).toBe(
    true,
  );
  for (const b of murderLessons)
    for (const miss of [false, true])
      for (let t = 0; t <= b.duration; t += 0.25) {
        const state = getMurderState(b.id, t, miss);
        expect(state.actors).toHaveLength(5);
        expect(
          state.actors.every(
            (a) =>
              Number.isFinite(a.x) &&
              a.x >= 32 &&
              a.x <= 568 &&
              a.y >= 32 &&
              a.y <= 390,
          ),
        ).toBe(true);
        if (state.remaining !== null)
          expect(state.remaining).toBeGreaterThanOrEqual(0);
      }
});
test("Murder playback supports pause, speed, chapter jumps, replay and navigation", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(base + "/xathuux");
  const range = page.getByRole("slider", {
    name: "Murder scene position",
    exact: true,
  });
  await page
    .getByRole("button", { name: "Play Murder playback", exact: true })
    .click();
  await page.clock.fastForward(6500);
  expect(Number(await range.inputValue())).toBeGreaterThan(6);
  expect(
    Number(
      await page.locator('[data-murder-player="P3"]').getAttribute("data-x"),
    ),
  ).toBeGreaterThan(350);
  await page
    .getByRole("button", { name: "Pause Murder playback", exact: true })
    .click();
  const paused = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(paused);
  await page
    .getByRole("combobox", { name: "Murder mechanic chapter", exact: true })
    .selectOption("axe");
  await expect(range).toHaveValue("4");
  await expect(page.locator("[data-murder-playback]")).toContainText("5.0s");
  await page
    .getByRole("combobox", { name: "Murder playback speed", exact: true })
    .selectOption("0.5");
  await page
    .getByRole("button", { name: "Play Murder playback", exact: true })
    .click();
  await page.clock.fastForward(1000);
  expect(Number(await range.inputValue())).toBeGreaterThan(4.35);
  expect(Number(await range.inputValue())).toBeLessThan(4.65);
  await page
    .getByRole("button", { name: "Reset Murder playback", exact: true })
    .click();
  await expect(range).toHaveValue("0");
  await seek(page, 26);
  await page
    .getByRole("button", { name: "Replay Murder scene", exact: true })
    .click();
  await page.clock.fastForward(500);
  expect(Number(await range.inputValue())).toBeLessThan(1);
  await page
    .getByRole("navigation", { name: "Murder Row encounters", exact: true })
    .getByRole("link", { name: /Zaen Bladesorrow/ })
    .click();
  await expect(range).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "Play Murder playback", exact: true }),
  ).toBeVisible();
});
test("Murder routes, outcomes, role advice and practice fit mobile and desktop", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const frames: Record<string, number[]> = {
    "kystia-manaheart": [7, 12, 15, 25],
    "zaen-bladesorrow": [3, 13.5, 15.5],
    xathuux: [7, 10, 22],
    "lithiel-cinderfury": [7, 10, 15, 19],
  };
  for (const b of murderLessons) {
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
      new RegExp(`/tactics/murder-row/${b.id}$`),
    );
    for (const r of ["Tank", "Healer", "DPS"]) {
      await page
        .getByRole("group", { name: "Murder learning role", exact: true })
        .getByRole("button", { name: r, exact: true })
        .click();
      await expect(
        page.getByLabel("Murder next action", { exact: true }),
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
        await page
          .locator("[data-murder-playback]")
          .screenshot({
            path: test
              .info()
              .outputPath(`tactics-murder-${b.id}-${t}-${width}.png`),
          });
      }
    }
    await page
      .getByRole("button", { name: "× Common mistake", exact: true })
      .click();
    await expect(page.locator("[data-murder-playback]")).toContainText(
      b.mistake,
    );
    await page.setViewportSize({ width: 393, height: 1000 });
    await page
      .locator("[data-murder-playback]")
      .screenshot({
        path: test.info().outputPath(`tactics-murder-${b.id}-missed-393.png`),
      });
    await page
      .getByRole("button", { name: "✓ Correct response", exact: true })
      .click();
    const practice = page.getByRole("region", {
      name: "Murder practice decision",
      exact: true,
    });
    await practice
      .getByRole("button")
      .nth((b.correct + 1) % 3)
      .click();
    await expect(
      page.getByRole("status", {
        name: "Murder practice feedback",
        exact: true,
      }),
    ).toContainText("Try again");
    await practice.getByRole("button").nth(b.correct).click();
    await expect(
      page.getByRole("status", {
        name: "Murder practice feedback",
        exact: true,
      }),
    ).toContainText("Good call");
    await page
      .getByText("Sources, review & scene limits", { exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: /Blizzard · cover hotfix/ }),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const b of murderLessons) expect(xml).toContain(`${base}/${b.id}`);
});
