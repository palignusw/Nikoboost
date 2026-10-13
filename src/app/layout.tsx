import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.scss";

const geist = Geist({
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "NikoBoost — Mythic+ & Raid Runs",
  description:
    "Fast Mythic+ and Raid runs with experienced players.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}