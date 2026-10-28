"use client";
import { getBundleSaving } from "@/lib/bundlePricing";
import {
  wowSeason,
  serviceContent,
  delveSettings,
  delveFaqs as faqs,
  delveSpecialists,
  delveSources,
  servicePricing,
} from "@/data/season";

import Link from "next/link";
import Breadcrumbs from "@/components/Seo/Breadcrumbs";
import { useState } from "react";
import Image from "next/image";
import BookingDraftNotice from "@/components/BookingDraft/BookingDraftNotice";
import { useBookingDraft } from "@/components/BookingDraft/useBookingDraft";
import { parseDelveDraft } from "@/lib/bookingDrafts";
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
  tier: delveSettings.recommendedTier,
  runs: delveSettings.defaultRuns,
  region: "EU",
  format: "regular",
  delveId: "any",
  playerClass: "Mage",
};

export default function Delves() {
  const [config, setConfig] = useState<DelveConfig>(initial);
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("All zones");
  const [open, setOpen] = useState(false);
  const draft = useBookingDraft({
    service: "delves", value: config, dirty: JSON.stringify(config) !== JSON.stringify(initial),
    parse: parseDelveDraft, restore: setConfig, reset: () => setConfig(initial),
  });
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
    delveSpecialists.find((entry) => entry.kind === config.kind)?.orderTitle ??
    `Tier ${config.tier} · ${config.runs} ${config.runs === 1 ? "run" : "runs"}`;
  const maxTier = Math.max(...Object.keys(delvePrices).map(Number));
  const recommendedReward = delveRewards[delveSettings.recommendedTier];
  const singleRunExample = delvePrice({ tier: delveSettings.recommendedTier, runs: 1, delveId: "any" });
  const surchargePercent = servicePricing.delves.specific * 100;

  const patch = (value: Partial<DelveConfig>) => {
    if (draft.pending) return;
    setConfig((c) => ({ ...c, ...value }));
  };
  function chooseSpecial(kind: "nemesis" | "labyrinth") {
    if (draft.pending) return;
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
        <div
          className={styles.heroArt}
          style={
            {
              "--delve-backdrop": `url("${delveSettings.heroBackdrop}")`,
            } as import("react").CSSProperties
          }
          aria-hidden="true"
        />
        <div className={styles.wrap}>
          <Breadcrumbs page="delves" />
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.eyebrow}>
                {DELVES_SEASON} · PATCH {wowSeason.patch}
              </span>
              <h1>
                {serviceContent.delves.heading}
                <br />
                <span> {serviceContent.delves.accent}</span>
              </h1>
              <p>{serviceContent.delves.lead}</p>
              <div className={styles.priceExample} aria-label="Example gold price">
                <span>EXAMPLE · TIER {delveSettings.recommendedTier}</span>
                <strong>{gold(singleRunExample.total)} gold</strong>
                <small>1 regular run · any available Delve</small>
              </div>
              <a href="#delve-builder" className={styles.primary}>
                Choose your run <span>↗</span>
              </a>
              <div className={styles.heroTrust}>
                <span>Gold only</span>
                <span>Self-play</span>
                <span>EU & NA</span>
              </div>
            </div>
            <figure className={styles.heroVisual}>
              <Image
                src={delveArt[delveSettings.heroArt].src}
                alt={delveArt[delveSettings.heroArt].alt}
                fill
                sizes="(max-width: 800px) 100vw, 55vw"
                priority
              />
              <figcaption>
                <span>{wowSeason.expansion.toUpperCase()} DELVES</span>
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
            <h2 id="builder-heading">Build your Delves boost.</h2>
            <p>
              Choose a goal and number of runs. The total updates for your tier, location and bundle savings.
            </p>
          </div>
          <BookingDraftNotice {...draft} />
          <div className={styles.builderGrid} inert={draft.pending ? true : undefined}>
            <div className={styles.configurator}>
              <div className={styles.stepHeading}>
                <span>01</span>
                <div>
                  <h3>What brings you here?</h3>
                  <p>
                    Choose regular clears for weekly progress, or Bountiful runs if you have Coffer Keys.
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
                  <span>Regular clears · no Coffer Key needed</span>
                </button>
                <button
                  type="button"
                  aria-pressed={!quote && config.format === "bountiful"}
                  onClick={() => patch({ kind: "runs", format: "bountiful" })}
                >
                  <b>Bountiful runs</b>
                  <span>Vault progress and a Coffer with your own key</span>
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
                      <p>
                        Tier {delveSettings.recommendedTier} reaches the
                        standard weekly gearing ceiling.
                      </p>
                    </div>
                  </div>
                  <DelveSelect
                    label="Delve Tier"
                    value={String(config.tier)}
                    onChange={(v) => patch({ tier: Number(v) })}
                    options={Object.keys(delvePrices).map((t) => ({
                      value: t,
                      label: `Tier ${t}${Number(t) === delveSettings.recommendedTier ? " · Recommended for gear" : ""}`,
                      detail: `${gold(delvePrices[Number(t)])} gold per run`,
                    }))}
                  />
                  {config.tier > delveSettings.recommendedTier && (
                    <p className={styles.note}>
                      Tier {config.tier} adds challenge and progression; it does
                      not raise the standard {recommendedReward.vault} iLvl
                      Delve-based Vault reward.
                    </p>
                  )}
                  <span className={styles.fieldLabel}>Number of runs</span>
                  <div className={styles.bundles}>
                    {delveSettings.bundles.map((n) => (
                      <button
                        type="button"
                        key={n}
                        aria-pressed={config.runs === n}
                        onClick={() => patch({ runs: n })}
                      >
                        <strong>{n}</strong>
                        <span>
                          {delveSettings.vaultThresholds.filter(
                            (threshold) => n >= threshold,
                          ).length === 0
                            ? "Single run"
                            : `${delveSettings.vaultThresholds.filter((threshold) => n >= threshold).length} Vault ${delveSettings.vaultThresholds.filter((threshold) => n >= threshold).length === 1 ? "choice" : "choices"}`}
                        </span>
                        {getBundleSaving(n, servicePricing.delves.bundles) >
                          0 && (
                          <small>
                            Save{" "}
                            {getBundleSaving(n, servicePricing.delves.bundles) *
                              100}
                            %
                          </small>
                        )}
                      </button>
                    ))}
                  </div>
                  <label className={styles.customCount}>
                    Custom amount{" "}
                    <input
                      aria-label="Custom run count"
                      type="number"
                      min={1}
                      max={delveSettings.maxRuns}
                      value={config.runs}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (
                          Number.isInteger(n) &&
                          n >= 1 &&
                          n <= delveSettings.maxRuns
                        )
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
                        {surchargePercent}%.
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
                        detail: `${d.zone} · +${surchargePercent}%`,
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
                          : Math.min(
                              reward.coffer,
                              delveSettings.regularLootCap,
                            )}{" "}
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
                        <span>Specific Delve · {surchargePercent}%</span>
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
            <h2 id="locations-heading">Choose your Delve destination.</h2>
            <p>
              {delveLocations.length} regular {wowSeason.expansion} Delves, plus
              separate Nemesis and Labyrinth adventures. Bountiful status is
              checked in-game, not guessed here.
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
              Browse all {delveLocations.length} Delves. A named route adds{" "}
              {surchargePercent}% before bundle savings.
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
                      {"fresh" in d ? ` · Season ${wowSeason.number}` : ""}
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
            {delveSpecialists.map((entry) => (
              <article key={entry.kind}>
                <div className={styles.specialArt}>
                  <Image
                    src={delveArt[entry.art].src}
                    alt={delveArt[entry.art].alt}
                    fill
                    sizes="(max-width: 600px) 100vw, 50vw"
                  />
                </div>
                <span className={styles.eyebrow}>{entry.badge}</span>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => chooseSpecial(entry.kind)}
                >
                  {entry.action}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          id="rewards"
          className={styles.section}
          aria-labelledby="rewards-heading"
        >
          <div className={styles.heading}>
            <span className={styles.eyebrow}>KNOW WHAT YOU’RE RUNNING FOR</span>
            <h2 id="rewards-heading">Delve loot and Great Vault rewards.</h2>
            <p>
              Two different rewards, one sensible plan. Higher difficulty is not
              always better value.
            </p>
          </div>
          <div className={styles.guideGrid}>
            <article>
              <span>01 / AFTER THE RUN</span>
              <h3>Bountiful Coffer</h3>
              <strong>Up to {recommendedReward.coffer} iLvl</strong>
              <p>
                Standard Tier {delveSettings.recommendedTier}+ Coffer reference.
                Requires an active Bountiful Delve, remaining eligibility and
                your own Restored Coffer Key. Regular end loot is capped at{" "}
                {delveSettings.regularLootCap} iLvl.
              </p>
            </article>
            <article>
              <span>02 / AFTER THE RESET</span>
              <h3>Your World Vault</h3>
              <strong>Up to {recommendedReward.vault} iLvl</strong>
              <p>
                Delve-based reference at Tier {delveSettings.recommendedTier}+.{" "}
                {delveSettings.vaultThresholds.join(" / ")} qualifying
                activities unlock up to three choices. Your existing World
                activities count too. Pick one item from the entire Vault.
              </p>
            </article>
            <article>
              <span>03 / BEYOND GEARING</span>
              <h3>A greater challenge</h3>
              <strong>
                Tier {delveSettings.recommendedTier + 1}–{maxTier}
              </strong>
              <p>{delveSettings.challengeNote}</p>
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
                        {Number(t) === delveSettings.recommendedTier
                          ? " · Recommended"
                          : ""}
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
              Checked {wowSeason.checked} · {wowSeason.name} / {wowSeason.patch}
              . Prices are NikoBoost’s own gold tariffs, identical for EU and
              NA. They are not a claimed market average. Daily Bountiful status
              is confirmed in-game.
            </p>
            {delveSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
              >
                {source.label} ↗
              </a>
            ))}
          </div>
        </details>
        <footer className={styles.footer}>
          <Link href="/gold-prices">Compare gold prices ↗</Link>
          <Link href="/">← Back to NikoBoost</Link>
          <Link href="/#mythic">Looking for Mythic+ instead? ↗</Link>
          <Link href="/mythic-plus-rewards">Mythic+ rewards calculator ↗</Link>
        </footer>
      </div>
      {open && (
        <DelveReservation config={config} onSuccess={draft.clear} onClose={() => setOpen(false)} />
      )}
    </main>
  );
}
