import { expect, test } from "@playwright/test";
import { POST } from "../src/app/api/order/route";

// Exercise the real endpoint. All webhook delivery is intercepted in-process.
test("branch preview accepts both Delves and Mythic+ bookings without trusting request host headers", async () => {
  const keys = ["SITE_URL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_BRANCH_URL", "DISCORD_WEBHOOK_URL"] as const;
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const fetchBefore = globalThis.fetch;
  const branch = "nikoboost-git-feat-delves-service-palignusws-projects.vercel.app";
  const deployment = "nikoboost-abc123-palignusws-projects.vercel.app";
  process.env.SITE_URL = "https://www.nikoboost.online";
  process.env.VERCEL_ENV = "preview";
  process.env.VERCEL_URL = deployment;
  process.env.VERCEL_BRANCH_URL = branch;
  process.env.DISCORD_WEBHOOK_URL = "https://discord.invalid/preview-test-only";
  let deliveries = 0;
  globalThis.fetch = async (url) => { expect(url).toBe("https://discord.invalid/preview-test-only"); deliveries++; return new Response(null, { status: 204 }); };
  const customer = { battleTag: "Tester#1234", discord: "tester", character: "Test", realm: "Test", preferredTime: "Flexible — please contact me (UTC)", website: "", comment: "" };
  let sequence = 0;
  const submit = (order: unknown, origin: string, host = branch) => POST(new Request(`https://${branch}/api/order`, { method: "POST", headers: { "content-type": "application/json", origin, host, "x-forwarded-host": host, "x-forwarded-for": `203.0.113.${++sequence}` }, body: JSON.stringify({ customer, order }) }));
  try {
    const delves = { service: "delves", kind: "runs", tier: 8, runs: 4, format: "regular", delveId: "any", playerClass: "Mage", region: "EU", tierUnlocked: true };
    const mythic = { runGoal: "standard", keyLevel: 10, runs: 1, participation: "play", playerClass: "Mage", role: "dps", region: "EU", traders: 0, specificDungeon: false, dungeonCounts: {} };
    for (const host of [branch, deployment]) {
      for (const [order, total] of [[delves, 190000], [mythic, 72000]] as const) {
        const response = await submit(order, `https://${host}`);
        expect(response.status).toBe(200);
        expect((await response.json()).total).toBe(total);
      }
    }
    expect(deliveries).toBe(4);
    expect((await submit(delves, "https://attacker.vercel.app")).status).toBe(403);
    expect((await submit(delves, "https://attacker.vercel.app", "attacker.vercel.app")).status).toBe(403);
    process.env.VERCEL_ENV = "production";
    expect((await submit(delves, `https://${branch}`)).status).toBe(403);
    expect(deliveries).toBe(4);
  } finally {
    globalThis.fetch = fetchBefore;
    for (const key of keys) { if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key]; }
  }
});
