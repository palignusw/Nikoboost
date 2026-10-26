/** Add a dungeon here only after its dedicated guide has been reviewed. */
export const publishedTactics = ["altar-of-fangs", "den-of-nalorakk"] as const;
export const tacticsPublishedAt = "2026-10-26";
export function isPublishedTactic(dungeon: string) {
  return publishedTactics.some((id) => id === dungeon);
}
