import { getWowUpdates } from "@/lib/wowUpdates.server";
import UpdatesList from "./UpdatesList";
export default async function UpdatesContent() {
  return <UpdatesList feed={await getWowUpdates()} />;
}
