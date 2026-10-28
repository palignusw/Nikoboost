import { updateDate, updateSummary, type WowUpdate } from "@/lib/wowUpdates";
import styles from "./updates.module.scss";
export default function UpdateCard({ item }: { item: WowUpdate }) {
  return (
    <article className={styles.card} data-kind={item.kind}>
      <div className={styles.cardMeta}>
        <span className={item.kind === "hotfix" ? styles.hotfix : styles.patch}>{item.kind === "hotfix" ? "HOTFIXES" : "PATCH NOTES"}</span>
        <time dateTime={item.publishedAt}>Published {updateDate(item.publishedAt)}</time>
      </div>
      <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<span aria-hidden="true">↗</span></a></h3>
      <p>{updateSummary(item)}</p>
      <div className={styles.cardFooter}>
        <span>{item.scope === "shared" ? "May include Retail & Classic · check your edition" : "Retail content update"}</span>
        <span>BLIZZARD · ENGLISH</span>
      </div>
      {Date.parse(item.updatedAt) - Date.parse(item.publishedAt) > 60_000 && <small className={styles.edited}>Source updated {updateDate(item.updatedAt)} · {item.updatedAt.slice(11, 16)} UTC</small>}
    </article>
  );
}
