"use client";
import { useEffect, useState } from "react";
import { updateDate, type UpdatesFeed } from "@/lib/wowUpdates";
import NotesReader from "./NotesReader";
import SourceStatus from "./SourceStatus";
import styles from "./updates.module.scss";
export default function UpdatesList({ feed }: { feed: UpdatesFeed }) {
  const [filter, setFilter] = useState<"all" | "patch" | "hotfix">("all");
  const [selected, setSelected] = useState(feed.items[0]?.id);
  const filtered = feed.items.filter((item) => filter === "all" || item.kind === filter);
  const active = filtered.find((item) => item.id === selected) ?? filtered[0];
  useEffect(() => {
    const fromHash = () => {
      const id = Number(window.location.hash.match(/^#update-(\d+)$/)?.[1]);
      const item = feed.items.find((item) => item.id === id);
      if (item) { setSelected(id); setFilter((previous) => previous === "all" || previous === item.kind ? previous : "all"); }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [feed.items]);
  return <section aria-labelledby="updates-list-title">
    <SourceStatus feed={feed} />
    <div className={styles.listHeading}>
      <div><p className={styles.eyebrow}>READ HERE · MIDNIGHT ONLY</p><h2 id="updates-list-title">Latest published updates</h2></div>
      <div className={styles.filters} role="group" aria-label="Filter updates">
        {([["all", "All updates"], ["patch", "Patch notes"], ["hotfix", "Hotfixes"]] as const).map(([value, label]) =>
          <button key={value} type="button" disabled={feed.mode === "checking"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
    </div>
    <p className={styles.result}>{filtered.length} updates · newest publication first · dates in UTC</p>
    <nav className={styles.updatePicker} aria-label="Choose Midnight update">
      {filtered.map((item) => <a key={item.id} href={`#update-${item.id}`} aria-current={active?.id === item.id ? "true" : undefined} onClick={() => setSelected(item.id)}><span>{item.kind === "hotfix" ? "HOTFIXES" : "PATCH NOTES"} · {updateDate(item.publishedAt)}</span><strong>{item.title}</strong></a>)}
    </nav>
    {active && <article id={`update-${active.id}`} className={styles.fullNotes} data-kind={active.kind} aria-label={active.title}>
      <header className={styles.notesHeader}><p className={styles.eyebrow}>WORLD OF WARCRAFT: MIDNIGHT</p><h2>{active.title}</h2><p>Published {updateDate(active.publishedAt)}{Date.parse(active.updatedAt) - Date.parse(active.publishedAt) > 60_000 ? ` · Source updated ${updateDate(active.updatedAt)} at ${active.updatedAt.slice(11, 16)} UTC` : ""}</p></header>
      <NotesReader key={active.id} item={active} />
    </article>}
    {!filtered.length && <div className={styles.empty}><h3>No entries in this category yet.</h3><button type="button" onClick={() => setFilter("all")}>Show all updates</button></div>}
  </section>;
}
