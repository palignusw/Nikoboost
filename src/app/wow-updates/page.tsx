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

const title = "Midnight Patch Notes & Hotfixes — Read on NikoBoost";
const description = "Read World of Warcraft: Midnight patch notes and hotfixes on NikoBoost. Browse changes by update and search for your class, dungeon or ability.";
export const metadata: Metadata = { title, description, alternates: { canonical: `${siteOrigin}/wow-updates` }, openGraph: { title, description, type: "website", url: `${siteOrigin}/wow-updates` } };
export default function WowUpdatesPage() {
  return <>
    <Navbar />
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">NikoBoost</Link><span aria-hidden="true">/</span><span aria-current="page">WoW Updates</span></nav>
      <header className={styles.hero}>
        <div><p className={styles.eyebrow}>MIDNIGHT PATCH NOTES & HOTFIXES</p><h1>Know what changed.<br /><span>Plan your next run.</span></h1><p>Midnight changes, ready to read right here. Choose an update, jump to a section or search for your class. No Classic notes mixed in.</p></div>
        <aside className={styles.quickLinks} aria-label="Plan after reading"><p className={styles.eyebrow}>PUT THE NOTES INTO PRACTICE</p><strong>Ready for your next session?</strong><Link href="/tactics">Learn the dungeon bosses <span aria-hidden="true">↗</span></Link><Link href="/mythic-plus-rewards">Plan your weekly rewards <span aria-hidden="true">↗</span></Link><Link href="/delves">Explore Delves runs <span aria-hidden="true">↗</span></Link></aside>
      </header>
      <Suspense fallback={<UpdatesList feed={{ ...(savedUpdates as UpdatesSnapshot), mode: "checking" }} />}>
        <UpdatesContent />
      </Suspense>
      <section className={styles.explainer} aria-labelledby="updates-source-heading"><h2 id="updates-source-heading">About these Midnight notes</h2><p>This reader includes World of Warcraft: Midnight updates only. Shared Blizzard hotfix articles are filtered by edition and date so Classic changes do not appear in the Midnight sections.</p><p>Blizzard sometimes edits an existing article instead of publishing a new one. The source-update date is shown when it differs from the publication date. You can read the changes on this page; the original source is linked for reference. NikoBoost is not affiliated with Blizzard.</p><a href={wowUpdatesConfig.sourceUrl} target="_blank" rel="noopener noreferrer">Browse Blizzard’s full update index ↗</a></section>
    </main>
  </>;
}
