import { getWowUpdates } from "@/lib/wowUpdates.server";
import LatestUpdatesView from "./LatestUpdatesView";
export default async function LatestUpdates() {
  return <LatestUpdatesView feed={await getWowUpdates()} />;
}
