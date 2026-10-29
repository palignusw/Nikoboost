import "server-only";
import { unstable_cache } from "next/cache";
import { wowUpdatesConfig } from "@/data/wow-updates-config";
import savedSnapshot from "@/data/wow-updates-snapshot.json";
import { fetchWowUpdates, resolveUpdates, type UpdatesSnapshot } from "./wowUpdates";

// Use the persistent Data Cache for a validated snapshot, not a process-local variable.
// A failed background refresh throws here, so Next retains the last successful value.
// The saved, explicitly labelled snapshot is used only when no cached result is available.
const readVerifiedSnapshot = unstable_cache(
  () => fetchWowUpdates(),
  ["midnight-notes-v2", wowUpdatesConfig.sourceUrl],
  { revalidate: wowUpdatesConfig.refreshSeconds, tags: ["official-wow-updates"] },
);
export function getWowUpdates() {
  return resolveUpdates(readVerifiedSnapshot, savedSnapshot as UpdatesSnapshot);
}
