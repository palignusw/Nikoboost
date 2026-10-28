export type WowChangeKind = "buff" | "nerf" | "balance" | "fix";
export const changeLabels: Record<WowChangeKind, string> = { buff: "Buff", nerf: "Nerf", balance: "Balance", fix: "Fix" };

/** Conservative wording-based labels, from the player perspective. Never a strength/tier verdict. */
export function classifyWowChange(text: string, section: string): WowChangeKind | null {
  const fixed = /\b(?:fixed|resolved|corrected) (?:an? |the )?(?:issue|bug)|\b(?:issue|bug) (?:has been |was )?(?:fixed|resolved|corrected)\b/i.test(text);
  const tuning = /\b(?:increased|decreased|reduced)\b[^.!?]*\d|\b(?:by|to)\s+\d+(?:\.\d+)?%?\s*\(was\s+\d/i.test(text);
  if (!tuning) return fixed ? "fix" : null;
  // Enemy tuning, duration/proc changes and bug fixes with numerical changes need human context.
  if (fixed || /\b(?:enemy|enemies|boss|opponent)\b/i.test(text) || !/\bclasses\b|class tuning|player versus player/i.test(section)) return "balance";
  const directions = new Set<number>();
  for (const sentence of text.split(/(?<=[.!?])\s+(?=[A-Z])/)) {
    const direct = sentence.matchAll(/\b(damage (?:taken|received|reduction)|cooldown reduction|(?:mana|energy|rage|focus|resource) cost|cooldown|damage(?: done| dealt)?(?: bonus)?|healing(?: done)?|(?:absorb|absorption)(?: amount)?)\s+(?:is |has been |was )?(increased|decreased|reduced)\s+(?:by|to)\s+\d+(?:\.\d+)?/gi);
    let recognized = false;
    let directCount = 0;
    for (const match of direct) {
      const lowerIsBetter = /^(?:damage (?:taken|received)|cooldown$|.* cost$)/i.test(match[1]);
      const increase = match[2].toLowerCase() === "increased";
      directions.add((increase ? 1 : -1) * (lowerIsBetter ? -1 : 1));
      recognized = true;
      directCount++;
    }
    const adjustmentCount = [...sentence.matchAll(/\b(?:increased|decreased|reduced)\s+(?:by|to)\s+\d+(?:\.\d+)?/gi)].length;
    if (directCount > 0 && adjustmentCount > directCount) return "balance";
    const comparison = sentence.match(/\b(?:by|to)\s+(\d+(?:\.\d+)?)%?\s*\(was\s+(\d+(?:\.\d+)?)%?\)/i);
    if (!recognized && comparison) {
      const before = sentence.slice(0, comparison.index);
      const property = before.match(/\b(damage (?:taken|received|reduction)|cooldown reduction|(?:mana|energy|rage|focus|resource) cost|cooldown|damage|healing|absorption)\b/gi);
      if (property?.length === 1 && !/\b(?:enemy|enemies|boss|opponent)\b/i.test(sentence)) {
        const delta = Number(comparison[1]) - Number(comparison[2]);
        if (delta !== 0) directions.add(Math.sign(delta) * (/^(?:damage (?:taken|received)|cooldown$|.* cost$)/i.test(property[0]) ? -1 : 1));
        recognized = true;
      }
    }
    // Never hide an unrecognized numerical adjustment behind a confident buff/nerf label.
    if (!recognized && /\b(?:increased|decreased|reduced)\b[^.!?]*\d|\(was\s+\d/i.test(sentence)) return "balance";
  }
  if (directions.size !== 1) return "balance";
  return directions.has(1) ? "buff" : "nerf";
}
