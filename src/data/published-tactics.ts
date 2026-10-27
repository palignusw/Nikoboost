/** Add a dungeon here only after its dedicated guide has been reviewed. */
export const publishedTactics = [
  "altar-of-fangs",
  "murder-row",
  "den-of-nalorakk",
  "the-blinding-vale",
  "voidscar-arena",
  "kings-rest",
  "temple-of-sethraliss",
  "ruby-life-pools",
] as const;
export const tacticsPublishedAt = "2026-10-27";
export function isPublishedTactic(dungeon: string) {
  return publishedTactics.some((id) => id === dungeon);
}
