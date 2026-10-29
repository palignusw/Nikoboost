import Link from "next/link";
import { updateDate, updateSummary, type WowUpdate } from "@/lib/wowUpdates";
import styles from "./updates.module.scss";
export default function UpdateCard({ item }: { item: WowUpdate }) {
  return (
    <article className={styles.card} data-kind={item.kind}>
      <div className={styles.cardMeta}>
        <span className={item.kind === "hotfix" ? styles.hotfix : styles.patch}>{item.kind === "hotfix" ? "HOTFIXES" : "PATCH NOTES"}</span>
        <time dateTime={item.publishedAt}>Published {updateDate(item.publishedAt)}</time>
      </div>
      <h3><Link href={`/wow-updates#update-${item.id}`}>{item.title}<span aria-hidden="true">↗</span></Link></h3>
      <p>{updateSummary(item)}</p>
      <div className={styles.cardFooter}>
        <span>Read on NikoBoost · Midnight only</span>
        <span>PATCH NOTES · ENGLISH</span>
      </div>
      {Date.parse(item.updatedAt) - Date.parse(item.publishedAt) > 60_000 && <small className={styles.edited}>Source updated {updateDate(item.updatedAt)} · {item.updatedAt.slice(11, 16)} UTC</small>}
    </article>
  );
}
