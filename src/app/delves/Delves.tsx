"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import DelveReservation from "./DelveReservation";
import { delveArt, featuredDelves } from "@/data/delveArt";
import { classArmor } from "@/data/mythicPlus";
import {
  DELVES_SEASON,
  delveLocations,
  delveName,
  delvePrice,
  delvePrices,
  delveRewards,
  gold,
  type DelveConfig,
} from "@/data/delves";
import DelveSelect from "./DelveSelect";
import styles from "./delves.module.scss";

const initial: DelveConfig = {
  service: "delves",
  kind: "runs",
  tier: 8,
  runs: 4,
  region: "EU",
  format: "regular",
  delveId: "any",
  playerClass: "Mage",
};
const faqs = [
  [
    "Which Tier should I choose?",
    "Tier 8 is the usual gearing target: the standard Bountiful Coffer and Delve-based World Vault item levels stop increasing there. Tiers 9–11 are for challenge and additional progression. Tier 11 Bountiful Delves also participate in the 12.1.5 Ascendant Venomstone system after the required unlock.",
  ],
  [
    "Do you provide Restored Coffer Keys?",
    "No. Bring one of your own Restored Coffer Keys for every Bountiful Coffer you want to open. We confirm the active Bountiful locations and your remaining eligibility before arranging the run. A regular clear does not include a Bountiful Coffer.",
  ],
  [
    "Does a bundle guarantee three items from the Vault?",
    "No. Completing 2, 4 or 8 qualifying World activities unlocks up to 1, 2 or 3 choices. You select one item from your entire Great Vault after the weekly reset. Your existing World progress may mean you need fewer runs.",
  ],
  [
    "Will you log into my account?",
    "No. Every fixed-price Delve run is self-play. You stay on your own character, join our group and follow the objectives. No password, account sharing or account registration is needed.",
  ],
  [
    "Can I order a solo Nemesis achievement?",
    "A grouped clear does not award solo-only achievements. Nemesis and Labyrinth requests are manual enquiries: tell us your exact goal, and we confirm what can be delivered through self-play and the gold price before any payment.",
  ],
  [
    "What happens after I reserve?",
    "Your request goes to the NikoBoost team. We contact you through BattleTag or Discord to confirm the route, tier access, availability, timing and in-game gold payment. Submitting the form does not take payment or guarantee an instant start.",
  ],
];

export default function Delves() {
  const [config, setConfig] = useState<DelveConfig>(initial);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("All zones");
  const [open, setOpen] = useState(false);
  const price = delvePrice(config);
  const reward = delveRewards[config.tier];
  const quote = config.kind !== "runs";
  const zones = ["All zones", ...new Set(delveLocations.map((d) => d.zone))];
  const filtered = delveLocations.filter(
    (d) =>
      (zone === "All zones" || d.zone === zone) &&
      `${d.name} ${d.zone}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const title =
    config.kind === "nemesis"
      ? "Azta’rec / Venomfall Deeps"
      : config.kind === "labyrinth"
        ? "Labyrinth of Kindo’jan"
        : `Tier ${config.tier} · ${config.runs} ${config.runs === 1 ? "run" : "runs"}`;
  const patch = (value: Partial<DelveConfig>) => {
    setConfig((c) => ({ ...c, ...value }));
  };
  function chooseSpecial(kind: "nemesis" | "labyrinth") {
    setConfig((c) => ({
      ...c,
      kind,
      runs: 1,
      format: "regular",
      delveId: "any",
    }));
    document
      .getElementById("delve-builder")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function book() {
    setOpen(true);
  }
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroArt} aria-hidden="true" />
        <div className={styles.wrap}>
          <Link href="/" className={styles.back}>
            NikoBoost / World of Warcraft / Delves
          </Link>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.eyebrow}>
                {DELVES_SEASON} · PATCH 12.1.5
              </span>
              <h1>
                Your next Delve.
                <br />
                <span>Done your way.</span>
              </h1>
              <p>
                Delves, on your terms. Pick your Tier, build a weekly bundle,
                and explore Midnight with an experienced player by your side.
              </p>
              <a href="#delve-builder" className={styles.primary}>
                Build your expedition <span>↗</span>
              </a>
              <div className={styles.heroTrust}>
                <span>Gold only</span>
                <span>Self-play</span>
                <span>EU & NA</span>
              </div>
            </div>
            <figure className={styles.heroVisual}>
              <Image
                src={delveArt["midnight-delves"].src}
                alt={delveArt["midnight-delves"].alt}
                fill
                sizes="(max-width: 800px) 100vw, 55vw"
                priority
              />
              <figcaption>
                <span>MIDNIGHT DELVES</span>
                <strong>
                  Into the unknown.
                  <br />
                  With a little backup.
                </strong>
                <small>Official Blizzard screenshot</small>
              </figcaption>
            </figure>
          </div>
        </div>
      </header>

      <div className={styles.wrap}>
        <nav className={styles.sectionNav} aria-label="Delves page">
          <a href="#delve-builder">Configure your run</a>
          <a href="#locations">Explore the Delves</a>
          <a href="#rewards">Understand rewards</a>
          <a href="#delve-faq">Questions</a>
        </nav>
        <section
          id="delve-builder"
          className={styles.section}
          aria-labelledby="builder-heading"
        >
          <div className={styles.heading}>
            <span className={styles.eyebrow}>YOUR NEXT EXPEDITION</span>
            <h2 id="builder-heading">A run that fits your goal.</h2>
            <p>
              Start with your goal. Your gold price updates as you configure.
            </p>
          </div>
          <div className={styles.builderGrid}>
            <div className={styles.configurator}>
              <div className={styles.stepHeading}>
                <span>01</span>
                <div>
                  <h3>What brings you here?</h3>
                  <p>
                    Weekly progress, treasure, or something more challenging.
                  </p>
                </div>
              </div>
              <div className={styles.goalCards}>
                <button
                  type="button"
                  aria-pressed={!quote && config.format === "regular"}
                  onClick={() => patch({ kind: "runs", format: "regular" })}
                >
                  <b>Weekly Vault</b>
                  <span>Qualifying clears, no Coffer Key needed</span>
                </button>
                <button
                  type="button"
                  aria-pressed={!quote && config.format === "bountiful"}
                  onClick={() => patch({ kind: "runs", format: "bountiful" })}
                >
                  <b>Bountiful runs</b>
                  <span>Use your own keys for extra treasure</span>
                </button>
              </div>
              {quote && (
                <div className={styles.notice}>
                  <strong>{title}</strong>
                  <p>
                    A specialist enquiry. We confirm scope and a gold quote
                    before payment. No solo-only achievement is included.
                  </p>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => {
                      setConfig(initial);
                    }}
                  >
                    Back to fixed-price Delves →
                  </button>
                </div>
              )}
              {!quote && (
                <>
                  <div className={styles.stepHeading}>
                    <span>02</span>
                    <div>
                      <h3>Choose your challenge</h3>
                      <p>Tier 8 reaches the standard weekly gearing ceiling.</p>
                    </div>
                  </div>
                  <DelveSelect
                    label="Delve Tier"
                    value={String(config.tier)}
                    onChange={(v) => patch({ tier: Number(v) })}
                    options={Object.keys(delvePrices).map((t) => ({
                      value: t,
                      label: `Tier ${t}${t === "8" ? " · Recommended for gear" : ""}`,
                      detail: `${gold(delvePrices[Number(t)])} gold per run`,
                    }))}
                  />
                  {config.tier > 8 && (
                    <p className={styles.note}>
                      Tier {config.tier} adds challenge and progression; it does
                      not raise the standard 305 iLvl Delve-based Vault reward.
                    </p>
                  )}
                  <span className={styles.fieldLabel}>Number of runs</span>
                  <div className={styles.bundles}>
                    {[1, 2, 4, 8].map((n) => (
                      <button
                        type="button"
                        key={n}
                        aria-pressed={config.runs === n}
                        onClick={() => patch({ runs: n })}
                      >
                        <strong>{n}</strong>
                        <span>
                          {n === 1
                            ? "Single run"
                            : n === 2
                              ? "1 Vault choice"
                              : n === 4
                                ? "2 Vault choices"
                                : "3 Vault choices"}
                        </span>
                        {n >= 4 && <small>Save {n === 4 ? 5 : 10}%</small>}
                      </button>
                    ))}
                  </div>
                  <label className={styles.customCount}>
                    Custom amount{" "}
                    <input
                      aria-label="Custom run count"
                      type="number"
                      min={1}
                      max={20}
                      value={config.runs}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isInteger(n) && n >= 1 && n <= 20)
                          patch({ runs: n });
                      }}
                    />
                  </label>
                  <p className={styles.note}>
                    Vault thresholds assume you start from zero World progress.
                    You choose one item after reset.
                  </p>
                  <div className={styles.stepHeading}>
                    <span>03</span>
                    <div>
                      <h3>Your route, your character</h3>
                      <p>
                        Any route keeps the lowest price. A specific Delve adds
                        5%.
                      </p>
                    </div>
                  </div>
                  <DelveSelect
                    label="Delve location"
                    value={config.delveId}
                    onChange={(v) => patch({ delveId: v })}
                    options={[
                      {
                        value: "any",
                        label: "Any available Delve",
                        detail:
                          config.format === "bountiful"
                            ? "An active Bountiful route · no surcharge"
                            : "Flexible route · best price",
                      },
                      ...delveLocations.map((d) => ({
                        value: d.id,
                        label: d.name,
                        detail: `${d.zone} · +5%`,
                      })),
                    ]}
                  />
                  {config.format === "bountiful" && (
                    <div className={styles.notice}>
                      <strong>One key for every Coffer.</strong>
                      <p>
                        Bring {config.runs} Restored Coffer{" "}
                        {config.runs === 1 ? "Key" : "Keys"}. Bountiful
                        locations rotate daily; we confirm an eligible route
                        before payment. Keys and specific loot are not included.
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className={styles.twoFields}>
                <DelveSelect
                  label="Region"
                  value={config.region}
                  onChange={(v) => patch({ region: v as "EU" | "NA" })}
                  options={[
                    { value: "EU", label: "Europe", detail: "EU realms" },
                    {
                      value: "NA",
                      label: "North America",
                      detail: "NA realms · same gold tariff",
                    },
                  ]}
                />
                <DelveSelect
                  label="Character class"
                  value={config.playerClass}
                  onChange={(v) => patch({ playerClass: v })}
                  options={Object.keys(classArmor).map((c) => ({
                    value: c,
                    label: c,
                  }))}
                />
              </div>
              <p className={styles.note}>
                Self-play is included. Stay on your character; no account access
                or role surcharge.
              </p>
            </div>
            <aside className={styles.summary} aria-labelledby="summary-heading">
              <span className={styles.eyebrow}>
                {quote ? "SPECIALIST REQUEST" : "YOUR EXPEDITION"}
              </span>
              <h3 id="summary-heading">{title}</h3>
              <p>
                {quote
                  ? "Self-play scope review"
                  : `${config.format === "bountiful" ? "Bountiful" : "Regular"} · ${delveName(config.delveId)}`}
              </p>
              <div className={styles.summaryChips}>
                <span>{config.region}</span>
                <span>{config.playerClass}</span>
                <span>Self-play</span>
              </div>
              {!quote && (
                <>
                  <div className={styles.rewardPreview}>
                    <div>
                      <span>
                        {config.format === "bountiful"
                          ? "Coffer with your key"
                          : "Regular end loot"}
                      </span>
                      <strong>
                        {config.format === "bountiful"
                          ? reward.coffer
                          : Math.min(reward.coffer, 272)}{" "}
                        <small>iLvl</small>
                      </strong>
                    </div>
                    <div>
                      <span>World Vault option</span>
                      <strong>
                        {reward.vault ?? "Check in-game"}{" "}
                        {reward.vault && <small>iLvl</small>}
                      </strong>
                    </div>
                  </div>
                  <p className={styles.note}>
                    Standard reward reference. Not a guarantee of a particular
                    item or bonus loot.
                  </p>
                </>
              )}
              <div className={styles.priceDetails}>
                {quote ? (
                  <p>
                    Labyrinth wings and Nemesis objectives need an individual
                    scope and quote. Tell us your goal in the request.
                  </p>
                ) : (
                  <>
                    <div>
                      <span>
                        {gold(price.unit)} × {config.runs}{" "}
                        {config.runs === 1 ? "run" : "runs"}
                      </span>
                      <b>{gold(price.base)} g</b>
                    </div>
                    {price.specific > 0 && (
                      <div>
                        <span>Specific Delve · 5%</span>
                        <b>+{gold(price.specific)} g</b>
                      </div>
                    )}
                    {price.discount > 0 && (
                      <div className={styles.saving}>
                        <span>Bundle saving · {price.discountRate * 100}%</span>
                        <b>−{gold(price.discount)} g</b>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={styles.total} aria-live="polite">
                <span>{quote ? "GOLD PRICE" : "TOTAL GOLD"}</span>
                <strong data-testid="delve-total">
                  {quote ? "Custom quote" : gold(price.total)}
                  {!quote && <small> gold</small>}
                </strong>
              </div>
              <button type="button" className={styles.primary} onClick={book}>
                {quote ? "Request a gold quote" : "Reserve this expedition"}
                <span>↗</span>
              </button>
              <p className={styles.summaryFoot}>
                No payment now. We confirm availability and arrange in-game gold
                payment with you.
              </p>
              <ul className={styles.included}>
                <li>Experienced player alongside you</li>
                <li>All eligible personal loot is yours</li>
                <li>BattleTag / Discord coordination</li>
              </ul>
            </aside>
          </div>
        </section>

        <section
          id="locations"
          className={styles.section}
          aria-labelledby="locations-heading"
        >
          <div className={styles.heading}>
            <span className={styles.eyebrow}>CHOOSE YOUR DESTINATION</span>
            <h2 id="locations-heading">A whole world beneath the surface.</h2>
            <p>
              12 regular Midnight Delves, plus separate Nemesis and Labyrinth
              adventures. Bountiful status is checked in-game, not guessed here.
            </p>
          </div>
          <div
            className={styles.featuredGallery}
            aria-label="Featured Delve destinations"
          >
            {featuredDelves.map((id) => {
              const destination = delveLocations.find((d) => d.id === id)!;
              return (
                <figure key={id} className={styles.featuredCard}>
                  <Image
                    src={delveArt[id].src}
                    alt={delveArt[id].alt}
                    fill
                    sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw"
                  />
                  <figcaption>
                    <span>{destination.zone}</span>
                    <h3>{destination.name}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        patch({ kind: "runs", delveId: id });
                        document
                          .getElementById("delve-builder")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Plan this expedition <span>↗</span>
                    </button>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className={styles.routeIntro}>
            <div>
              <span className={styles.eyebrow}>YOUR ROUTE, YOUR CHOICE</span>
              <h3>A reward goal? Keep the route flexible.</h3>
              <p>
                For weekly progress, you don’t need a particular destination.
                Choose a named Delve for exploration or a specific objective.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={!quote && config.delveId === "any"}
              onClick={() => patch({ kind: "runs", delveId: "any" })}
            >
              <span>Let us choose the route</span>
              <strong>No location surcharge</strong>
              <small>
                {!quote && config.delveId === "any"
                  ? "✓ Selected"
                  : "Choose flexible route →"}
              </small>
            </button>
          </div>
          <div className={styles.directoryHeading}>
            <h3>Have a destination in mind?</h3>
            <p>
              Browse all 12 Delves. A named route adds 5% before bundle savings.
            </p>
          </div>
          <div className={styles.filters}>
            <label>
              Find a Delve
              <input
                type="search"
                placeholder="Search name or zone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <DelveSelect
              label="Filter by zone"
              value={zone}
              onChange={setZone}
              options={zones.map((z) => ({ value: z, label: z }))}
            />
            <span aria-live="polite">{filtered.length} destinations</span>
          </div>
          <div className={styles.locationGrid}>
            {filtered.map((d) => (
              <article key={d.id} className={styles.locationCard}>
                <button
                  type="button"
                  aria-pressed={!quote && config.delveId === d.id}
                  onClick={() => patch({ kind: "runs", delveId: d.id })}
                >
                  <span className={styles.routeNumber}>{d.mark}</span>
                  <span className={styles.routeLabel}>
                    <span>
                      {d.zone}
                      {"fresh" in d ? " · Season 2" : ""}
                    </span>
                    <strong>{d.name}</strong>
                    <small>{d.theme}</small>
                  </span>
                  <span className={styles.routeCheck} aria-hidden="true">
                    {!quote && config.delveId === d.id ? "✓" : "+"}
                  </span>
                </button>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className={styles.notice}>
              No Delves match.{" "}
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setSearch("");
                  setZone("All zones");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className={styles.routeSelection}>
            <div aria-live="polite">
              <span>SELECTED ROUTE</span>
              <strong>
                {quote
                  ? "Choose a regular Delve above"
                  : delveName(config.delveId)}
              </strong>
              <p>
                {!quote && config.delveId !== "any"
                  ? `Location surcharge: ${gold(price.specific)} gold before bundle savings.`
                  : "We confirm the route and availability with you before payment."}
              </p>
            </div>
            <button
              type="button"
              className={styles.secondary}
              onClick={() =>
                document
                  .getElementById("delve-builder")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Continue to tier & pricing ↗
            </button>
          </div>
          <div className={styles.directoryHeading}>
            <span className={styles.eyebrow}>BEYOND REGULAR DELVES</span>
            <h3>Looking for a different challenge?</h3>
            <p>These adventures need a separate scope and gold quote.</p>
          </div>
          <div className={styles.specialGrid}>
            <article>
              <div className={styles.specialArt}>
                <Image
                  src={delveArt["venomfall-deeps"].src}
                  alt={delveArt["venomfall-deeps"].alt}
                  fill
                  sizes="(max-width: 600px) 100vw, 50vw"
                />
              </div>
              <span className={styles.eyebrow}>SEASON 2 NEMESIS</span>
              <h3>Venomfall Deeps</h3>
              <p>
                Face Azta’rec on the Coiled Isle. A dedicated encounter with its
                own objectives. Grouped completion does not grant solo-only
                rewards.
              </p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => chooseSpecial("nemesis")}
              >
                Discuss a Nemesis run ↗
              </button>
            </article>
            <article>
              <div className={styles.specialArt}>
                <Image
                  src={delveArt["labyrinth"].src}
                  alt={delveArt["labyrinth"].alt}
                  fill
                  sizes="(max-width: 600px) 100vw, 50vw"
                />
              </div>
              <span className={styles.eyebrow}>NEW IN PATCH 12.1.5</span>
              <h3>Labyrinth of Kindo’jan</h3>
              <p>
                A nine-chamber expedition in Zul’Aman. Request a wing or a
                longer adventure; scope and gold price are confirmed
                individually.
              </p>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => chooseSpecial("labyrinth")}
              >
                Plan a Labyrinth adventure ↗
              </button>
            </article>
          </div>
          <p className={styles.note}>
            Looking for Torment’s Rise / Nullaeus? That is the previous season’s
            Nemesis, not the current Season 2 target.
          </p>
        </section>

        <section
          id="rewards"
          className={styles.section}
          aria-labelledby="rewards-heading"
        >
          <div className={styles.heading}>
            <span className={styles.eyebrow}>KNOW WHAT YOU’RE RUNNING FOR</span>
            <h2 id="rewards-heading">The treasure. The weekly choice.</h2>
            <p>
              Two different rewards, one sensible plan. Higher difficulty is not
              always better value.
            </p>
          </div>
          <div className={styles.guideGrid}>
            <article>
              <span>01 / AFTER THE RUN</span>
              <h3>Bountiful Coffer</h3>
              <strong>Up to 295 iLvl</strong>
              <p>
                Standard Tier 8+ Coffer reference. Requires an active Bountiful
                Delve, remaining eligibility and your own Restored Coffer Key.
                Regular loot stops scaling after Tier 3.
              </p>
            </article>
            <article>
              <span>02 / AFTER THE RESET</span>
              <h3>Your World Vault</h3>
              <strong>Up to 305 iLvl</strong>
              <p>
                Delve-based reference at Tier 8+. 2 / 4 / 8 qualifying
                activities unlock up to three choices. Your existing World
                activities count too. Pick one item from the entire Vault.
              </p>
            </article>
            <article>
              <span>03 / BEYOND GEARING</span>
              <h3>A greater challenge</h3>
              <strong>Tier 9–11</strong>
              <p>
                Choose higher tiers for progression and challenge. Tier 11
                Bountiful Delves can award Ascendant Venomstones after the
                12.1.5 quest unlock. Bonus rewards depend on your progression.
              </p>
            </article>
          </div>
          <details className={styles.details}>
            <summary>
              Compare all Tier rewards and NikoBoost prices <span>+</span>
            </summary>
            <div className={styles.tableScroll}>
              <table>
                <caption>
                  Standard Bountiful Coffer / Delve-based Vault references.
                  Extra Journey, Bounty and Labyrinth rewards are separate.
                </caption>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Coffer with key</th>
                    <th>World Vault</th>
                    <th>Gold / run</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(delveRewards).map(([t, r]) => (
                    <tr key={t}>
                      <th>
                        Tier {t}
                        {t === "8" ? " · Recommended" : ""}
                      </th>
                      <td>{r.coffer} iLvl</td>
                      <td>{r.vault ? `${r.vault} iLvl` : "Verify in-game"}</td>
                      <td>{gold(delvePrices[Number(t)])} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <section className={styles.process}>
          <div>
            <span>01</span>
            <h3>Build your expedition</h3>
            <p>Choose your tier, destination and number of runs.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Confirm with us</h3>
            <p>We check access, rotation and timing before gold payment.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Join. Explore. Collect.</h3>
            <p>Play your own character and keep your eligible rewards.</p>
          </div>
        </section>
        <section id="delve-faq" className={styles.section}>
          <div className={styles.heading}>
            <span className={styles.eyebrow}>BEFORE YOU STEP INSIDE</span>
            <h2>Good questions. Clear answers.</h2>
          </div>
          {faqs.map(([q, a]) => (
            <details key={q} className={styles.details}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <details className={styles.details}>
          <summary>
            Season references & pricing notes<span>+</span>
          </summary>
          <div className={styles.sources}>
            <p>
              Delve screenshots © Blizzard Entertainment. Featured images
              follow Blizzard’s location captions.
            </p>
            <p>
              Checked 23 October 2026 · Midnight Season 2 / 12.1.5. Prices are
              NikoBoost’s own gold tariffs, identical for EU and NA. They are
              not a claimed market average. Daily Bountiful status is confirmed
              in-game.
            </p>
            <a
              href="https://news.blizzard.com/en-gb/article/24244644/unleash-your-skills-in-midnight-s-new-delves"
              target="_blank"
              rel="noreferrer"
            >
              Blizzard: original Midnight locations ↗
            </a>
            <a
              href="https://news.blizzard.com/en-gb/article/24294370/curse-of-ulatek-now-live-journey-to-the-coiled-isle"
              target="_blank"
              rel="noreferrer"
            >
              Blizzard: Season 2 additions ↗
            </a>
            <a
              href="https://news.blizzard.com/en-us/article/24304162/12-1-5-content-update-notes"
              target="_blank"
              rel="noreferrer"
            >
              Blizzard: Labyrinth & 12.1.5 rewards ↗
            </a>
            <a
              href="https://www.icy-veins.com/wow/delves-guide"
              target="_blank"
              rel="noreferrer"
            >
              Delve reward reference ↗
            </a>
          </div>
        </details>
        <footer className={styles.footer}>
          <Link href="/">← Back to NikoBoost</Link>
          <Link href="/#mythic">Looking for Mythic+ instead? ↗</Link>
        </footer>
      </div>
      {open && (
        <DelveReservation config={config} onClose={() => setOpen(false)} />
      )}
    </main>
  );
}
