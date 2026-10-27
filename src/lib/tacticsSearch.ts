const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f’']/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

/** Match every search word, regardless of its position in the encounter text. */
export function matchesTacticsSearch(text: string, query: string) {
  const haystack = normalize(text);
  return normalize(query).split(/\s+/).every((word) => haystack.includes(word));
}
