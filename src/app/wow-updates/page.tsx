import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import UpdatesList from "@/components/WowUpdates/UpdatesList";
import savedUpdates from "@/data/wow-updates-snapshot.json";
import type { UpdatesSnapshot } from "@/lib/wowUpdates";
import UpdatesContent from "@/components/WowUpdates/UpdatesContent";
import { wowUpdatesConfig } from "@/data/wow-updates-config";
import { siteOrigin } from "@/lib/pageSeo";
import styles from "@/components/WowUpdates/updates.module.scss";

const title = "WoW Patch Notes & Hotfixes — Official Update Index";
const description = "Find the latest official WoW content update notes and hotfix notices, with publication dates, source links and a regularly refreshed list.";
export const metadata: Metadata = { title, description, alternates: { canonical: `${siteOrigin}/wow-updates` }, openGraph: { title, description, type: "website", url: `${siteOrigin}/wow-updates` } };
export default function WowUpdatesPage() {
  return <>
    <Navbar />
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">NikoBoost</Link><span aria-hidden="true">/</span><span aria-current="page">WoW Updates</span></nav>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}>PATCH NOTES & HOTFIXES</p><h1>Know what changed.<br /><span>Plan your next run.</span></h1><p>Official WoW update notices, collected in one place. Check the date, choose your category and open Blizzard’s full notes.</p></div>
        <aside className={styles.quickLinks} aria-label="Plan after reading"><p className={styles.eyebrow}>PUT THE NOTES INTO PRACTICE</p><strong>Ready for your next session?</strong><Link href="/tactics">Learn the dungeon bosses <span aria-hidden="true">↗</span></Link><Link href="/mythic-plus-rewards">Plan your weekly rewards <span aria-hidden="true">↗</span></Link><Link href="/delves">Explore Delves runs <span aria-hidden="true">↗</span></Link></aside>
      </header>
      <Suspense fallback={<UpdatesList feed={{ ...(savedUpdates as UpdatesSnapshot), mode: "checking" }} />}>
        <UpdatesContent />
      </Suspense>
      <section className={styles.explainer} aria-labelledby="updates-source-heading"><h2 id="updates-source-heading">Read the right notes for your game</h2><p>Patch-note cards link to Retail content updates. Shared hotfix posts may include Retail and several Classic editions: check the edition and section before applying a change to your character.</p><p>Blizzard sometimes edits an existing article instead of publishing a new one. The source-update date is shown when it differs from the publication date. This index links to the original notes; NikoBoost is not affiliated with Blizzard.</p><a href={wowUpdatesConfig.sourceUrl} target="_blank" rel="noopener noreferrer">Browse Blizzard’s full update index ↗</a></section>
    </main>
  </>;
}
