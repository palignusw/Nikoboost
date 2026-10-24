/** Use the largest eligible run threshold, regardless of configuration order. */
export function getBundleSaving(
  runs: number,
  bundles: readonly { runs: number; saving: number }[],
): number {
  let threshold = -1;
  let saving = 0;
  for (const bundle of bundles) {
    if (runs >= bundle.runs && bundle.runs > threshold) {
      threshold = bundle.runs;
      saving = bundle.saving;
    }
  }
  return saving;
}
