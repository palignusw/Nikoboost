import { pageMetadata } from "@/lib/pageSeo";
import StructuredData from "@/components/Seo/StructuredData";
import Navbar from "@/components/Navbar/Navbar";
import Delves from "./Delves";
export const metadata = pageMetadata("delves");
export default function Page() {
  return (
    <>
      <StructuredData page="delves" />
      <Navbar />
      <Delves />
    </>
  );
}
