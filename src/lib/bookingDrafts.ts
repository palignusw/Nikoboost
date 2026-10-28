import {
  basePrices, classArmor, classRoles, dungeons, getMaxTraders,
  type DungeonName, type Participation, type Region, type Role,
} from "@/data/mythicPlus";
import { delveLocations, delvePrices, delveSettings, mythicSettings, wowSeason } from "@/data/season";
import type { DelveConfig } from "@/data/delves";

export const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;
export const draftKey = (service: "mythic" | "delves") => `nikoboost:booking-draft:${service}:v1`;
export type ConfirmedChoices = Record<"keyLevel" | "runs" | "participation" | "playerClass" | "role" | "dungeon" | "traders" | "region", boolean>;
export type MythicDraft = {
  keyLevel: number; runs: number; runGoal: "standard" | "crest";
  participation: Participation; region: Region; role: Role; playerClass: string;
  specificDungeon: boolean; dungeonCounts: Record<DungeonName, number>;
  traders: number; confirmed: ConfirmedChoices;
};
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const integer = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

export function parseMythicDraft(value: unknown): MythicDraft | null {
  if (!record(value)) return null;
  const v = value;
  if (typeof v.keyLevel !== "number" || !Object.hasOwn(basePrices, v.keyLevel) ||
      !integer(v.runs, 1, mythicSettings.maxRuns) ||
      (v.runGoal !== "standard" && v.runGoal !== "crest") ||
      (v.runGoal === "crest" && v.keyLevel > mythicSettings.crestMaxKey) ||
      (v.participation !== "play" && v.participation !== "afk") ||
      (v.region !== "EU" && v.region !== "NA") ||
      typeof v.playerClass !== "string" || !Object.hasOwn(classArmor, v.playerClass) ||
      (v.role !== "dps" && v.role !== "tank" && v.role !== "healer") ||
      !classRoles[v.playerClass].includes(v.role) ||
      (v.participation === "afk" && v.role !== "dps") ||
      typeof v.specificDungeon !== "boolean" || !record(v.dungeonCounts) ||
      !integer(v.traders, 0, getMaxTraders(classArmor[v.playerClass])) || !record(v.confirmed)) return null;
  const counts = {} as Record<DungeonName, number>;
  for (const name of dungeons) {
    const amount = v.dungeonCounts[name];
    if (!integer(amount, 0, v.runs)) return null;
    counts[name] = amount;
  }
  if (Object.values(counts).reduce((sum, n) => sum + n, 0) > v.runs ||
      (!v.specificDungeon && Object.values(counts).some(Boolean))) return null;
  const confirmed = {} as ConfirmedChoices;
  for (const field of ["keyLevel", "runs", "participation", "playerClass", "role", "dungeon", "traders", "region"] as const) {
    if (typeof v.confirmed[field] !== "boolean") return null;
    confirmed[field] = v.confirmed[field];
  }
  // Copy only booking settings; never carry arbitrary stored fields into the UI.
  return { keyLevel: v.keyLevel, runs: v.runs, runGoal: v.runGoal, participation: v.participation,
    region: v.region, role: v.role, playerClass: v.playerClass, specificDungeon: v.specificDungeon,
    dungeonCounts: counts, traders: v.traders, confirmed };
}

export function parseDelveDraft(value: unknown): DelveConfig | null {
  if (!record(value)) return null;
  const v = value;
  if (v.service !== "delves" || (v.kind !== "runs" && v.kind !== "nemesis" && v.kind !== "labyrinth") ||
      typeof v.tier !== "number" || !Object.hasOwn(delvePrices, v.tier) ||
      !integer(v.runs, 1, delveSettings.maxRuns) || (v.region !== "EU" && v.region !== "NA") ||
      (v.format !== "regular" && v.format !== "bountiful") || typeof v.delveId !== "string" ||
      (v.delveId !== "any" && !delveLocations.some((d) => d.id === v.delveId)) ||
      typeof v.playerClass !== "string" || !Object.hasOwn(classArmor, v.playerClass) ||
      (v.kind !== "runs" && (v.runs !== 1 || v.format !== "regular" || v.delveId !== "any"))) return null;
  return { service: "delves", kind: v.kind, tier: v.tier, runs: v.runs, region: v.region,
    format: v.format, delveId: v.delveId, playerClass: v.playerClass };
}

export function readBookingDraft<T>(raw: string | null | undefined, parse: (value: unknown) => T | null, now?: number): T | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.version !== 1 || data.season !== wowSeason.id ||
        typeof data.updatedAt !== "number" || !Number.isFinite(data.updatedAt) ||
        data.updatedAt > (now ?? Date.now()) || (now ?? Date.now()) - data.updatedAt >= DRAFT_TTL) return null;
    return parse(data.value);
  } catch { return null; }
}

export function encodeBookingDraft<T>(value: T, now = Date.now()) {
  return JSON.stringify({ version: 1, season: wowSeason.id, updatedAt: now, value });
}
