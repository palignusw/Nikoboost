import { expect, test } from "@playwright/test";
import { draftKey, DRAFT_TTL, encodeBookingDraft, parseDelveDraft, parseMythicDraft, readBookingDraft, type MythicDraft } from "../src/lib/bookingDrafts";
import { dungeons, wowSeason } from "../src/data/season";
import { openReservation } from "./helpers/configurator";
import { mockDelveReceipt, mockReceipt } from "./helpers/receipt";

const mythic: MythicDraft = {
  keyLevel: 10, runs: 4, runGoal: "standard", participation: "play", region: "NA",
  role: "dps", playerClass: "Rogue", specificDungeon: true,
  dungeonCounts: Object.fromEntries(dungeons.map((name, i) => [name, i === 0 ? 2 : 0])) as MythicDraft["dungeonCounts"],
  traders: 1, confirmed: { keyLevel: true, runs: true, participation: true, playerClass: true,
    role: true, dungeon: true, traders: true, region: true },
};
const delve = { service: "delves", kind: "runs", tier: 8, runs: 8, region: "NA", format: "bountiful", delveId: "any", playerClass: "Mage" } as const;

test("draft validation rejects expired, foreign-season and unsafe values", () => {
  const now = Date.now();
  const raw = encodeBookingDraft(mythic, now);
  expect(readBookingDraft(raw, parseMythicDraft, now + DRAFT_TTL - 1)).toEqual(mythic);
  expect(readBookingDraft(raw, parseMythicDraft, now + DRAFT_TTL)).toBeNull();
  expect(readBookingDraft(raw, parseMythicDraft, now - 1)).toBeNull();
  expect(readBookingDraft("{broken", parseMythicDraft)).toBeNull();
  expect(readBookingDraft(JSON.stringify({ ...JSON.parse(raw), season: `${wowSeason.id}-old` }), parseMythicDraft)).toBeNull();
  for (const patch of [{ runs: 500 }, { playerClass: "__proto__" }, { role: "healer" }, { keyLevel: 999 }, { traders: 999 }, { dungeonCounts: {} }]) {
    expect(parseMythicDraft({ ...mythic, ...patch })).toBeNull();
  }
  expect(parseMythicDraft({ ...mythic, battleTag: "Secret#1234", discord: "secret" })).toEqual(mythic);
  expect(parseDelveDraft({ ...delve, battleTag: "Secret#1234" })).toEqual(delve);
  expect(parseDelveDraft({ ...delve, delveId: "removed-delve" })).toBeNull();
  expect(parseDelveDraft({ ...delve, runs: 999 })).toBeNull();
});

for (const service of ["mythic", "delves"] as const) {
  test(`${service} settings can be resumed and cleared`, async ({ page }, info) => {
    const key = draftKey(service);
    const value = service === "mythic" ? mythic : delve;
    const encoded = encodeBookingDraft(value);
    await page.addInitScript(({ key, encoded }) => {
      if (!sessionStorage.getItem("draft-seeded")) {
        localStorage.setItem(key, encoded);
        sessionStorage.setItem("draft-seeded", "yes");
      }
    }, { key, encoded });
    await page.goto(service === "mythic" ? "/#mythic" : "/delves#delve-builder");
    const notice = page.getByRole("complementary", { name: "Saved run settings" });
    await expect(notice).toContainText("only in this browser on this device");
    await expect(notice).toContainText("Contact details are not saved");
    await notice.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`tactics-draft-${service}-resume.png`) });
    await notice.getByRole("button", { name: "Continue setup" }).click();
    if (service === "delves") {
      await expect(page.getByTestId("delve-total")).toHaveText("360,000 gold");
      await expect(page.getByRole("button", { name: /Bountiful runs/ })).toHaveAttribute("aria-pressed", "true");
    } else {
      await expect(page.getByRole("button", { name: /^4 runs,/ })).toHaveClass(/activeOption/);
      await expect(page.getByRole("button", { name: /Mythic Plus 10,/ })).toHaveClass(/activeOption/);
    }
    // A visit/resume alone must not extend the retention period.
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).updatedAt, key)).toBe(JSON.parse(encoded).updatedAt);
    await page.reload();
    await expect(notice.getByRole("button", { name: "Continue setup" })).toBeVisible();
    await notice.getByRole("button", { name: "Start over" }).click();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), key)).toBeNull();
    if (service === "delves") await expect(page.getByTestId("delve-total")).toHaveText("190,000 gold");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("fresh settings save without contact details and receive a new timestamp only on edits", async ({ page }) => {
  await page.goto("/delves#delve-builder");
  await page.getByRole("button", { name: /8 3 Vault choices/ }).click();
  const key = draftKey("delves");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), key)).not.toBeNull();
  const before = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key);
  expect(before.value.runs).toBe(8);
  expect(Object.keys(before.value).sort()).toEqual(Object.keys(delve).sort());
  await page.getByRole("button", { name: /1 Single run/ }).click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).value.runs, key)).toBe(1);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).updatedAt, key)).toBeGreaterThanOrEqual(before.updatedAt);
});

test("expired and corrupt drafts do not block booking", async ({ page }) => {
  await page.addInitScript(({ key, expired }) => {
    localStorage.setItem(key, expired);
  }, { key: draftKey("delves"), expired: encodeBookingDraft(delve, Date.now() - DRAFT_TTL - 1) });
  await page.goto("/delves");
  const notice = page.getByRole("complementary", { name: "Saved run settings" });
  await expect(notice.getByRole("button", { name: "Continue setup" })).toHaveCount(0);
  await page.getByRole("button", { name: /8 3 Vault choices/ }).click();
  await expect(page.getByTestId("delve-total")).toHaveText("360,000 gold");
});

test("storage denial keeps configuration usable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Disabled", "QuotaExceededError"); };
  });
  await page.goto("/delves");
  await page.getByRole("button", { name: /8 3 Vault choices/ }).click();
  await expect(page.getByRole("complementary", { name: "Saved run settings" })).toContainText("Browser saving is unavailable");
  await expect(page.getByTestId("delve-total")).toHaveText("360,000 gold");
  await page.getByRole("button", { name: /Reserve this expedition/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

for (const service of ["mythic", "delves"] as const) {
  test(`${service} successful mocked reservation clears its draft`, async ({ page }) => {
    await page.route("**/api/order", (route) => route.fulfill({ status: 200, json: {
      ok: true, orderId: "NB-DRAFT-TEST", total: service === "mythic" ? 80000 : 360000,
      ...(service === "delves" ? { quote: false } : {}),
      receipt: service === "mythic" ? mockReceipt("NB-DRAFT-TEST", 80000) : mockDelveReceipt("NB-DRAFT-TEST", 360000),
    } }));
    if (service === "mythic") await openReservation(page);
    else {
      await page.goto("/delves");
      await page.getByRole("button", { name: /8 3 Vault choices/ }).click();
      await page.getByRole("button", { name: /Reserve this expedition/ }).click();
    }
    const modal = page.getByRole("dialog");
    await modal.getByPlaceholder("Player#1234").fill("Tester#1234");
    await modal.getByPlaceholder("@username").fill("tester");
    await modal.getByPlaceholder("Your character").fill("Tester");
    await modal.getByPlaceholder("Tarren Mill").fill("Test");
    if (service === "mythic") await modal.getByRole("button", { name: "Flexible time" }).click();
    else {
      await modal.getByRole("checkbox").nth(0).check();
      await modal.getByRole("checkbox").nth(1).check();
    }
    const stored = await page.evaluate((key) => localStorage.getItem(key), draftKey(service));
    expect(stored).not.toBeNull();
    expect(stored).not.toContain("Tester#1234");
    expect(stored).not.toContain('"discord"');
    await modal.getByRole("button", { name: /Submit Reservation|Send reservation/i }).click();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), draftKey(service))).toBeNull();
    await expect(modal).toContainText("NB-DRAFT-TEST");
  });
}
