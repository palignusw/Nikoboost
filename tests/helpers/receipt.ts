import type { OrderReceipt } from "../../src/components/MythicPlus/components/downloadOrderPdf";

export function mockReceipt(orderId: string, total: number): OrderReceipt {
  return {
    orderId, total, createdAt: "2030-01-15T08:00:00Z",
    customer: { battleTag: "TestPlayer#1234", discord: "test_user", character: "Testrogue", realm: "Tarren Mill", comment: "" },
    service: { runGoal: "standard", keyLevel: 10, runs: 1, mode: "Self-play", region: "EU", playerClass: "Rogue", role: "DPS", armor: "Leather", traders: 0, dungeons: ["Any dungeon"] },
    schedule: { preferredTime: "Flexible", tbilisiTime: "Flexible" },
  };
}
