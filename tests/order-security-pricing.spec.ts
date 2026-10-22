import { expect, test } from "@playwright/test";
import { POST } from "../src/app/api/order/route";
import { dungeons } from "../src/data/mythicPlus";

// Exercise the actual route with a process-local fetch stub. No network delivery.
test("server validates requests, calculates trusted prices and deduplicates delivery", async () => {
  const originalFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  let deliveries = 0;
  let sent: { allowed_mentions: { parse: string[] } } | undefined;
  process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/test-only";
  process.env.SITE_URL = "https://nikoboost.online";
  globalThis.fetch = async (url, init) => {
    expect(url).toBe("https://discord.invalid/test-only");
    deliveries++;
    sent = JSON.parse(String(init?.body));
    return new Response(null, { status: 204 });
  };
  let sequence = 0;
  const payload = () => ({
    customer: { battleTag: "Tester#1234", discord: "tester", character: "Tester", realm: "Test", preferredTime: "Flexible — please contact me (Europe/Berlin)", website: "", comment: "@everyone" },
    order: { runGoal: "standard", keyLevel: 10, runs: 4, participation: "play", playerClass: "Shaman", role: "dps", region: "EU", traders: 2, specificDungeon: false, dungeonCounts: {} as Record<string, number>, total: 1 },
  });
  async function submit(data: unknown, options: { origin?: string; type?: string; ip?: string; raw?: boolean } = {}) {
    return POST(new Request("https://nikoboost.online/api/order", {
      method: "POST",
      headers: { origin: options.origin ?? "https://nikoboost.online", "content-type": options.type ?? "application/json", "x-forwarded-for": options.ip ?? `192.0.2.${++sequence}` },
      body: options.raw ? String(data) : JSON.stringify(data),
    }));
  }
  try {
    expect((await POST(new Request("https://nikoboost.online/api/order", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    }))).status).toBe(403);
    expect((await submit(payload(), { origin: "https://evil.test" })).status).toBe(403);
    expect((await submit(payload(), { type: "text/plain" })).status).toBe(415);
    expect((await submit("{", { raw: true })).status).toBe(400);
    expect((await submit("x".repeat(13 * 1024), { raw: true })).status).toBe(413);
    for (const mutate of [
      (p: ReturnType<typeof payload>) => { p.order.runs = -1; },
      (p: ReturnType<typeof payload>) => { p.order.keyLevel = 99; },
      (p: ReturnType<typeof payload>) => { p.order.playerClass = "Rogue"; p.order.role = "healer"; },
      (p: ReturnType<typeof payload>) => { p.order.traders = 99; },
      (p: ReturnType<typeof payload>) => { p.order.specificDungeon = true; p.order.dungeonCounts = { [dungeons[0]]: 4, [dungeons[1]]: 1 }; },
      (p: ReturnType<typeof payload>) => { p.customer.website = "spam"; },
    ]) {
      const p = payload(); mutate(p);
      expect((await submit(p)).status).toBe(400);
    }
    expect(deliveries).toBe(0);
    const data = payload();
    const response = await submit(data, { ip: "192.0.2.100" });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.total).toBe(300_960); // 288000 + 10% traders, then 5% discount.
    expect(sent?.allowed_mentions.parse).toEqual([]);
    const repeated = await submit(data, { ip: "192.0.2.100" });
    expect((await repeated.json()).orderId).toBe(body.orderId);
    expect(deliveries).toBe(1);
    for (const [goal, participation, expected] of [
      ["standard", "play", 342_000],
      ["crest", "play", 273_600],
      ["crest", "afk", 300_960],
    ] as const) {
      const p = payload(); p.order.runGoal = goal; p.order.participation = participation; p.order.role = "healer";
      const result = await submit(p);
      expect(result.status).toBe(200);
      expect((await result.json()).total).toBe(expected);
    }
    for (let i = 0; i < 5; i++) expect((await submit({}, { ip: "192.0.2.200" })).status).toBe(400);
    expect((await submit({}, { ip: "192.0.2.200" })).status).toBe(429);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of ["DISCORD_WEBHOOK_URL", "SITE_URL"]) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  }
});
