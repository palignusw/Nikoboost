import { expect, test } from "@playwright/test";
import { POST } from "../src/app/api/order/route";
import { delvePrice, delveLocations } from "../src/data/delves";

test("Delve tariffs apply package savings after location surcharge", () => {
  expect(delveLocations).toHaveLength(12);
  expect(new Set(delveLocations.map((d) => d.id)).size).toBe(12);
  expect(delvePrice({ tier: 8, runs: 4, delveId: "any" }).total).toBe(190000);
  expect(delvePrice({ tier: 8, runs: 8, delveId: "ring-of-glory" }).total).toBe(
    378000,
  );
  for (const config of [
    { tier: 0, runs: 1, delveId: "any" },
    { tier: 8, runs: 21, delveId: "any" },
    { tier: 8, runs: 2.5, delveId: "any" },
    { tier: 8, runs: 4, delveId: "__proto__" },
  ])
    expect(() => delvePrice(config)).toThrow();
});

test("Delve API distrusts totals, validates service eligibility, and sends specialist requests without a fake price", async () => {
  const fetchBefore = globalThis.fetch;
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  const site = process.env.SITE_URL;
  process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/delves-test";
  process.env.SITE_URL = "https://nikoboost.online";
  let deliveries = 0;
  let sent:
    | {
        allowed_mentions: { parse: string[] };
        embeds: { fields: { name: string; value: string }[] }[];
      }
    | undefined;
  globalThis.fetch = async (url, init) => {
    expect(url).toBe("https://discord.invalid/delves-test");
    deliveries++;
    sent = JSON.parse(String(init?.body));
    return new Response(null, { status: 204 });
  };
  let sequence = 0;
  const payload = () => ({
    customer: {
      battleTag: "Tester#1234",
      discord: "tester",
      character: "Tester",
      realm: "Test",
      preferredTime: "Flexible — please contact me (Europe/Berlin)",
      comment: "@everyone",
      website: "",
    },
    order: {
      service: "delves",
      kind: "runs",
      tier: 8,
      runs: 4,
      region: "EU",
      format: "regular",
      delveId: "any",
      playerClass: "Mage",
      tierUnlocked: true,
      cofferKeys: 4,
      total: 1,
    },
  });
  const submit = (
    p: unknown,
    ip = `198.51.100.${++sequence}`,
    origin = "https://nikoboost.online",
  ) =>
    POST(
      new Request("https://nikoboost.online/api/order", {
        method: "POST",
        headers: {
          origin,
          "content-type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify(p),
      }),
    );
  try {
    expect(
      (await submit(payload(), undefined, "https://evil.test")).status,
    ).toBe(403);
    for (const mutate of [
      (p: ReturnType<typeof payload>) => {
        p.order.kind = "solo-guaranteed";
      },
      (p: ReturnType<typeof payload>) => {
        p.order.tier = 12;
      },
      (p: ReturnType<typeof payload>) => {
        p.order.runs = 0;
      },
      (p: ReturnType<typeof payload>) => {
        p.order.delveId = "venomfall-deeps";
      },
      (p: ReturnType<typeof payload>) => {
        p.order.playerClass = "__proto__";
      },
      (p: ReturnType<typeof payload>) => {
        p.order.tierUnlocked = false;
      },
      (p: ReturnType<typeof payload>) => {
        p.order.format = "bountiful";
        p.order.cofferKeys = 3;
      },
      (p: ReturnType<typeof payload>) => {
        p.order.format = "bountiful";
        p.order.cofferKeys = 4.5;
      },
      (p: ReturnType<typeof payload>) => {
        p.order.kind = "labyrinth";
      },
    ]) {
      const p = payload();
      mutate(p);
      expect((await submit(p)).status).toBe(400);
    }
    expect(deliveries).toBe(0);
    const p = payload();
    const good = await submit(p, "198.51.100.100");
    const result = await good.json();
    expect(good.status).toBe(200);
    expect(result.total).toBe(190000);
    expect(sent?.allowed_mentions.parse).toEqual([]);
    expect(
      (
        await (
          await submit(
            { ...p, order: { ...p.order, total: 9999999 } },
            "198.51.100.100",
          )
        ).json()
      ).orderId,
    ).toBe(result.orderId);
    expect(deliveries).toBe(1);
    for (const kind of ["nemesis", "labyrinth"]) {
      const p = payload();
      p.order.kind = kind;
      p.order.runs = 1;
      const r = await submit(p);
      expect(r.status).toBe(200);
      const data = await r.json();
      expect(data.total).toBeNull();
      expect(data.quote).toBe(true);
      expect(
        sent?.embeds[0].fields.find((f) => f.name === "Gold price")?.value,
      ).toContain("Manual quote");
    }
    const retry = payload();
    retry.order.runs = 2;
    globalThis.fetch = async () => {
      deliveries++;
      return new Response(null, { status: 502 });
    };
    expect((await submit(retry, "198.51.100.101")).status).toBe(502);
    globalThis.fetch = async () => new Response(null, { status: 204 });
    expect((await submit(retry, "198.51.100.101")).status).toBe(200);
  } finally {
    globalThis.fetch = fetchBefore;
    if (webhook === undefined) delete process.env.DISCORD_WEBHOOK_URL;
    else process.env.DISCORD_WEBHOOK_URL = webhook;
    if (site === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = site;
  }
});

test("Delve configurator reprices, filters all locations and keeps specialist enquiries separate", async ({
  page,
}, info) => {
  await page.goto("/delves");
  await expect(page).toHaveTitle(
    "Delves Boost for Gold | Midnight Season 2 | NikoBoost",
  );
  await expect(page.getByTestId("delve-total")).toHaveText("190,000 gold");
  await page.getByRole("button", { name: /8 3 Vault choices/ }).click();
  await expect(page.getByTestId("delve-total")).toHaveText("360,000 gold");
  await page.getByRole("combobox", { name: /^Delve Tier/ }).click();
  await page.getByRole("option", { name: /Tier 11/ }).click();
  await expect(page.getByTestId("delve-total")).toHaveText("792,000 gold");
  await page.getByRole("combobox", { name: /^Delve location/ }).click();
  await page.getByRole("option", { name: /Gnarldor Isle/ }).click();
  await expect(page.getByTestId("delve-total")).toHaveText("831,600 gold");
  await expect(page.locator("#locations article")).toHaveCount(14);
  await page.getByRole("searchbox").fill("Harandar");
  await expect(page.locator("#locations article")).toHaveCount(4); // two regular plus two specialists
  await page.getByRole("searchbox").fill("no such delve");
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("#locations article")).toHaveCount(14);
  await page
    .getByRole("button", { name: /Plan a Labyrinth adventure/ })
    .click();
  await expect(page.getByTestId("delve-total")).toHaveText("Custom quote");
  await page.getByRole("button", { name: /Request a gold quote/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: /Back to fixed-price Delves/ })
    .click();
  await page.screenshot({
    path: `/tmp/delves-${info.project.name.replaceAll(" ", "-")}.png`,
    fullPage: true,
  });
  const widths = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1] + 1);
});

test("Delve reservation uses authoritative confirmation and preserves errors without sending real orders", async ({
  page,
}) => {
  await page.goto("/delves");
  let sent = 0;
  await page.route("**/api/order", async (route) => {
    sent++;
    const payload = route.request().postDataJSON();
    expect(payload.order.service).toBe("delves");
    expect(payload.order.tierUnlocked).toBe(true);
    expect(payload.customer.preferredTime).toContain("Flexible");
    if (sent === 1)
      await route.fulfill({
        status: 502,
        json: { ok: false, error: "Delivery unavailable. Try again." },
      });
    else
      await route.fulfill({
        json: {
          ok: true,
          service: "delves",
          orderId: "NB-D-TEST",
          total: 190000,
          quote: false,
        },
      });
  });
  await page.getByRole("button", { name: /Reserve this expedition/ }).click();
  const modal = page.getByRole("dialog");
  for (const [label, value] of [
    ["BattleTag", "Tester#1234"],
    ["Discord username", "tester"],
    ["Character name", "Tester"],
    ["Realm", "Test"],
  ])
    await modal.getByRole("textbox", { name: label, exact: true }).fill(value);
  await modal.getByRole("checkbox").nth(0).check();
  await modal.getByRole("checkbox").nth(1).check();
  await modal.getByRole("button", { name: /Send reservation request/ }).click();
  await expect(modal.getByRole("alert")).toHaveText(
    "Delivery unavailable. Try again.",
  );
  await expect(
    modal.getByRole("textbox", { name: "BattleTag", exact: true }),
  ).toHaveValue("Tester#1234");
  await modal.getByRole("button", { name: /Send reservation request/ }).click();
  await expect(modal.getByRole("status")).toContainText("190,000 gold");
  await expect(modal.getByRole("status")).toContainText("NB-D-TEST");
  expect(sent).toBe(2);
});
