import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/Navbar";
import ServiceLink from "./ServiceLink";

export default function TacticsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        {children}
        <ServiceLink />
      </div>
    </>
  );
}
