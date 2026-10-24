import { mythicBasePrices, delvePrices, servicePricing } from "@/data/season";
import { getBundleSaving } from "./bundlePricing";
import { delvePrice } from "@/data/delves";

/** The same base-minus-rounded-discount order used by the order API. */
export function mythicTableTotal(level: number, runs: number) {
  const base = mythicBasePrices[level] * runs;
  return (
    base -
    Math.round(base * getBundleSaving(runs, servicePricing.mythic.bundles))
  );
}
export function servicePriceRows(service: "mythic" | "delves") {
  const prices = service === "mythic" ? mythicBasePrices : delvePrices;
  return Object.keys(prices)
    .map(Number)
    .sort((a, b) => a - b)
    .map((level) => ({
      level,
      totals: [1, 4, 8].map((runs) =>
        service === "mythic"
          ? mythicTableTotal(level, runs)
          : delvePrice({ tier: level, runs, delveId: "any" }).total,
      ),
    }));
}
