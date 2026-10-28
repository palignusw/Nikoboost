/** Source and refresh settings for the official patch-notes index. */
export const wowUpdatesConfig = {
  sourceUrl: "https://worldofwarcraft.blizzard.com/en-us/content-update-notes",
  sourceOrigin: "https://worldofwarcraft.blizzard.com",
  refreshSeconds: 3600,
  timeoutMs: 8000,
  maxResponseBytes: 2_000_000,
  maxItems: 8,
} as const;
