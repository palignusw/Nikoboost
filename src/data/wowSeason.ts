// src/data/wowSeason.ts

/*
 * NIKOBOOST — CURRENT WOW SEASON
 *
 * Здесь будут храниться:
 * - подземелья
 * - награды Mythic+
 * - Crest
 * - Great Vault
 * - данные для RIO Calculator
 *
 * При выходе нового сезона обновляем этот файл.
 */

export const wowSeason = {
    id: "midnight-s2",
    name: "Midnight Season 2",
} as const;

export const dungeons = [
    "Altar of Fangs",
    "Murder Row",
    "Den of Nalorakk",
    "The Blinding Vale",
    "Voidscar Arena",
    "Kings' Rest",
    "Temple of Sethraliss",
    "Ruby Life Pools",
] as const;

export type DungeonName =
    (typeof dungeons)[number];

export type CrestType = "Champion" | "Hero" | "Myth";

export type MythicReward = {
    level: number;
    dungeon: number;
    dungeonTrack: string;
    vault: number;
    vaultTrack: string;
    crest: CrestType;
    crestAmount: number;
};

// Seasonal reward data.
// Crest quantities are provisional until final verification.
export const mythicRewards: MythicReward[] = [
    { level: 2, dungeon: 295, dungeonTrack: "Champion 2/6", vault: 305, vaultTrack: "Hero 1/6", crest: "Champion", crestAmount: 12 },
    { level: 3, dungeon: 295, dungeonTrack: "Champion 2/6", vault: 305, vaultTrack: "Hero 1/6", crest: "Champion", crestAmount: 14 },
    { level: 4, dungeon: 298, dungeonTrack: "Champion 3/6", vault: 308, vaultTrack: "Hero 2/6", crest: "Hero", crestAmount: 10 },
    { level: 5, dungeon: 302, dungeonTrack: "Champion 4/6", vault: 308, vaultTrack: "Hero 2/6", crest: "Hero", crestAmount: 12 },
    { level: 6, dungeon: 305, dungeonTrack: "Hero 1/6", vault: 311, vaultTrack: "Hero 3/6", crest: "Hero", crestAmount: 14 },
    { level: 7, dungeon: 305, dungeonTrack: "Hero 1/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Hero", crestAmount: 16 },
    { level: 8, dungeon: 308, dungeonTrack: "Hero 2/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Hero", crestAmount: 18 },
    { level: 9, dungeon: 308, dungeonTrack: "Hero 2/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Myth", crestAmount: 10 },
    ...Array.from({ length: 11 }, (_, i) => ({
        level: i + 10,
        dungeon: 311,
        dungeonTrack: "Hero 3/6",
        vault: 318,
        vaultTrack: "Myth 1/6",
        crest: "Myth" as CrestType,
        crestAmount: i === 0 ? 12 : i === 1 ? 14 : 16,
    })),
];

export const vaultThresholds = [1, 4, 8] as const;

export function getMythicReward(level: number): MythicReward | undefined {
    return mythicRewards.find((reward) => reward.level === level);
}