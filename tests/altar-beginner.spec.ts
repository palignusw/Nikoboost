import { test, expect } from "@playwright/test";
import {
  beginnerMechanics,
  getBeginnerPrompt,
} from "../src/data/altar-beginner";
import { altarPlayback } from "../src/data/altar-playback";
import type { AltarBossId } from "../src/data/altar-study";

test("beginner reactions cover each Altar boss, roles and observed scene cues", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const boss of Object.keys(beginnerMechanics) as AltarBossId[]) {
    for (const cue of altarPlayback[boss].cues) {
      const prompt = getBeginnerPrompt(boss, cue.id);
      expect(prompt === null || beginnerMechanics[boss].includes(prompt)).toBe(
        true,
      );
    }
    await page.goto(`/tactics/altar-of-fangs/${boss}`);
    const guide = page.getByRole("region", {
      name: "Beginner mechanic guide",
      exact: true,
    });
    const actions = page.getByRole("group", {
      name: "Your learning role",
      exact: true,
    });
    const first = beginnerMechanics[boss][0];
    await expect(guide.getByText(first.see, { exact: true })).toBeVisible();
    await expect(guide.getByText(first.done, { exact: true })).toBeVisible();
    for (const [label, role] of [
      ["Tank", "tank"],
      ["Healer", "healer"],
      ["DPS", "damage"],
    ] as const) {
      await actions.getByRole("button", { name: label, exact: true }).click();
      await expect(
        actions.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        guide.getByText(first.role[role], { exact: false }),
      ).toBeVisible();
      const prompt = getBeginnerPrompt(boss, altarPlayback[boss].cues[0].id)!;
      await expect(
        page
          .getByLabel("Your next move", { exact: true })
          .getByText(prompt.role[role], { exact: true }),
      ).toBeVisible();
    }
    // Every mechanic can be opened and gives both an action and a completion cue.
    for (const m of beginnerMechanics[boss]) {
      // Locate by its native disclosure summary, without depending on CSS module names.
      const summary = guide.locator("summary").filter({ hasText: m.name });
      const disclosure = summary.locator("..");
      if ((await disclosure.getAttribute("open")) === null)
        await summary.click();
      await expect(
        disclosure.getByText(m.action, { exact: true }),
      ).toBeVisible();
      await expect(disclosure.getByText(m.done, { exact: true })).toBeVisible();
      await expect(
        disclosure.getByRole("link", { name: "Spell / journal reference" }),
      ).toHaveAttribute("href", m.source);
    }
    await guide.getByText("New to these terms?", { exact: true }).click();
    await expect(
      guide.getByText(
        "Stand inside the specified impact or beam to intercept it. It is an intentional hit.",
        { exact: true },
      ),
    ).toBeVisible();
    await page.setViewportSize({ width: 320, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await guide.screenshot({
      path: test.info().outputPath(`tactics-beginner-${boss}-320.png`),
    });
  }
});
