import Link from "next/link";
import type { UpdatesFeed } from "@/lib/wowUpdates";
import UpdateCard from "./UpdateCard";
import SourceStatus from "./SourceStatus";
import styles from "./updates.module.scss";
export default function LatestUpdatesView({ feed }: { feed: UpdatesFeed }) {
  return <section className={styles.homeSection} aria-labelledby="latest-updates-heading">
    <div className={styles.listHeading}><div><p className={styles.eyebrow}>BEFORE YOUR NEXT RUN</p><h2 id="latest-updates-heading">Latest Midnight updates</h2></div><Link className={styles.textLink} href="/wow-updates">All Midnight patch notes <span aria-hidden="true">↗</span></Link></div>
    <p className={styles.intro}>Read Midnight patch notes and hotfixes right here before your next key or Delve.</p>
    <div className={`${styles.grid} ${styles.homeGrid}`}>{feed.items.slice(0, 3).map((item) => <UpdateCard key={item.id} item={item} />)}</div>
    <SourceStatus feed={feed} />
  </section>;
}
