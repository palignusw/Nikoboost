"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { tacticsDungeons, tacticPath } from "@/data/tactics-catalog";
import { isPublishedTactic } from "@/data/published-tactics";
import { tacticsPreview } from "@/data/tactics";
import { wowSeason } from "@/data/season";
import styles from "./catalog.module.scss";
const publishedDungeons = tacticsDungeons.filter((d) =>
  isPublishedTactic(d.id),
);
const normalize = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f’']/g, "")
    .toLowerCase();
export default function TacticsCatalog() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const count = publishedDungeons.reduce((n, d) => n + d.bosses.length, 0);
  const matches = publishedDungeons
    .filter((d) => filter === "all" || d.id === filter)
    .map((d) => ({
      ...d,
      bosses: d.bosses.filter((b) =>
        normalize(`${d.name} ${b.name} ${b.mechanic} ${b.kind}`).includes(
          normalize(query.trim()),
        ),
      ),
    }))
    .filter((d) => d.bosses.length);
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>
          {wowSeason.id === tacticsPreview.seasonId
            ? tacticsPreview.seasonName
            : "Archived season"}{" "}
          · MYTHIC+
        </p>
        <div className={styles.heading}>
          <div>
            <h1>
              Learn the boss.
              <br />
              <span>See your next move.</span>
            </h1>
            <p>
              Key mechanics, role priorities and interactive teaching diagrams.
              <br />
              Choose an encounter. Learn the response. Try the decision.
            </p>
          </div>
          <div className={styles.counts}>
            <div>
              <strong>{publishedDungeons.length}</strong>
              <span>DUNGEONS</span>
            </div>
            <div>
              <strong>{count}</strong>
              <span>ENCOUNTERS</span>
            </div>
          </div>
        </div>
        <div className={styles.notice}>
          A source-linked learning catalog. Each boss has one interactive
          key-mechanic study and additional reminders — not a simulation of
          every ability or exact game timing.
        </div>
        <div className={styles.filters}>
          <label>
            Find a boss or mechanic
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Boss, dungeon, ability…"
            />
          </label>
          <label>
            Dungeon
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All published dungeons</option>
              {publishedDungeons.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear filters ↺
          </button>
        </div>
        <p className={styles.results} role="status">
          {matches.reduce((n, d) => n + d.bosses.length, 0)} of {count}{" "}
          encounters
        </p>
        <div className={styles.grid}>
          {matches.map((d) => (
            <section key={d.id} className={styles.card} aria-label={d.name}>
              <div className={styles.cardHeader}>
                <Image
                  src={`/images/dungeons/${d.image}.jpg`}
                  alt=""
                  width={64}
                  height={64}
                />
                <div>
                  <span>
                    {String(
                      publishedDungeons.findIndex((x) => x.id === d.id) + 1,
                    ).padStart(2, "0")}{" "}
                    / DUNGEON
                  </span>
                  <h2>{d.name}</h2>
                  <small>
                    {d.bosses.length}{" "}
                    {d.bosses.length === 1 ? "encounter" : "encounters"}
                  </small>
                </div>
              </div>
              <ol>
                {d.bosses.map((b) => (
                  <li key={b.id}>
                    <Link href={tacticPath(d, b)}>
                      <div>
                        <strong>{b.name}</strong>
                        <span>{b.mechanic}</span>
                      </div>
                      <small>{b.kind}</small>
                      <b aria-hidden="true">↗</b>
                    </Link>
                  </li>
                ))}
              </ol>
              <a
                className={styles.source}
                href={`https://www.method.gg/guides/dungeons/${d.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Reference: Method / Tactyks ↗
              </a>
            </section>
          ))}
        </div>
        {!matches.length && (
          <div className={styles.empty}>
            <h2>No matching encounters.</h2>
            <p>Try another name or clear the filters.</p>
            <button
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Show all encounters
            </button>
          </div>
        )}
        <footer className={styles.footer}>
          <p>
            {publishedDungeons.length} published dungeon guides. More guides will appear here after
            review. Paired bosses and councils count as one encounter.
          </p>
          <a
            href="https://worldofwarcraft.blizzard.com/news/24294369/midnight-season-2-is-now-live"
            target="_blank"
            rel="noreferrer"
          >
            Blizzard season announcement ↗
          </a>
          <span>
            Diagrams are illustrative · follow the live encounter cues
          </span>
        </footer>
      </main>
    </div>
  );
}
