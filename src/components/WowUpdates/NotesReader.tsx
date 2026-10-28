"use client";
import { useState } from "react";
import type { WowUpdate } from "@/lib/wowUpdates";
import styles from "./updates.module.scss";

export default function NotesReader({ item }: { item: WowUpdate }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase("en-US");
  const sections = item.sections.map((section, index) => ({ ...section, index, lines: section.lines.filter((line) => !needle || `${section.date ?? ""} ${section.title} ${line.path.join(" ")} ${line.text}`.toLocaleLowerCase("en-US").includes(needle)) })).filter((section) => section.lines.length);
  return <div className={styles.reader}>
    <div className={styles.readerTools}>
      <label htmlFor={`search-${item.id}`}>Find a class, dungeon or change<input id={`search-${item.id}`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Druid, Delves, PvP…" maxLength={150} /></label>
      <p role="status">{sections.length} {sections.length === 1 ? "section" : "sections"}{needle ? " matching your search" : " · Midnight only"}</p>
    </div>
    {item.contentMode === "summary" && <p className={styles.summaryNotice} role="note">Saved NikoBoost summary. The complete notes will appear after a successful source refresh. This is not the full changelog.</p>}
    <div className={styles.readingLayout}>
      <nav className={styles.contents} aria-label="In these notes"><strong>IN THESE NOTES</strong>{sections.map((section) => <a key={section.index} href={`#note-${item.id}-${section.index}`}>{section.date && <small>{section.date}</small>}{section.title}</a>)}</nav>
      <div className={styles.notesBody}>
        {sections.map((section) => <section className={styles.noteSection} key={section.index} id={`note-${item.id}-${section.index}`}>
          {section.date && <p className={styles.noteDate}>{section.date}</p>}<h3>{section.title}</h3>
          <ul>{section.lines.map((line, index) => <li key={index}>{line.path.length > 0 && <strong className={styles.context}>{line.path.join(" › ")}</strong>}<span>{line.text}</span></li>)}</ul>
        </section>)}
        {!sections.length && <div className={styles.empty}><h3>No changes match “{query}”.</h3><p>Try an ability name or a shorter search.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
      </div>
    </div>
    <footer className={styles.readerFooter}><p>Source: Blizzard Entertainment. Midnight sections only; Classic, other editions, developer commentary, promotional blocks and media are excluded. Source wording is presented as plain text; original formatting may differ. Some hotfixes require a realm restart.</p><a href={item.url} target="_blank" rel="noopener noreferrer">Official source ↗</a></footer>
  </div>;
}
