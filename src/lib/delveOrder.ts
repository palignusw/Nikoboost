import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { classArmor } from "@/data/mythicPlus";
import {
  delveLocations,
  delveName,
  delvePrice,
  type DelveConfig,
} from "@/data/delves";

type Customer = {
  battleTag: string;
  discord: string;
  character: string;
  realm: string;
  preferredTime: string;
  comment: string;
};
type Delivery = {
  expires: number;
  result?: {
    ok: true;
    orderId: string;
    total: number | null;
    service: "delves";
    quote: boolean;
  };
};
const deliveries = new Map<string, Delivery>();
const error = (message: string, status = 400) =>
  NextResponse.json({ ok: false, error: message }, { status });
/** Called only after the common order endpoint's origin, body, rate, customer and schedule validation. */
export async function submitDelveOrder(
  order: Record<string, unknown>,
  customer: Customer,
  ip: string,
  webhook: string,
  tbilisiTime: string,
) {
  const { kind, tier, runs, region, format, delveId, playerClass } = order;
  if (kind !== "runs" && kind !== "nemesis" && kind !== "labyrinth")
    return error("Invalid Delve service.");
  if (region !== "EU" && region !== "NA") return error("Invalid region.");
  if (
    typeof playerClass !== "string" ||
    !Object.hasOwn(classArmor, playerClass)
  )
    return error("Invalid character class.");
  if (
    !Number.isInteger(tier) ||
    Number(tier) < 1 ||
    Number(tier) > 11 ||
    !Number.isInteger(runs) ||
    Number(runs) < 1 ||
    Number(runs) > 20
  )
    return error("Invalid tier or run count.");
  if (format !== "regular" && format !== "bountiful")
    return error("Invalid Delve format.");
  if (
    typeof delveId !== "string" ||
    (delveId !== "any" && !delveLocations.some((d) => d.id === delveId))
  )
    return error("Unknown Delve.");
  const quote = kind !== "runs";
  if (quote && customer.comment.trim().length < 3)
    return error("Describe your specialist objective.");
  if (!quote && order.tierUnlocked !== true)
    return error("Please confirm access to the selected tier.");
  if (
    !quote &&
    format === "bountiful" &&
    (!Number.isInteger(order.cofferKeys) ||
      Number(order.cofferKeys) < Number(runs) ||
      Number(order.cofferKeys) > 1000)
  )
    return error("Bring one Restored Coffer Key per Bountiful run.");
  if (quote && (runs !== 1 || delveId !== "any" || format !== "regular"))
    return error("Invalid specialist enquiry.");
  const config: DelveConfig = {
    service: "delves",
    kind,
    tier: Number(tier),
    runs: Number(runs),
    region,
    format,
    delveId,
    playerClass,
  };
  const price = quote ? null : delvePrice(config);
  const total = price?.total ?? null;
  const serviceName =
    kind === "nemesis"
      ? "Azta’rec / Venomfall Deeps enquiry"
      : kind === "labyrinth"
        ? "Labyrinth of Kindo’jan enquiry"
        : `Tier ${tier} Delves × ${runs}`;
  const normalized = {
    ...config,
    cofferKeys: !quote && format === "bountiful" ? order.cofferKeys : 0,
  };
  const fingerprint = createHash("sha256")
    .update(JSON.stringify({ ip, customer, order: normalized }))
    .digest("hex");
  const now = Date.now();
  for (const [key, value] of deliveries)
    if (value.expires <= now) deliveries.delete(key);
  const old = deliveries.get(fingerprint);
  if (old)
    return old.result
      ? NextResponse.json({ ...old.result, duplicate: true })
      : error(
          "This request is already being processed. Check with support before retrying.",
          409,
        );
  deliveries.set(fingerprint, { expires: now + 30_000 });
  const orderId = `NB-D-${randomUUID().slice(0, 8).toUpperCase()}`;
  const fields = [
    {
      name: "Service",
      value: `${serviceName}\n${region} · Self-play\nClass: ${playerClass}`,
    },
    {
      name: quote ? "Scope to confirm" : "Delve selection",
      value: quote
        ? "Manual quote required. No solo achievement, mount or loot guarantee. Confirm scope and gold price with the customer."
        : `${delveName(delveId)}\n${format === "bountiful" ? `Bountiful · ${order.cofferKeys} customer keys` : "Regular completion"}\nTier access confirmed.\nActive Bountiful rotation must be checked before payment.`,
    },
    {
      name: "Gold price",
      value: price
        ? `${price.total.toLocaleString("en-US")} gold\nBase ${price.base} + specific ${price.specific} − discount ${price.discount}`
        : "Manual quote — no fixed price agreed",
    },
    {
      name: "Customer",
      value: `BattleTag: ${customer.battleTag}\nDiscord: ${customer.discord}\nCharacter: ${customer.character}\nRealm: ${customer.realm}`,
    },
    {
      name: "Schedule",
      value: `${customer.preferredTime}\nTbilisi: ${tbilisiTime}`,
    },
    ...(customer.comment ? [{ name: "Notes", value: customer.comment }] : []),
  ];
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        username: "NikoBoost Orders",
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: `${quote ? "Delves quote request" : "New Delves reservation"} ${orderId}`,
            color: 0x5f7cff,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!response.ok) {
      deliveries.delete(fingerprint);
      return error("Request could not be sent. Please try again.", 502);
    }
    const result = {
      ok: true as const,
      orderId,
      total,
      service: "delves" as const,
      quote,
    };
    deliveries.set(fingerprint, { expires: Date.now() + 30_000, result });
    return NextResponse.json(result);
  } catch {
    // Delivery may have reached Discord even if its acknowledgement timed out.
    deliveries.set(fingerprint, { expires: Date.now() + 30_000 });
    return error(
      "Could not confirm delivery. Check with support before trying again.",
      504,
    );
  }
}
