import { getMythicReward, mythicRewards, vaultThresholds } from "@/data/wowSeason";

export const MAX_PLANNER_RUNS = 200;

export function isPlannerKey(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && !!getMythicReward(value);
}

export function getWeeklyGoal(runs: number[], targetVault: number, slots: number) {
  const reward = mythicRewards.find((row) => row.vault >= targetVault);
  if (!reward || ![1, 2, 3].includes(slots)) throw new Error("Invalid weekly goal");
  const required = vaultThresholds[slots - 1];
  const qualifying = runs.filter((key) => {
    const row = getMythicReward(key);
    return row && row.vault >= targetVault;
  }).length;
  return { key: reward.level, required, qualifying, missing: Math.max(0, required - qualifying) };
}

// Compact links contain only key levels, never player or customer details.
export function encodePlan(runs: number[]): string {
  const counts = new Map<number, number>();
  for (const key of runs.filter(isPlannerKey).slice(0, MAX_PLANNER_RUNS)) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => b - a).map(([key, count]) => `${key}x${count}`).join(",");
}

export function decodePlan(value: string | null): number[] | null {
  if (value === null || value.length > 1200) return null;
  if (value === "") return [];
  const runs: number[] = [];
  for (const group of value.split(",")) {
    const match = /^(\d{1,2})x([1-9]\d{0,2})$/.exec(group);
    if (!match) return null;
    const key = Number(match[1]);
    const count = Number(match[2]);
    if (!isPlannerKey(key) || runs.length + count > MAX_PLANNER_RUNS) return null;
    runs.push(...Array<number>(count).fill(key));
  }
  return runs;
}
