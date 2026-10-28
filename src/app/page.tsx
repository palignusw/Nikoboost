import { Suspense } from "react";
import LatestUpdatesView from "@/components/WowUpdates/LatestUpdatesView";
import savedUpdates from "@/data/wow-updates-snapshot.json";
import type { UpdatesSnapshot } from "@/lib/wowUpdates";
import LatestUpdates from "@/components/WowUpdates/LatestUpdates";
import { pageMetadata } from "@/lib/pageSeo";
import StructuredData from "@/components/Seo/StructuredData";
import ServiceGuide from "@/components/ServiceGuide/ServiceGuide";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import MythicPlus from "@/components/MythicPlus/MythicPlus";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import FAQ from "@/components/FAQ/FAQ";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <StructuredData page="home" />
      <Navbar />

      <main>
        <Hero />

        <MythicPlus />

        <ServiceGuide />

        <Suspense fallback={<LatestUpdatesView feed={{ ...(savedUpdates as UpdatesSnapshot), mode: "checking" }} />}>
          <LatestUpdates />
        </Suspense>

        <HowItWorks />

        <FAQ />
      </main>
    </>
  );
}
