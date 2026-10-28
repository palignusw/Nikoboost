import { updateDate, type UpdatesFeed } from "@/lib/wowUpdates";
import styles from "./updates.module.scss";
export default function SourceStatus({ feed }: { feed: UpdatesFeed }) {
  return <div className={styles.status} role="note" aria-label="Update source status">
    <span className={styles.statusDot} aria-hidden="true" />
    <div><strong>{feed.mode === "checking" ? "Saved Midnight summaries · checking for newer notes" : feed.mode === "saved" ? "Saved Midnight summaries · live check unavailable" : "Midnight notes · source checked"}</strong>
      <p>Last successful source check: <time dateTime={feed.checkedAt}>{updateDate(feed.checkedAt)} · {feed.checkedAt.slice(11, 16)} UTC</time>. Checks refresh about hourly when visited.</p>
    </div>
  </div>;
}
