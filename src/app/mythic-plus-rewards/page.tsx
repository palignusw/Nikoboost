"use client";
import {
  mythicDefaults,
  mythicExample,
  delveSources,
  serviceContent,
  delveSettings,
} from "@/data/season";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Seo/Breadcrumbs";
import {
  mythicRewards as rewards,
  getMythicReward,
  vaultThresholds,
  wowSeason,
  type CrestType,
} from "@/data/wowSeason";
import {
  decodePlan,
  encodePlan,
  restoreWeek,
  vaultFor,
  WEEK_STORAGE_KEY,
  MAX_PLANNER_RUNS,
  type PlannerWeek,
} from "@/lib/rewardsPlanner";
import WeeklyGoal from "./components/WeeklyGoal";
import RewardSelect from "./components/RewardSelect";
import styles from "./page.module.scss";

type View = "vault" | "compare" | "crests";
const subscribeHydration = () => () => {};
const emptyWeek = (): PlannerWeek => ({ completed: [], planned: [] });
const keyOptions = rewards.map((row) => ({
  value: row.level,
  label: `+${row.level} Keystone`,
  detail: `${row.dungeon} loot · ${row.vault} Vault`,
}));
const crestTypes: CrestType[] = ["Champion", "Hero", "Myth"];
const rowFor = (key: number) => getMythicReward(key)!;

function readSavedWeek(): PlannerWeek {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(WEEK_STORAGE_KEY) ?? "null",
    );
    if (
      saved &&
      typeof saved === "object" &&
      "season" in saved &&
      saved.season !== wowSeason.id
    )
      return emptyWeek();
    const restored = restoreWeek(saved);
    if (restored) return restored;
    // Old saves were simulations, so migrate them as planned, never completed.
    const legacy: unknown = JSON.parse(
      localStorage.getItem("nikoboost:mythic-plus:vault-planner:v1") ?? "null",
    );
    if (
      legacy &&
      typeof legacy === "object" &&
      "runs" in legacy &&
      Array.isArray(legacy.runs)
    ) {
      return (
        restoreWeek({ completed: [], planned: legacy.runs }) ?? emptyWeek()
      );
    }
  } catch {
    /* Storage is optional. */
  }
  return emptyWeek();
}

export default function RewardsExplorer() {
  const [view, setView] = useState<View>("vault");
  const [week, setWeek] = useState<PlannerWeek>(emptyWeek);
  const [loaded, setLoaded] = useState(false);
  const [undo, setUndo] = useState<PlannerWeek | null>(null);
  const [example, setExample] = useState(false);
  const [undoExample, setUndoExample] = useState(false);
  const [shared, setShared] = useState<PlannerWeek | null>(null);
  const [notice, setNotice] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [level, setLevel] = useState(mythicDefaults.key);
  const [quantity, setQuantity] = useState(1);
  const [compareA, setCompareA] = useState(mythicDefaults.key);
  const [compareB, setCompareB] = useState(mythicDefaults.compareKey);
  const [showTable, setShowTable] = useState(false);
  const [crestType, setCrestType] = useState<CrestType>("Myth");
  const [crestGoal, setCrestGoal] = useState("120");
  const [currentCrests, setCurrentCrests] = useState("0");
  const [farmKey, setFarmKey] = useState(mythicDefaults.farmKey);
  const [customYield, setCustomYield] = useState("");
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  if (hydrated && !loaded) {
    setWeek(readSavedWeek());
    const query = new URLSearchParams(window.location.search);
    if (query.get("season") && query.get("season") !== wowSeason.id) {
      setNotice(
        "This link belongs to a different season. Your saved week is unchanged.",
      );
    } else if (query.has("plan") || query.has("done")) {
      const planned = decodePlan(query.get("plan") ?? "");
      const completed = decodePlan(query.get("done") ?? "");
      if (
        planned &&
        completed &&
        planned.length + completed.length <= MAX_PLANNER_RUNS
      )
        setShared({ planned, completed });
      else
        setNotice("This shared link is invalid. Your saved week is unchanged.");
    }
    if (window.location.hash === "#crest-calculator") setView("crests");
    if (
      ["#reward-explorer", "#reward-reference"].includes(window.location.hash)
    )
      setView("compare");
    if (window.location.hash === "#reward-reference") setShowTable(true);
    setLoaded(true);
  }

  useEffect(() => {
    if (!loaded || example) return;
    try {
      localStorage.setItem(
        WEEK_STORAGE_KEY,
        JSON.stringify({ ...week, season: wowSeason.id }),
      );
    } catch {
      /* The tool remains usable without storage. */
    }
  }, [week, loaded, example]);

  const allRuns = [...week.completed, ...week.planned];
  const currentVault = vaultFor(week.completed);
  const plannedVault = vaultFor(allRuns);
  const candidate = Array<number>(quantity).fill(level);
  const nextVault = vaultFor([...allRuns, ...candidate]);
  const changed = nextVault.flatMap((row, index) =>
    row && (!plannedVault[index] || row.vault > plannedVault[index]!.vault)
      ? [
          `choice ${index + 1} ${plannedVault[index] ? "to" : "at"} ${row.vault} iLvl`,
        ]
      : [],
  );
  const selected = rowFor(level);
  const limitReached = allRuns.length + quantity > MAX_PLANNER_RUNS;
  const a = rowFor(compareA);
  const b = rowFor(compareB);
  const farmOptions = rewards.filter((row) => row.crest === crestType);
  const farm =
    farmOptions.find((row) => row.level === farmKey) ?? farmOptions[0];
  const bounded = (text: string) =>
    Math.min(100000, Math.max(0, Number(text) || 0));
  const remaining = Math.max(0, bounded(crestGoal) - bounded(currentCrests));
  const yieldPerRun =
    customYield === ""
      ? farm.crestAmount
      : Math.min(1000, Math.max(1, Number(customYield) || 1));
  const farmRuns = Math.ceil(remaining / yieldPerRun);

  function update(next: PlannerWeek, message = "Your week has been updated.") {
    setUndo(week);
    setUndoExample(example);
    setWeek(next);
    setNotice(message);
    setShareLink("");
  }
  function addPlanned(keys: number[]) {
    if (allRuns.length + keys.length > MAX_PLANNER_RUNS) return;
    update(
      { ...week, planned: [...week.planned, ...keys] },
      `${keys.length} ${keys.length === 1 ? "run added" : "runs added"} to your plan. Completed progress is unchanged.`,
    );
  }
  function showWeek() {
    setView("vault");
    requestAnimationFrame(() =>
      document
        .getElementById("weekly-planner")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  function closeShared() {
    setShared(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("plan");
    url.searchParams.delete("done");
    url.searchParams.delete("season");
    window.history.replaceState(window.history.state, "", url);
  }
  async function shareWeek() {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("season", wowSeason.id);
    url.searchParams.set("plan", encodePlan(week.planned));
    if (week.completed.length)
      url.searchParams.set("done", encodePlan(week.completed));
    setShareLink(url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice(
        "Week link copied. It contains key levels only, no character details.",
      );
    } catch {
      setNotice("Copy your week link below.");
    }
  }

  return (
    <main className={`${styles.page} ${styles.rewardsV2}`}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.container}>
        <Breadcrumbs page="rewards" />
        <header className={styles.newHero}>
          <div className={styles.kicker}>
            <span className={styles.statusDot} />
            {wowSeason.name.toUpperCase()} · FREE PLAYER TOOLS
          </div>
          <h1>
            {serviceContent.rewards.heading}{" "}
            <span>{serviceContent.rewards.accent}</span>
          </h1>
          <p>{serviceContent.rewards.lead}</p>
          <span className={styles.heroFootnote}>
            No login required. Free to use. Your week stays in this browser.
          </span>
        </header>

        <nav className={styles.viewTabs} aria-label="Rewards tools">
          {(
            [
              ["vault", "01", "Weekly Vault", "What should I run next?"],
              ["compare", "02", "Compare rewards", "Is a higher key worth it?"],
              ["crests", "03", "Crest calculator", "How many runs do I need?"],
            ] as const
          ).map(([id, number, title, hint]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              aria-controls={`tool-${id}`}
              onClick={() => {
                setView(id);
                setNotice("");
              }}
            >
              <span className={styles.tabNumber}>{number}</span>
              <span>
                <strong>{title}</strong>
                <small>{hint}</small>
              </span>
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </nav>
        <p className={styles.planStatus} role="status">
          {notice}
        </p>
        {shared && (
          <section
            className={styles.sharedBanner}
            aria-label="Shared plan preview"
          >
            <div>
              <strong>Someone shared their week with you</strong>
              <p>
                {shared.completed.length} completed · {shared.planned.length}{" "}
                planned. Import to explore it. Your current week can be restored
                with Undo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                update(shared, "Shared week imported.");
                setExample(false);
                closeShared();
                setView("vault");
              }}
            >
              Import shared plan
            </button>
            <button type="button" onClick={closeShared}>
              Dismiss
            </button>
          </section>
        )}

        <div id="tool-vault" hidden={view !== "vault"}>
          <div className={styles.workspaceIntro}>
            <h2>Build your weekly Vault plan.</h2>
            <p>
              Add your completed keys, choose a reward goal, then see exactly
              how many more runs you need. Planned runs count only after you
              mark them completed.
            </p>
          </div>
          <details className={styles.guideDisclosure}>
            <summary>
              First visit? See how the planner works{" "}
              <span aria-hidden="true">+</span>
            </summary>
            <ol
              className={styles.plannerSteps}
              aria-label="How to use the weekly planner"
            >
              <li>
                <span>1</span>
                <div>
                  <strong>Log what you’ve finished</strong>
                  <small>Completed keys determine your current Vault.</small>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Choose your next reward</strong>
                  <small>Set an item level and the number of choices.</small>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Run the missing keys</strong>
                  <small>Mark planned runs completed as you finish them.</small>
                </div>
              </li>
            </ol>
          </details>
          {example && (
            <div className={styles.demoBanner} role="note">
              <div>
                <strong>You’re exploring an example week.</strong>
                <span>
                  These are sample keys, not your completed runs. The example
                  isn’t saved.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  update(emptyWeek(), "Ready for your own week.");
                  setExample(false);
                }}
              >
                Start my own week →
              </button>
            </div>
          )}
          <div className={styles.weekGrid}>
            <section
              className={styles.runEntry}
              aria-labelledby="entry-heading"
            >
              <span className={styles.overline}>01 / ADD YOUR KEYS</span>
              <h3 id="entry-heading">What have you run this week?</h3>
              <p>
                Log completed keys to see your current Vault. Use “Plan” for
                keys you haven’t finished yet.
              </p>
              <RewardSelect
                label="Keystone level"
                value={level}
                options={keyOptions}
                onChange={setLevel}
              />
              <div className={styles.quantityRow}>
                <span>Number of runs</span>
                <div>
                  <button
                    type="button"
                    aria-label="Decrease runs"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                  >
                    −
                  </button>
                  <input
                    aria-label="Run count"
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.min(
                          50,
                          Math.max(1, Number(event.target.value) || 1),
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Increase runs"
                    disabled={quantity >= 50}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.entryRewards}>
                <span>
                  Dungeon loot <b>{selected.dungeon}</b>
                </span>
                <span>
                  Vault reward <b>{selected.vault}</b>
                </span>
              </div>
              <div className={styles.entryActions}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  disabled={limitReached}
                  onClick={() =>
                    update(
                      { ...week, completed: [...week.completed, ...candidate] },
                      `${quantity} completed ${quantity === 1 ? "run logged" : "runs logged"}. Current Vault updated.`,
                    )
                  }
                >
                  Log completed {quantity === 1 ? "run" : "runs"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  disabled={limitReached}
                  onClick={() => addPlanned(candidate)}
                >
                  + Plan {quantity === 1 ? "this run" : `${quantity} runs`}
                </button>
              </div>
              <div className={styles.nextImpact}>
                <span>
                  IF YOU ADD {quantity === 1 ? "THIS RUN" : "THESE RUNS"} TO
                  YOUR PLAN
                </span>
                <p>
                  {changed.length
                    ? `You’ll unlock or improve ${changed.join(" and ")}.`
                    : "Your Vault item levels stay the same. This key may still help with Crests, loot or rating."}
                </p>
              </div>
              {allRuns.length === 0 && (
                <button
                  type="button"
                  className={styles.exampleButton}
                  onClick={() => {
                    setExample(true);
                    update(
                      {
                        completed: [...mythicExample.completed],
                        planned: [...mythicExample.planned],
                      },
                      mythicExample.notice,
                    );
                  }}
                >
                  Not sure? Try a mixed-key example ↗
                </button>
              )}
              {limitReached && (
                <p className={styles.inlineNote}>
                  This would exceed the 200-run limit. Remove some runs first.
                </p>
              )}
            </section>
            <WeeklyGoal
              runs={allRuns}
              completed={week.completed}
              onAdd={addPlanned}
            />
          </div>

          <section
            id="weekly-planner"
            className={styles.vaultOverview}
            aria-labelledby="vault-heading"
          >
            <div className={styles.overviewHeading}>
              <div>
                <span className={styles.overline}>03 / SEE THE DIFFERENCE</span>
                <h2 id="vault-heading">Your Great Vault</h2>
              </div>
              <span>
                <i /> Completed <i /> With your plan
              </span>
            </div>
            <div className={styles.vaultGrid}>
              {vaultThresholds.map((required, index) => {
                const current = currentVault[index];
                const future = plannedVault[index];
                const improves =
                  !!future && (!current || future.vault > current.vault);
                return (
                  <article
                    key={required}
                    className={`${styles.vaultCompareCard} ${improves ? styles.vaultImproves : ""}`}
                  >
                    <div className={styles.vaultCompareTop}>
                      <span>CHOICE {index + 1}</span>
                      <small>
                        {required} {required === 1 ? "run" : "runs"} needed
                      </small>
                    </div>
                    <span className={styles.fieldLabel}>
                      Earned from completed keys
                    </span>
                    <strong data-testid={`vault-current-${index}`}>
                      {current ? current.vault : "Locked"}
                      <small>{current ? " iLvl" : ""}</small>
                    </strong>
                    <p>
                      {current
                        ? `Your ${index === 0 ? "highest" : index === 1 ? "4th-highest" : "8th-highest"} completed key is +${current.level}.`
                        : `${Math.max(0, required - week.completed.length)} more completed ${required - week.completed.length === 1 ? "run" : "runs"} to unlock.`}
                    </p>
                    <div className={styles.futureReward}>
                      <span>With your plan</span>
                      <b data-testid={`vault-planned-${index}`}>
                        {future ? `${future.vault} iLvl` : "Still locked"}
                        {improves ? " ↗" : ""}
                      </b>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className={styles.vaultRule}>
              Your highest, 4th-highest and 8th-highest keys determine these
              choices.{" "}
              <strong>You claim one item after the weekly reset.</strong>
            </p>
          </section>

          <section
            className={styles.runLedger}
            aria-labelledby="run-ledger-heading"
          >
            <div className={styles.overviewHeading}>
              <div>
                <h2 id="run-ledger-heading">The keys behind your week</h2>
                <p>
                  Tick a planned run when you finish it. Remove a key if you
                  entered it by mistake.
                </p>
              </div>
            </div>
            <div className={styles.ledgerColumns}>
              <div>
                <h3>
                  <span className={styles.completedDot} />
                  Completed <small>{week.completed.length}</small>
                </h3>
                <div className={styles.runChips}>
                  {week.completed.length ? (
                    week.completed.map((key, index) => (
                      <button
                        type="button"
                        key={index}
                        className={styles.completedChip}
                        aria-label={`Remove completed key +${key} run`}
                        onClick={() =>
                          update({
                            ...week,
                            completed: week.completed.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                      >
                        +{key}
                        <span>×</span>
                      </button>
                    ))
                  ) : (
                    <p className={styles.emptyLedger}>
                      No completed keys yet. Log them above.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3>
                  <span className={styles.plannedDot} />
                  Planned <small>{week.planned.length}</small>
                </h3>
                <div className={styles.runChips}>
                  {week.planned.length ? (
                    week.planned.map((key, index) => (
                      <div className={styles.plannedChip} key={index}>
                        <button
                          type="button"
                          aria-label={`Mark planned key +${key} completed`}
                          onClick={() =>
                            update(
                              {
                                completed: [...week.completed, key],
                                planned: week.planned.filter(
                                  (_, i) => i !== index,
                                ),
                              },
                              `+${key} marked completed. Current Vault updated.`,
                            )
                          }
                        >
                          ✓
                        </button>
                        <strong>+{key}</strong>
                        <button
                          type="button"
                          aria-label={`Remove key +${key} run`}
                          onClick={() =>
                            update({
                              ...week,
                              planned: week.planned.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyLedger}>
                      No planned keys. Choose a goal above.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.plannerToolbar}>
              <span>
                {allRuns.length} / 200 runs ·{" "}
                {example ? "Example only · not saved" : "Saved in this browser"}
              </span>
              <div>
                <button
                  type="button"
                  disabled={!undo}
                  onClick={() => {
                    if (undo) {
                      setWeek(undo);
                      setExample(undoExample);
                      setUndo(null);
                      setShareLink("");
                      setNotice("Last change undone.");
                    }
                  }}
                >
                  Undo last change
                </button>
                <button type="button" onClick={shareWeek}>
                  Share plan ↗
                </button>
                <button
                  type="button"
                  disabled={!allRuns.length}
                  onClick={() => {
                    update(
                      emptyWeek(),
                      "Week cleared. Use Undo to restore it.",
                    );
                    setExample(false);
                  }}
                >
                  Reset planner
                </button>
              </div>
            </div>
            <p className={styles.storageNote}>
              This is a manual planner, not a live character sync. After the
              weekly reset, use Reset planner to start a new week. Undo restores
              the last change.
            </p>
            {shareLink && (
              <label className={styles.shareField}>
                Your plan link
                <input
                  aria-label="Your plan link"
                  readOnly
                  value={shareLink}
                  onFocus={(event) => event.target.select()}
                />
              </label>
            )}
            <p className={styles.inlineNote}>
              Manual entries, not live Battle.net data. Clear your completed
              keys when a new weekly reset starts.
            </p>
          </section>
        </div>

        <div id="tool-compare" hidden={view !== "compare"}>
          <div className={styles.workspaceIntro}>
            <h2>Is the higher key worth it?</h2>
            <p>
              Compare two key levels before committing to a harder run. Higher
              difficulty does not always mean higher item levels.
            </p>
          </div>
          <section
            className={styles.compareWorkspace}
            aria-label="Compare key rewards"
          >
            <div className={styles.compareSelectors}>
              <RewardSelect
                label="First key"
                value={compareA}
                options={keyOptions}
                onChange={setCompareA}
              />
              <span>vs</span>
              <RewardSelect
                label="Second key"
                value={compareB}
                options={keyOptions}
                onChange={setCompareB}
              />
            </div>
            <div className={styles.comparisonTable}>
              <div>
                <span>REWARD</span>
                <strong>+{a.level}</strong>
                <strong>+{b.level}</strong>
              </div>
              <div>
                <span>
                  Dungeon loot<small>End-of-run item level</small>
                </span>
                <strong>
                  {a.dungeon}
                  <small>{a.dungeonTrack}</small>
                </strong>
                <strong>
                  {b.dungeon}
                  <small>{b.dungeonTrack}</small>
                </strong>
              </div>
              <div>
                <span>
                  Great Vault<small>Weekly reward item level</small>
                </span>
                <strong>
                  {a.vault}
                  <small>{a.vaultTrack}</small>
                </strong>
                <strong>
                  {b.vault}
                  <small>{b.vaultTrack}</small>
                </strong>
              </div>
              <div>
                <span>
                  Crests<small>Provisional per-run estimate</small>
                </span>
                <strong>
                  {a.crestAmount}
                  <small>{a.crest}</small>
                </strong>
                <strong>
                  {b.crestAmount}
                  <small>{b.crest}</small>
                </strong>
              </div>
            </div>
            <div className={styles.compareConclusion}>
              <span className={styles.overline}>THE TAKEAWAY</span>
              <h3>
                {a.dungeon === b.dungeon && a.vault === b.vault
                  ? "Same gear item levels. Different challenge."
                  : `+${Math.max(a.level, b.level)} changes your gear rewards.`}
              </h3>
              <p>
                {a.dungeon === b.dungeon && a.vault === b.vault
                  ? "Pick the key you can finish reliably for gear. Compare Crest estimates separately; rating and achievements are not modeled here."
                  : `Dungeon loot: ${a.dungeon} → ${b.dungeon}. Great Vault: ${a.vault} → ${b.vault}. Vault value still depends on your other weekly keys.`}
              </p>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={allRuns.length >= 200}
                onClick={() => {
                  addPlanned([b.level]);
                  showWeek();
                }}
              >
                Plan one +{b.level} run →
              </button>
            </div>
          </section>
          <section id="reward-reference" className={styles.referenceSection}>
            <button
              type="button"
              className={styles.tableToggle}
              aria-expanded={showTable}
              onClick={() => setShowTable(!showTable)}
            >
              <span>
                <strong>
                  Full +{Math.min(...rewards.map((row) => row.level))}–
                  {Math.max(...rewards.map((row) => row.level))} reward table
                </strong>
                <small>All listed dungeon, Vault and Crest rewards</small>
              </span>
              <span>{showTable ? "−" : "+"}</span>
            </button>
            {showTable && (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <caption className={styles.tableCaption}>
                    {wowSeason.name}. Crest quantities are provisional
                    estimates.
                  </caption>
                  <thead>
                    <tr>
                      <th>KEY</th>
                      <th>DUNGEON</th>
                      <th>VAULT</th>
                      <th>CREST TIER</th>
                      <th>CRESTS / RUN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((row) => (
                      <tr key={row.level}>
                        <td>+{row.level}</td>
                        <td>
                          {row.dungeon}
                          <small>{row.dungeonTrack}</small>
                        </td>
                        <td>
                          {row.vault}
                          <small>{row.vaultTrack}</small>
                        </td>
                        <td>{row.crest}</td>
                        <td>{row.crestAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div id="tool-crests" hidden={view !== "crests"}>
          <div className={styles.workspaceIntro}>
            <h2>Turn a Crest goal into a run count.</h2>
            <p>
              Tell us how many you need and what you already have. Use the yield
              shown in your game for the most useful estimate.
            </p>
          </div>
          <section
            id="crest-calculator"
            className={styles.crestCalculator}
            aria-label="Crest Farming Calculator"
          >
            <div className={styles.calculatorControls}>
              <span className={styles.fieldLabel}>Crest tier</span>
              <div className={styles.crestTierTabs}>
                {crestTypes.map((type) => (
                  <button
                    type="button"
                    key={type}
                    aria-pressed={crestType === type}
                    className={crestType === type ? styles.crestTierActive : ""}
                    onClick={() => {
                      setCrestType(type);
                      setFarmKey(
                        rewards.find((row) => row.crest === type)!.level,
                      );
                      setCustomYield("");
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className={styles.calculatorFields}>
                {[
                  ["CREST GOAL", crestGoal, setCrestGoal],
                  ["CURRENT CRESTS", currentCrests, setCurrentCrests],
                ].map(([label, value, setter]) => (
                  <label className={styles.calculatorField} key={String(label)}>
                    <span>{String(label)}</span>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      value={String(value)}
                      onChange={(event) => {
                        if (
                          event.target.value === "" ||
                          /^\d+$/.test(event.target.value)
                        )
                          (setter as typeof setCrestGoal)(event.target.value);
                      }}
                      onBlur={() =>
                        (setter as typeof setCrestGoal)(
                          String(bounded(String(value))),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <RewardSelect
                label="Farming key"
                value={farm.level}
                options={farmOptions.map((row) => ({
                  value: row.level,
                  label: `+${row.level} Keystone`,
                  detail: `${row.crestAmount} ${row.crest} Crests / run (estimate)`,
                }))}
                onChange={(value) => {
                  setFarmKey(value);
                  setCustomYield("");
                }}
              />
              <label className={styles.calculatorField}>
                <span>CRESTS PER RUN · OPTIONAL OVERRIDE</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder={String(farm.crestAmount)}
                  value={customYield}
                  onChange={(event) => {
                    if (
                      event.target.value === "" ||
                      /^\d+$/.test(event.target.value)
                    )
                      setCustomYield(event.target.value);
                  }}
                  onBlur={() => {
                    if (customYield !== "") setCustomYield(String(yieldPerRun));
                  }}
                />
              </label>
              <p className={styles.inlineNote}>
                Listed Crest amounts are provisional. Enter your in-game yield
                above. Caps, other Crest sources and failed runs are not
                included.
              </p>
            </div>
            <div className={styles.calculatorResult}>
              <span className={styles.overline}>YOUR FARMING PLAN</span>
              <div className={styles.calculatorResultMain}>
                <span>ADDITIONAL RUNS</span>
                <strong>{farmRuns}</strong>
                <small>
                  at +{farm.level} · {yieldPerRun} {crestType} Crests per run
                </small>
              </div>
              <div className={styles.calculatorResultRows}>
                <div>
                  <span>Still needed</span>
                  <strong>{remaining} Crests</strong>
                </div>
                <div>
                  <span>Estimated final balance</span>
                  <strong>
                    {bounded(currentCrests) + farmRuns * yieldPerRun}
                  </strong>
                </div>
                <div>
                  <span>Yield source</span>
                  <strong>
                    {customYield === ""
                      ? "Reference estimate"
                      : "Your custom amount"}
                  </strong>
                </div>
              </div>
              <button
                type="button"
                className={styles.primaryAction}
                disabled={!farmRuns || allRuns.length + farmRuns > 200}
                onClick={() => {
                  addPlanned(Array<number>(farmRuns).fill(farm.level));
                  showWeek();
                }}
              >
                {farmRuns === 0
                  ? "You already have enough ✓"
                  : allRuns.length + farmRuns > 200
                    ? "Exceeds 200-run planner limit"
                    : "Add farm to weekly plan →"}
              </button>
              <p className={styles.inlineNote}>
                Adding keys does not mark them completed or place a booking.
                Custom yield affects this estimate only.
              </p>
            </div>
          </section>
        </div>

        <details className={styles.helpDetails}>
          <summary>
            New to the Great Vault? Here’s the short version <span>+</span>
          </summary>
          <div className={styles.quickGuide}>
            <article>
              <b>01</b>
              <h3>Finish 1, 4 or 8 keys</h3>
              <p>
                These thresholds unlock the first, second and third dungeon
                choices.
              </p>
            </article>
            <article>
              <b>02</b>
              <h3>Your lower keys matter</h3>
              <p>
                The second choice uses your 4th-highest key. One high key does
                not raise every choice.
              </p>
            </article>
            <article>
              <b>03</b>
              <h3>Pick one reward</h3>
              <p>
                After reset, select one item from your available Vault choices.
                Three choices are not three items.
              </p>
            </article>
          </div>
        </details>
        <details id="reward-sources" className={styles.helpDetails}>
          <summary>
            Season data &amp; calculation notes <span>+</span>
          </summary>
          <div className={styles.dataDetails}>
            <p>
              This is a manual simulator using the site’s {wowSeason.name}{" "}
              reference table. Existing gear values are retained. Crest
              quantities are provisional; they are not guaranteed rewards. No
              Battle.net account is connected.
            </p>
            <a
              href={wowSeason.announcement}
              target="_blank"
              rel="noopener noreferrer"
            >
              Blizzard season overview ↗
            </a>
            <a
              href={delveSources[2].href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Blizzard update notes ↗
            </a>
          </div>
        </details>
        <p className={styles.storageNote}>
          These tools calculate Mythic+ dungeon rewards. Delves use the World
          Vault row with {delveSettings.vaultThresholds.join(" / ")} activity
          thresholds.{" "}
          <Link href="/delves#rewards">
            Compare Delve rewards and gold prices ↗
          </Link>
        </p>
        <div className={styles.toolFooter}>
          <Link href="/">← Back to NikoBoost</Link>
          <Link href="/#mythic">Need a team? Explore Mythic+ runs →</Link>
        </div>
      </div>
    </main>
  );
}
