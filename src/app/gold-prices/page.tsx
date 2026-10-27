import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Breadcrumbs from "@/components/Seo/Breadcrumbs";
import StructuredData from "@/components/Seo/StructuredData";
import { pageMetadata } from "@/lib/pageSeo";
import { servicePriceRows } from "@/lib/servicePriceTable";
import {
  serviceContent,
  servicePricing,
  vaultThresholds,
  delveSettings,
  wowSeason,
} from "@/data/season";
import styles from "./prices.module.scss";

export const metadata = pageMetadata("prices");
const gold = (n: number) => n.toLocaleString("en-US");
const percent = (n: number) => `${Math.round(n * 100)}%`;

function PriceTable({ service }: { service: "mythic" | "delves" }) {
  const mythic = service === "mythic";
  return (
    <div
      className={styles.tableWrap}
      tabIndex={0}
      role="region"
      aria-label={`${mythic ? "Mythic+" : "Delves"} gold price table`}
    >
      <table>
        <caption>
          {mythic ? "Mythic+" : "Delves"} package totals · in-game gold
          <span className={styles.scrollHint}>Swipe sideways to see all prices, if needed <span aria-hidden="true">↔</span></span>
        </caption>
        <thead>
          <tr>
            <th scope="col">{mythic ? "Key" : "Tier"}</th>
            {[1, 4, 8].map((n) => (
              <th scope="col" key={n}>
                {n} {n === 1 ? "run" : "runs"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {servicePriceRows(service).map((row) => (
            <tr key={row.level}>
              <th scope="row">
                {mythic ? "+" : "Tier "}
                {row.level}
              </th>
              {row.totals.map((total, i) => (
                <td key={i}>{gold(total)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GoldPrices() {
  const content = serviceContent.prices;
  return (
    <>
      <StructuredData page="prices" />
      <Navbar />
      <main className={styles.page}>
        <Breadcrumbs page="prices" />
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            {wowSeason.name} · EU & NA · SELF-PLAY
          </p>
          <h1>
            {content.heading} <span>{content.accent}</span>
          </h1>
          <p>{content.lead}</p>
          <div className={styles.notice}>
            Gold only. You play your own character. A reservation is a request
            to arrange a run; no payment is taken on this website.
          </div>
          <nav className={styles.links} aria-label="Price guide sections">
            <a href="#mythic-prices">Mythic+ prices ↓</a>
            <a href="#delve-prices">Delves prices ↓</a>
            <a href="#price-explained">What changes the total? ↓</a>
          </nav>
        </header>
        <div className={styles.tables}>
          <section id="mythic-prices" aria-labelledby="mythic-prices-heading">
            <p className={styles.eyebrow}>KEYSTONE RUNS</p>
            <h2 id="mythic-prices-heading">Mythic+ boost prices in gold</h2>
            <p>
              Standard Run, DPS, I Play, any dungeon and no loot traders.
              Package savings are already included. EU and NA currently use the
              same prices.
            </p>
            <PriceTable service="mythic" />
            <Link className={styles.button} href="/#mythic">
              Configure your Mythic+ run ↗
            </Link>
          </section>
          <section id="delve-prices" aria-labelledby="delve-prices-heading">
            <p className={styles.eyebrow}>DELVE RUNS</p>
            <h2 id="delve-prices-heading">Delves boost prices in gold</h2>
            <p>
              Any available destination, with package savings included. Regular
              and Bountiful use the same run price; Bountiful reward
              requirements still apply.
            </p>
            <PriceTable service="delves" />
            <Link className={styles.button} href="/delves#delve-builder">
              Configure your Delves run ↗
            </Link>
          </section>
        </div>
        <section id="price-explained" className={styles.section}>
          <p className={styles.eyebrow}>UNDERSTAND THE QUOTE</p>
          <h2>What changes your gold total?</h2>
          <div className={styles.cards}>
            <article>
              <h3>Mythic+ options</h3>
              <p>
                AFK / Minimal Participation adds{" "}
                {percent(servicePricing.mythic.afk)} to the base run price. Tank
                adds {percent(servicePricing.mythic.roles.tank)} and Healer adds{" "}
                {percent(servicePricing.mythic.roles.healer)}. You still control
                your character in every mode.
              </p>
              <p>
                Specific dungeons add {percent(servicePricing.mythic.specific)}{" "}
                only to the runs you allocate. Matching-armor loot traders add a
                percentage based on their count; drops and trade eligibility are
                not guaranteed.
              </p>
            </article>
            <article>
              <h3>Delve options</h3>
              <p>
                A specific destination adds{" "}
                {percent(servicePricing.delves.specific)} before the package
                discount. Selecting Bountiful does not itself add a surcharge.
              </p>
              <p>
                Nemesis and Labyrinth are specialist enquiries. The team
                confirms the objective, availability and gold quote separately;
                these tables do not price those encounters.
              </p>
            </article>
            <article>
              <h3>How savings work</h3>
              <p>
                The largest eligible package discount applies once, after
                extras. Discounts do not stack. The configurator shows the final
                total for your setup before you send a reservation.
              </p>
              <p>
                Mythic+ thresholds:{" "}
                {servicePricing.mythic.bundles
                  .slice()
                  .sort((a, b) => a.runs - b.runs)
                  .map((b) => `${b.runs}+ runs: ${percent(b.saving)}`)
                  .join(" · ")}
                . Delves:{" "}
                {servicePricing.delves.bundles
                  .slice()
                  .sort((a, b) => a.runs - b.runs)
                  .map((b) => `${b.runs}+ runs: ${percent(b.saving)}`)
                  .join(" · ")}
                .
              </p>
            </article>
          </div>
        </section>
        <section className={styles.section}>
          <p className={styles.eyebrow}>CHOOSE BY YOUR GOAL</p>
          <h2>Mythic+ or Delves: which should you book?</h2>
          <p>
            Choose Mythic+ when your goal is a specific dungeon, matching-armor
            loot opportunities or progress in the dungeon row of the Great
            Vault. Choose Delves when you want a Delve destination, Tier
            progression or the World Vault row. Neither service guarantees a
            particular item drop.
          </p>
          <p>
            The Mythic+ planner uses {vaultThresholds.join(" / ")} completed
            runs for its Vault choices. Delves use{" "}
            {delveSettings.vaultThresholds.join(" / ")} activity thresholds in
            the World row. Unlocking more choices does not mean you can claim
            all of them: choose your weekly reward in game.
          </p>
          <Link href="/mythic-plus-rewards">
            Compare Mythic+ rewards and plan your week →
          </Link>
        </section>
        <section className={styles.section}>
          <p className={styles.eyebrow}>BEFORE YOU RESERVE</p>
          <h2>Gold payment and booking questions</h2>
          <div className={styles.faq}>
            <details>
              <summary>Are these prices in euros or dollars?</summary>
              <p>
                No. Every table amount is in-game gold for NikoBoost runs. We do
                not take card payments on this website or sell gold.
              </p>
            </details>
            <details>
              <summary>What happens after I send a reservation?</summary>
              <p>
                We use your Discord or BattleTag contact to confirm the group,
                schedule and gold payment details before the run. Keep your
                order reference and download the PDF receipt from the
                confirmation screen. Sending the form does not guarantee an
                immediate start.
              </p>
            </details>
            <details>
              <summary>Will you log into my account?</summary>
              <p>
                No. All services here are self-play. You control your own
                character, including AFK / Minimal Participation setups. Never
                share your Battle.net password.
              </p>
            </details>
            <details>
              <summary>
                Does the displayed price guarantee a timed key or an item?
              </summary>
              <p>
                No. Loot drops, trade eligibility and dungeon timers depend on
                in-game conditions. Discuss any timing requirement with the team
                before proceeding. The configurator prices the selected run
                setup.
              </p>
            </details>
            <details>
              <summary>
                Why can the configurator show a different price?
              </summary>
              <p>
                These tables use the base setups described above. Role,
                participation, traders and specific destinations can change the
                total. Crest Farming is a separate Mythic+ goal; use its
                configurator for that quote.
              </p>
            </details>
          </div>
        </section>
        <footer className={styles.footer}>
          <span>
            Published by NikoBoost · Prices maintained in the shared service
            configuration.
          </span>
          <Link href="/">Back to NikoBoost →</Link>
        </footer>
      </main>
    </>
  );
}
