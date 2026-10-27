import { test, expect } from "@playwright/test";
import { kingsLessons } from "../src/data/kings-guide";
import { getKingsState } from "../src/data/kings-playback";
const base = "/tactics/kings-rest";
test("Kings model depicts the intended response and failure", () => {
  expect(getKingsState("golden-serpent", 7).adds).toHaveLength(1);
  expect(getKingsState("golden-serpent", 9.5).adds).toHaveLength(0);
  expect(getKingsState("golden-serpent", 8, true).failure).toBe(true);
  const coffin = getKingsState("mchimba", 8);
  expect(coffin.coffins).toHaveLength(4);
  expect(coffin.activeCoffin).toBe(1);
  expect(coffin.actors[2].disabled).toBe(true);
  expect(getKingsState("mchimba", 8, true).failure).toBe(true);
  expect(getKingsState("council-of-tribes", 3.5, true).actors[2].hurt).toBe(
    true,
  );
  expect(
    getKingsState("dazar", 8, true).actors.filter((a) => a.hurt),
  ).toHaveLength(2);
  expect(getKingsState("dazar", 11).frontal).toBe(true);
  for (const b of kingsLessons) {
    expect(b.cues[0].start).toBe(0);
    expect(b.cues.at(-1)!.end).toBe(b.duration);
    expect(b.choices[b.correct]).toBeTruthy();
    for (const c of b.cues)
      for (const role of ["tank", "healer", "damage"] as const)
        expect(c.role[role].length).toBeGreaterThan(10);
  }
});
test("Kings guides support roles, mechanics, playback and practice", async ({
  page,
  request,
}) => {
  await page.goto(base);
  for (const b of kingsLessons) {
    await page.goto(`${base}/${b.id}`);
    await expect(
      page.getByRole("heading", { level: 2, name: b.name, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Tank", exact: true }).click();
    await expect(page.getByLabel("Kings next action")).toContainText(
      b.cues[0].role.tank,
    );
    await page
      .getByRole("combobox", { name: "Kings mechanic chapter" })
      .selectOption(b.cues[1].id);
    await expect(
      page.getByRole("slider", { name: "Kings scene position" }),
    ).toHaveValue("5");
    await page.getByRole("button", { name: "× Common mistake" }).click();
    await expect(page.locator("[data-kings-playback]")).toContainText(
      b.mistake,
    );
    await page
      .getByRole("button", {
        name: `${String.fromCharCode(65 + b.correct)} · ${b.choices[b.correct]}`,
      })
      .click();
    await expect(page.getByLabel("Kings practice feedback")).toContainText(
      "Good call",
    );
    for (const width of [320, 393, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (width !== 320)
        await page
          .locator("[data-kings-playback]")
          .screenshot({
            path: test.info().outputPath(`tactics-kings-${b.id}-${width}.png`),
          });
    }
  }
  const xml = await (await request.get("/sitemap.xml")).text();
  for (const b of kingsLessons) expect(xml).toContain(`${base}/${b.id}`);
});
test("Kings playback can play, pause, seek and reset", async ({ page }) => {
  await page.clock.install();
  await page.goto(`${base}/golden-serpent`);
  const range = page.getByRole("slider", { name: "Kings scene position" });
  await page.getByRole("button", { name: "Play Kings playback" }).click();
  await page.clock.fastForward(3000);
  expect(Number(await range.inputValue())).toBeGreaterThan(2.5);
  await page.getByRole("button", { name: "Pause Kings playback" }).click();
  const t = await range.inputValue();
  await page.clock.fastForward(1000);
  await expect(range).toHaveValue(t);
  await page.getByRole("button", { name: "Reset Kings playback" }).click();
  await expect(range).toHaveValue("0");
});
