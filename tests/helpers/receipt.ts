import type { OrderReceipt } from "../../src/components/MythicPlus/components/downloadOrderPdf";

export function mockReceipt(orderId: string, total: number): OrderReceipt {
  return {
    orderId,
    total,
    createdAt: "2030-01-15T08:00:00Z",
    customer: {
      battleTag: "TestPlayer#1234",
      discord: "test_user",
      character: "Testrogue",
      realm: "Tarren Mill",
      comment: "",
    },
    service: {
      runGoal: "standard",
      keyLevel: 10,
      runs: 1,
      mode: "Self-play",
      region: "EU",
      playerClass: "Rogue",
      role: "DPS",
      armor: "Leather",
      traders: 0,
      dungeons: ["Any dungeon"],
    },
    schedule: { preferredTime: "Flexible", tbilisiTime: "Flexible" },
  };
}

export function mockDelveReceipt(
  orderId: string,
  total: number | null,
): import("../../src/lib/orderReceipt").DelveOrderReceipt {
  return {
    serviceType: "delves",
    orderId,
    total,
    quote: total === null,
    createdAt: "2030-01-15T08:00:00Z",
    customer: {
      battleTag: "Tester#1234",
      discord: "tester",
      character: "Tester",
      realm: "Test",
      comment: "",
    },
    service: {
      kind: total === null ? "nemesis" : "runs",
      name: "Delves - Tier 8",
      tier: total === null ? null : 8,
      runs: 4,
      mode: "Self-play",
      region: "EU",
      playerClass: "Mage",
      delveId: "any",
      destination: "Any available Delve",
      format: total === null ? null : "regular",
      cofferKeys: null,
      tierUnlocked: total !== null,
    },
    schedule: { preferredTime: "Flexible (UTC)", tbilisiTime: "Flexible" },
  };
}
