import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import { siteOrigin } from "@/lib/pageSeo";
import { wowSeason } from "@/data/season";
import { tacticsDungeons } from "@/data/tactics-catalog";
import { isPublishedTactic } from "@/data/published-tactics";
import styles from "./guide.module.scss";

const path = "/mythic-plus-guide";
const title = "WoW Mythic+ Beginner Guide: Keys, Timer & Rewards";
const description =
  "Learn how WoW Mythic+ keystones work, prepare for your first dungeon, understand the timer and explore boss tactics and rewards.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${siteOrigin}${path}` },
  openGraph: {
    type: "article",
    title,
    description,
    url: `${siteOrigin}${path}`,
  },
};
const steps = [
  {
    number: "01",
    title: "Find a group",
    text: "Mythic+ is a five-player dungeon: one tank, one healer and three damage dealers. Agree on the dungeon and keystone level before entering.",
  },
  {
    number: "02",
    title: "Start the keystone",
    text: "Enter the dungeon on Mythic difficulty. The player with the appropriate keystone places it in the Font of Power to start the run.",
  },
  {
    number: "03",
    title: "Complete the objectives",
    text: "Defeat every required boss and the required share of enemy forces. The timer measures how long the group takes; deaths add a time penalty.",
  },
  {
    number: "04",
    title: "Collect and plan",
    text: "Open the end-of-dungeon chest after completing the run, then check your weekly Great Vault progress. Rewards depend on the key and your results.",
  },
];
export default function MythicPlusGuide() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Mythic+ beginner guide</span>
        </nav>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>YOUR FIRST KEY · {wowSeason.name}</p>
            <h1>
              Mythic+ made <span>clear.</span>
            </h1>
            <p className={styles.lead}>
              A practical beginner’s guide to WoW Mythic+ keystones: how a run
              works, what the timer means and how to prepare for your group.
            </p>
            <div className={styles.actions}>
              <a href="#first-run">
                Start with the basics <span aria-hidden="true">↓</span>
              </a>
              <Link href="/tactics">
                Explore boss tactics <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <span>THE SHORT VERSION</span>
            <strong>5 players. 1 key. A dungeon to complete.</strong>
            <p>
              Plan your route, watch boss mechanics and work together to finish
              the run.
            </p>
            <div>
              <span>01 Tank</span>
              <span>01 Healer</span>
              <span>03 DPS</span>
            </div>
          </aside>
        </header>
        <section id="first-run" className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>START HERE</p>
            <h2>How a Mythic+ run works</h2>
            <p>
              Think of the keystone as the ticket that sets the dungeon and its
              difficulty.
            </p>
          </div>
          <div className={styles.steps}>
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.split}>
          <article>
            <p className={styles.eyebrow}>THE KEYSTONE</p>
            <h2>What does +2 or +10 mean?</h2>
            <p>
              The number is the keystone level. Higher levels increase enemy
              health and damage, making mechanics and coordination more
              demanding. Start at a level your group can handle and work up as
              you get comfortable.
            </p>
            <p>
              Only one player needs to insert a keystone for the group. The
              active key determines which dungeon and level you play.
            </p>
          </article>
          <article>
            <p className={styles.eyebrow}>THE TIMER</p>
            <h2>What happens if we run out of time?</h2>
            <p>
              You can continue and finish the dungeon after the timer expires.
              Finishing on time upgrades the keystone; a run completed over time
              can lower it, subject to the minimum key level. Rewards and rating
              depend on the result, so check the current season’s details.
            </p>
            <Link href="/mythic-plus-rewards">
              Compare rewards and Vault options{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>BEFORE YOU ENTER</p>
            <h2>Your first-key checklist</h2>
          </div>
          <div className={styles.checklist}>
            <div>
              <strong>Know your role</strong>
              <p>
                Tank leads and controls enemies, healer keeps the group alive,
                and damage dealers focus priority targets. Everyone should
                interrupt or control dangerous casts when their abilities allow
                it.
              </p>
            </div>
            <div>
              <strong>Look up the bosses</strong>
              <p>
                You do not need to memorise everything. Learn the most dangerous
                mechanics and what your role should do before the pull.
              </p>
            </div>
            <div>
              <strong>Bring the basics</strong>
              <p>
                Repair your gear, bring suitable consumables and check your
                talents and keybinds. Tell the group if it is your first time in
                a dungeon.
              </p>
            </div>
            <div>
              <strong>Watch the floor and casts</strong>
              <p>
                Move out of marked danger, interrupt assigned abilities and stay
                close enough for your healer. Ask before the pull if a mechanic
                is unclear.
              </p>
            </div>
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>PICK A DUNGEON</p>
            <h2>Learn the bosses before your run</h2>
            <p>
              Open a field guide for role advice, illustrated mechanics and
              practice decisions.
            </p>
          </div>
          <div className={styles.dungeons}>
            {tacticsDungeons
              .filter((d) => isPublishedTactic(d.id))
              .map((d, i) => (
                <Link key={d.id} href={`/tactics/${d.id}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{d.name}</strong>
                  <small>{d.bosses.length} boss guides</small>
                  <b aria-hidden="true">↗</b>
                </Link>
              ))}
          </div>
        </section>
        <section className={styles.next}>
          <div>
            <p className={styles.eyebrow}>YOUR NEXT STEP</p>
            <h2>Plan the run that suits you.</h2>
            <p>
              Compare dungeon and Great Vault rewards, or review a self-play run
              request and its price in gold.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/mythic-plus-rewards">Open rewards planner ↗</Link>
            <Link href="/#mythic">Configure a run ↗</Link>
          </div>
        </section>
        <footer className={styles.sources}>
          <p>
            Mechanics and rewards can change with a season or patch. This guide
            was reviewed on 27 October 2026; check the current in-game tooltip
            and official updates for changes.
          </p>
          <p>
            Sources:{" "}
            <a
              href="https://worldofwarcraft.blizzard.com/en-us/news/24294369/"
              target="_blank"
              rel="noreferrer"
            >
              Blizzard · Midnight Season 2
            </a>{" "}
            ·{" "}
            <a
              href="https://www.icy-veins.com/wow/midnight-mythic-season-2-guide"
              target="_blank"
              rel="noreferrer"
            >
              Icy Veins · Season 2 guide
            </a>
          </p>
        </footer>
      </main>
    </>
  );
}
