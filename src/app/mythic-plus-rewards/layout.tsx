import type { ReactNode } from "react";
import Navbar from "@/components/Navbar/Navbar";

export default function RewardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}