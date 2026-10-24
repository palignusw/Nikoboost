import { pageMetadata } from "@/lib/pageSeo";
import StructuredData from "@/components/Seo/StructuredData";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/Navbar";

export const metadata = pageMetadata("rewards");

export default function RewardsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StructuredData page="rewards" />
      <Navbar />
      {children}
    </>
  );
}
