"use client";
import { useState } from "react";
import type { UpdatesFeed } from "@/lib/wowUpdates";
import UpdateCard from "./UpdateCard";
import SourceStatus from "./SourceStatus";
import styles from "./updates.module.scss";
export default function UpdatesList({ feed }: { feed: UpdatesFeed }) {
  const [filter, setFilter] = useState<"all" | "patch" | "hotfix">("all");
  const filtered = feed.items.filter((item) => filter === "all" || item.kind === filter);
  return <section aria-labelledby="updates-list-title">
    <SourceStatus feed={feed} />
    <div className={styles.listHeading}>
      <div><p className={styles.eyebrow}>OFFICIAL NOTES, IN ONE PLACE</p><h2 id="updates-list-title">Latest published updates</h2></div>
      <div className={styles.filters} role="group" aria-label="Filter updates">
        {([["all", "All updates"], ["patch", "Patch notes"], ["hotfix", "Hotfixes"]] as const).map(([value, label]) =>
          <button key={value} type="button" disabled={feed.mode === "checking"} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
    </div>
    <p className={styles.result} role="status">{filtered.length} {filtered.length === 1 ? "update" : "updates"} · newest publication first · dates in UTC</p>
    <div className={styles.grid} aria-label="Official updates list">
      {filtered.map((item) => <UpdateCard key={item.id} item={item} />)}
    </div>
    {!filtered.length && <div className={styles.empty}><h3>No entries in this category yet.</h3><p>Try all updates or read Blizzard’s official index.</p><button type="button" onClick={() => setFilter("all")}>Show all updates</button></div>}
  </section>;
}
