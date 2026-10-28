/** Source and refresh settings for the official patch-notes index. */
export const wowUpdatesConfig = {
  sourceUrl: "https://worldofwarcraft.blizzard.com/en-us/content-update-notes",
  sourceOrigin: "https://worldofwarcraft.blizzard.com",
  patchMajor: 12,
  midnightStart: "2026-02-26T00:00:00.000Z",
  refreshSeconds: 3600,
  timeoutMs: 8000,
  maxResponseBytes: 2_000_000,
  maxItems: 8,
} as const;
