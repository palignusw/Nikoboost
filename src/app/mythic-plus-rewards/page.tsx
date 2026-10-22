
"use client";

import {
  mythicRewards as rewards,
  vaultThresholds as VAULT_THRESHOLDS,
  getMythicReward,
  type CrestType,
  type MythicReward as Reward,
} from "@/data/wowSeason";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.scss";




const STORAGE_KEY = "nikoboost:mythic-plus:vault-planner:v1";

const crestTypes: CrestType[] = ["Champion", "Hero", "Myth"];
function rewardFor(level: number): Reward {
  const reward = getMythicReward(level);

  if (!reward) {
    throw new Error(`Unsupported Mythic+ level: ${level}`);
  }

  return reward;
}

function readSavedRuns(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("runs" in parsed) ||
      !Array.isArray(parsed.runs)
    ) {
      return [];
    }

    return parsed.runs.filter(
      (run): run is number =>
        typeof run === "number" &&
        Number.isInteger(run) &&
        run >= 2 &&
        run <= 20
    ).slice(0, 200);
  } catch {
    return [];
  }
}

function getComparison(level: number) {
  const current = rewardFor(level);
  const previous = rewardFor(Math.max(2, level - 1));

  const nextDungeon = rewards.find(
    (reward) =>
      reward.level > level &&
      reward.dungeon > current.dungeon
  );

  const nextVault = rewards.find(
    (reward) =>
      reward.level > level &&
      reward.vault > current.vault
  );

  const nextCrest = rewards.find(
    (reward) =>
      reward.level > level &&
      (
        reward.crest !== current.crest ||
        reward.crestAmount > current.crestAmount
      )
  );

  return {
    previous,
    dungeonDifference: current.dungeon - previous.dungeon,
    vaultDifference: current.vault - previous.vault,
    crestDifference:
      current.crest === previous.crest
        ? current.crestAmount - previous.crestAmount
        : null,
    nextDungeon,
    nextVault,
    nextCrest,
  };
}

function getNextRunAdvice(runs: number[], selectedLevel: number) {
  const sorted = [...runs].sort((a, b) => b - a);
  const maxVault = Math.max(...rewards.map((reward) => reward.vault));

  const slots = VAULT_THRESHOLDS.map((required) => {
    const key = sorted[required - 1];
    return key === undefined ? null : rewardFor(key);
  });

  const targetIndex = slots.findIndex(
    (slot) => slot === null || slot.vault < maxVault
  );

  if (targetIndex === -1) {
    return {
      complete: true as const,
      maxVault,
      totalRuns: runs.length,
    };
  }

  const current = slots[targetIndex];
  const previousSlot =
    targetIndex > 0 ? slots[targetIndex - 1] : null;

  let targetVault: number;

  if (current) {
    targetVault =
      rewards.find((reward) => reward.vault > current.vault)?.vault ??
      maxVault;
  } else if (previousSlot) {
    targetVault = previousSlot.vault;
  } else {
    targetVault = rewardFor(selectedLevel).vault;
  }

  const recommended = rewards.find(
    (reward) => reward.vault >= targetVault
  )!;

  const requiredRuns = VAULT_THRESHOLDS[targetIndex];

  const qualifyingRuns = runs.filter(
    (key) => rewardFor(key).vault >= targetVault
  ).length;

  return {
    complete: false as const,
    key: recommended.level,
    targetSlot: targetIndex + 1,
    targetVault,
    currentVault: current?.vault ?? null,
    runsNeeded: Math.max(0, requiredRuns - qualifyingRuns),
    isUnlock: current === null,
    maxVault,
  };
}

const faq = [
  {
    question: "How many runs unlock all Great Vault slots?",
    answer:
      "You need 1, 4 and 8 qualifying dungeon completions to unlock the three dungeon choices. This planner simulates those thresholds.",
  },
  {
    question: "How are Great Vault rewards calculated?",
    answer:
      "The first dungeon choice uses your highest qualifying key, the second uses your fourth-highest, and the third uses your eighth-highest.",
  },
  {
    question: "Do higher keys always give better gear?",
    answer:
      "No. Gear item levels eventually reach their seasonal cap. Higher keys may still award more Crests or help with other progression goals.",
  },
  {
    question: "What does the Crest Calculator calculate?",
    answer:
      "It estimates how many runs you need to reach your selected Crest goal using the listed amount per run. It does not account for failed runs, different completion conditions or other Crest sources.",
  },
  {
    question: "Does this tool connect to my WoW character?",
    answer:
      "No. Your runs are entered manually and stored locally in this browser. The planner does not access your Battle.net account.",
  },
];

export default function RewardsExplorer() {
  const [level, setLevel] = useState(10);
  const [runs, setRuns] = useState<number[]>([]);
  const [plannerLoaded, setPlannerLoaded] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [crestType, setCrestType] = useState<CrestType>("Myth");
  const [crestGoal, setCrestGoal] = useState("120");
  const [currentCrests, setCurrentCrests] = useState("0");

  const goalValue = Number(crestGoal) || 0;
  const currentValue = Number(currentCrests) || 0;
  const [calculatorLevel, setCalculatorLevel] = useState(12);

  useEffect(() => {
    setRuns(readSavedRuns());
    setPlannerLoaded(true);
  }, []);

  useEffect(() => {
    if (!plannerLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          runs,
          savedAt: new Date().toISOString(),
        })
      );
    } catch {
      // The planner still works without local storage.
    }
  }, [runs, plannerLoaded]);

  const selected = rewardFor(level);
  const comparison = getComparison(level);
  const advice = getNextRunAdvice(runs, level);

  const vault = useMemo(() => {
    const sorted = [...runs].sort((a, b) => b - a);

    return VAULT_THRESHOLDS.map((required) => {
      const key = sorted[required - 1];
      return key === undefined ? null : rewardFor(key);
    });
  }, [runs]);

  const crestTotals = useMemo(() => {
    const totals: Record<CrestType, number> = {
      Champion: 0,
      Hero: 0,
      Myth: 0,
    };

    runs.forEach((key) => {
      const reward = rewardFor(key);
      totals[reward.crest] += reward.crestAmount;
    });

    return totals;
  }, [runs]);

  const calculatorOptions = rewards.filter(
    (reward) => reward.crest === crestType
  );

  const calculatorReward =
    calculatorOptions.find(
      (reward) => reward.level === calculatorLevel
    ) ?? calculatorOptions[0];

  const remainingCrests = Math.max(0, goalValue - currentValue);

  const runsNeeded =
    remainingCrests === 0
      ? 0
      : Math.ceil(remainingCrests / calculatorReward.crestAmount);

  const estimatedTotal =
    runsNeeded * calculatorReward.crestAmount;

  const bestFarmingReward = calculatorOptions.reduce(
    (best, current) =>
      current.crestAmount > best.crestAmount ? current : best
  );
  const optimalRunsNeeded =
    remainingCrests === 0
      ? 0
      : Math.ceil(
        remainingCrests / bestFarmingReward.crestAmount
      );

  const extraRuns = Math.max(
    0,
    runsNeeded - optimalRunsNeeded
  );

  const firstKeyWithSameGear =
    rewards.find(
      (reward) =>
        reward.dungeon === selected.dungeon &&
        reward.vault === selected.vault
    )?.level ?? level;

  const gearImproved =
    comparison.dungeonDifference > 0 ||
    comparison.vaultDifference > 0;

  const crestImproved =
    comparison.crestDifference === null ||
    comparison.crestDifference > 0;

  function addRun(key: number) {
    setRuns((previous) =>
      previous.length >= 200 ? previous : [...previous, key]
    );
  }

  function removeRun(index: number) {
    setRuns((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function changeCrestType(type: CrestType) {
    const available = rewards.filter(
      (reward) => reward.crest === type
    );

    const best = available.reduce((currentBest, reward) =>
      reward.crestAmount > currentBest.crestAmount
        ? reward
        : currentBest
    );

    setCrestType(type);
    setCalculatorLevel(best.level);
  }

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <span>NIKOBOOST</span>
          <span className={styles.breadcrumbDivider}>/</span>
          <span>MYTHIC+ TOOLS</span>
          <span className={styles.breadcrumbDivider}>/</span>
          <strong>REWARDS</strong>
        </div>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              <span className={styles.statusDot} />
              MIDNIGHT SEASON 2
            </div>

            <h1>
              Mythic+ <span>Rewards</span>
            </h1>

            <p>
              Compare dungeon loot, Great Vault rewards and
              Crests per run. Plan your weekly progression
              and calculate your Crest farming goals.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span>MAX DUNGEON LOOT</span>
              <strong>
                311 <small>iLvl</small>
              </strong>
            </div>

            <div className={styles.heroMetaDivider} />

            <div className={styles.heroMetaItem}>
              <span>MAX VAULT REWARD</span>
              <strong>
                318 <small>iLvl</small>
              </strong>
            </div>
          </div>
        </header>

        {/* REWARD EXPLORER */}

        <section
          className={styles.workspace}
          aria-labelledby="explorer-heading"
        >
          <div className={styles.workspaceHeader}>
            <div>
              <span className={styles.overline}>
                REWARD EXPLORER
              </span>
              <h2 id="explorer-heading">
                Choose your key level
              </h2>
            </div>

            <span className={styles.workspaceHint}>
              Interactive tool
            </span>
          </div>

          <div className={styles.explorerGrid}>
            <div className={styles.keySection}>
              <div className={styles.keySectionTop}>
                <span>KEYSTONE LEVEL</span>
                <strong>+{level}</strong>
              </div>

              <div className={styles.keyGrid}>
                {rewards.map((reward) => (
                  <button
                    type="button"
                    key={reward.level}
                    aria-pressed={level === reward.level}
                    className={`${styles.keyButton} ${level === reward.level
                      ? styles.keyActive
                      : ""
                      }`}
                    onClick={() => setLevel(reward.level)}
                  >
                    +{reward.level}
                  </button>
                ))}
              </div>

              <div className={styles.keyTip}>
                <span className={styles.tipIcon}>i</span>
                <p>
                  Higher keys may improve gear or Crest rewards.
                  Select a level to compare its benefits.
                </p>
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.previewTop}>
                <span>REWARD PREVIEW</span>
                <span className={styles.previewKey}>
                  KEY +{level}
                </span>
              </div>

              <div className={styles.previewRows}>
                <div className={styles.previewRow}>
                  <div className={styles.rewardIdentity}>
                    <span className={styles.rewardIcon}>◆</span>
                    <div>
                      <strong>Dungeon Loot</strong>
                      <small>{selected.dungeonTrack}</small>
                    </div>
                  </div>

                  <div className={styles.rewardValue}>
                    <strong>{selected.dungeon}</strong>
                    <span>iLvl</span>
                  </div>
                </div>

                <div
                  className={`${styles.previewRow} ${styles.vaultReward}`}
                >
                  <div className={styles.rewardIdentity}>
                    <span className={styles.vaultIcon}>✦</span>
                    <div>
                      <strong>Great Vault</strong>
                      <small>{selected.vaultTrack}</small>
                    </div>
                  </div>

                  <div className={styles.rewardValue}>
                    <strong>{selected.vault}</strong>
                    <span>iLvl</span>
                  </div>
                </div>

                <div className={styles.crestPreviewRow}>
                  <div className={styles.rewardIdentity}>
                    <span className={styles.crestPreviewIcon}>
                      ✧
                    </span>

                    <div>
                      <strong>{selected.crest} Mistcrests</strong>
                      <small>Estimated per qualifying run</small>
                    </div>
                  </div>

                  <div className={styles.rewardValue}>
                    <strong>{selected.crestAmount}</strong>
                    <span>Crests / run</span>
                  </div>
                </div>
              </div>

              <div className={styles.previewBottom}>
                <div>
                  <span>CREST TIER</span>
                  <strong>{selected.crest} Mistcrest</strong>
                </div>

                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => addRun(level)}
                  disabled={runs.length >= 200}
                >
                  <span>+</span>
                  Add to Vault Planner
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SMART INSIGHTS */}

        <section
          className={styles.insightsSection}
          aria-label="Reward insights"
        >
          <div className={styles.insightsHeading}>
            <span className={styles.overline}>
              SMART REWARD INSIGHTS
            </span>

            <h2>Make every run count.</h2>

            <p>
              Compare gear and Crest rewards before
              deciding which key to run next.
            </p>
          </div>

          <div className={styles.insightsGrid}>
            <article className={styles.insightCard}>
              <div className={styles.insightTop}>
                <span className={styles.insightIcon}>↗</span>
                <span className={styles.insightEyebrow}>
                  KEY LEVEL ANALYSIS
                </span>
              </div>

              <h3>Is +{level} worth it?</h3>

              <div className={styles.insightSummary}>
                <strong>
                  {level === 2
                    ? "Starting reward tier"
                    : gearImproved
                      ? "Higher gear rewards"
                      : crestImproved
                        ? "Better Crest rewards"
                        : "No listed reward increase"}
                </strong>

                <p>
                  {level === 2
                    ? "Use this key as your baseline."
                    : gearImproved
                      ? `Compared with +${level - 1}, at least one gear reward improves.`
                      : crestImproved
                        ? `Gear is unchanged from +${level - 1}, but Crest rewards improve.`
                        : `Gear and Crest rewards are unchanged from +${level - 1}.`}
                </p>
              </div>

              <div className={styles.comparisonRows}>
                <div className={styles.comparisonRow}>
                  <div>
                    <span>Dungeon loot</span>
                    <strong>{selected.dungeon} iLvl</strong>
                  </div>

                  <span
                    className={
                      comparison.dungeonDifference > 0
                        ? styles.positiveDifference
                        : styles.neutralDifference
                    }
                  >
                    {comparison.dungeonDifference > 0
                      ? `+${comparison.dungeonDifference} iLvl`
                      : "No change"}
                  </span>
                </div>

                <div className={styles.comparisonRow}>
                  <div>
                    <span>Great Vault</span>
                    <strong>{selected.vault} iLvl</strong>
                  </div>

                  <span
                    className={
                      comparison.vaultDifference > 0
                        ? styles.positiveDifference
                        : styles.neutralDifference
                    }
                  >
                    {comparison.vaultDifference > 0
                      ? `+${comparison.vaultDifference} iLvl`
                      : "No change"}
                  </span>
                </div>

                <div className={styles.comparisonRow}>
                  <div>
                    <span>
                      {selected.crest} Mistcrests / run
                    </span>
                    <strong>{selected.crestAmount}</strong>
                  </div>

                  <span
                    className={
                      crestImproved && level > 2
                        ? styles.positiveDifference
                        : styles.neutralDifference
                    }
                  >
                    {level === 2
                      ? "Base"
                      : comparison.crestDifference === null
                        ? "New tier"
                        : comparison.crestDifference > 0
                          ? `+${comparison.crestDifference} Crests`
                          : "No change"}
                  </span>
                </div>
              </div>

              <div className={styles.insightConclusion}>
                <span className={styles.conclusionLabel}>
                  NEXT REWARD UPGRADE
                </span>

                <p>
                  {comparison.nextDungeon
                    ? `Dungeon gear: +${comparison.nextDungeon.level}. `
                    : "Dungeon gear capped. "}

                  {comparison.nextVault
                    ? `Vault gear: +${comparison.nextVault.level}. `
                    : "Vault gear capped. "}

                  {comparison.nextCrest
                    ? `Next Crest increase or tier: +${comparison.nextCrest.level}.`
                    : "Crest rewards at listed cap."}
                </p>

                {!gearImproved && level > 2 && (
                  <p className={styles.gearCapHint}>
                    +{firstKeyWithSameGear} is the lowest
                    key with the same listed gear item levels.
                    Crest rewards may differ.
                  </p>
                )}
              </div>
            </article>

            <article
              className={`${styles.insightCard} ${styles.recommendationCard}`}
            >
              <div className={styles.insightTop}>
                <span className={styles.insightIcon}>✦</span>
                <span className={styles.insightEyebrow}>
                  YOUR NEXT MOVE
                </span>
              </div>

              <h3>What should I run next?</h3>

              <p className={styles.insightDescription}>
                Based on {runs.length} planned{" "}
                {runs.length === 1 ? "run" : "runs"}.
              </p>

              {advice.complete ? (
                <div className={styles.recommendationResult}>
                  <span className={styles.recommendationLabel}>
                    ALL PLANNED VAULT SLOTS MAXED
                  </span>

                  <strong>3 / 3</strong>

                  <p>
                    All three simulated dungeon Vault
                    slots reach {advice.maxVault} iLvl.
                  </p>

                  <div className={styles.insightDetail}>
                    Your Vault gear goal is complete.
                    You can still farm Crests or pursue
                    other progression goals.
                  </div>
                </div>
              ) : (
                <div className={styles.recommendationResult}>
                  <span className={styles.recommendationLabel}>
                    {advice.isUnlock
                      ? `UNLOCK VAULT SLOT ${advice.targetSlot}`
                      : `UPGRADE VAULT SLOT ${advice.targetSlot}`}
                  </span>

                  <strong>+{advice.key}</strong>

                  <p>
                    {advice.isUnlock
                      ? `Aim for ${advice.targetVault} iLvl in Vault slot ${advice.targetSlot}.`
                      : `Improve Vault slot ${advice.targetSlot} from ${advice.currentVault} to ${advice.targetVault} iLvl.`}
                  </p>

                  <div className={styles.recommendationStats}>
                    <div>
                      <span>ADDITIONAL RUNS</span>
                      <strong>{advice.runsNeeded}</strong>
                    </div>

                    <div>
                      <span>TARGET VAULT</span>
                      <strong>{advice.targetVault}</strong>
                    </div>
                  </div>

                  <div className={styles.insightDetail}>
                    Add {advice.runsNeeded} more{" "}
                    {advice.runsNeeded === 1 ? "run" : "runs"}{" "}
                    at +{advice.key} or higher to reach
                    this simulated Vault goal.
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles.recommendationButton}
                disabled={!advice.complete && runs.length >= 200}
                onClick={() => {
                  if (advice.complete) {
                    document
                      .getElementById("planner-heading")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  } else {
                    addRun(advice.key);
                  }
                }}
              >
                {advice.complete
                  ? "View Vault Planner"
                  : `Add +${advice.key} to Planner`}

                <span aria-hidden="true">
                  {advice.complete ? "→" : "+"}
                </span>
              </button>
            </article>
          </div>
        </section>

        {/* GREAT VAULT PLANNER */}

        <section
          className={styles.plannerSection}
          aria-labelledby="planner-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>
                WEEKLY PROGRESSION
              </span>

              <h2 id="planner-heading">
                Great Vault Planner
              </h2>

              <p>
                Simulate your weekly Vault rewards.
                Planned runs are saved in this browser.
              </p>
            </div>

            <div className={styles.runCounter}>
              <strong>{runs.length}</strong>
              <span>PLANNED RUNS</span>
            </div>
          </div>

          <div className={styles.planner}>
            <div className={styles.plannerTop}>
              <div>
                <span className={styles.smallLabel}>
                  DUNGEON PROGRESS
                </span>
                <strong>
                  {Math.min(runs.length, 8)} / 8
                </strong>
              </div>

              <button
                type="button"
                className={styles.resetButton}
                disabled={runs.length === 0}
                onClick={() => setRuns([])}
              >
                Reset planner
              </button>
            </div>

            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Great Vault dungeon progress"
              aria-valuenow={Math.min(runs.length, 8)}
              aria-valuemin={0}
              aria-valuemax={8}
            >
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(
                    (runs.length / 8) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className={styles.vaultGrid}>
              {VAULT_THRESHOLDS.map((required, index) => {
                const reward = vault[index];
                const unlocked = reward !== null;

                return (
                  <div
                    key={required}
                    className={`${styles.vaultSlot} ${unlocked ? styles.vaultSlotActive : ""
                      }`}
                  >
                    <div className={styles.slotHeader}>
                      <span>VAULT SLOT 0{index + 1}</span>
                      <span className={styles.slotState}>
                        {unlocked
                          ? "● PLANNED"
                          : "○ LOCKED"}
                      </span>
                    </div>

                    <div className={styles.slotBody}>
                      {reward ? (
                        <>
                          <strong>{reward.vault}</strong>
                          <span>
                            iLvl · {reward.vaultTrack}
                          </span>
                        </>
                      ) : (
                        <>
                          <strong
                            className={styles.lockedValue}
                          >
                            —
                          </strong>
                          <span>
                            {required - runs.length} more{" "}
                            {required - runs.length === 1
                              ? "run"
                              : "runs"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={styles.slotFooter}>
                      {reward
                        ? `Based on +${reward.level}`
                        : `Requires ${required} planned runs`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.runManager}>
              <div className={styles.runManagerTitle}>
                <strong>Your weekly runs</strong>
                <span>
                  {runs.length
                    ? "Select a run to remove it"
                    : "Use the explorer above to add runs"}
                </span>
              </div>

              <div className={styles.runChips}>
                {runs.length === 0 ? (
                  <span className={styles.emptyRuns}>
                    No runs added yet
                  </span>
                ) : (
                  runs.map((run, index) => (
                    <button
                      key={index}
                      type="button"
                      className={styles.runChip}
                      onClick={() => removeRun(index)}
                      aria-label={`Remove key +${run} run`}
                    >
                      +{run}
                      <span>×</span>
                    </button>
                  ))
                )}
              </div>

              <div className={styles.plannedCrests}>
                <div className={styles.plannedCrestsHeader}>
                  <strong>Estimated Crests from planned runs</strong>
                  <span>By reward tier</span>
                </div>

                <div className={styles.plannedCrestsGrid}>
                  {crestTypes.map((type) => (
                    <div key={type}>
                      <span>{type}</span>
                      <strong>{crestTotals[type]}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <p className={styles.plannerNote}>
                This is a simulation, not live character
                progress. Crest totals are estimates based
                on the listed per-run values. Reset your
                plan after the weekly reset.
              </p>
            </div>
          </div>
        </section>

        {/* CREST FARMING CALCULATOR */}

        <section
          className={styles.crestCalculatorSection}
          aria-labelledby="crest-calculator-heading"
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>
                FARMING TOOLS
              </span>

              <h2 id="crest-calculator-heading">
                Crest Farming Calculator
              </h2>

              <p>
                Set your Crest goal and estimate how
                many Mythic+ runs you need.
              </p>
            </div>
          </div>

          <div className={styles.crestCalculator}>
            <div className={styles.calculatorControls}>
              <span className={styles.smallLabel}>
                SELECT CREST TIER
              </span>

              <div className={styles.crestTierTabs}>
                {crestTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={crestType === type}
                    className={
                      crestType === type
                        ? styles.crestTierActive
                        : ""
                    }
                    onClick={() => changeCrestType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className={styles.calculatorFields}>
                <label className={styles.calculatorField}>
                  <span>CREST GOAL</span>

                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={crestGoal}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "" || /^\d+$/.test(value)) {
                        setCrestGoal(value);
                      }
                    }}
                    onBlur={() => {
                      setCrestGoal(
                        String(Math.min(100000, Number(crestGoal) || 0))
                      );
                    }}
                  />
                </label>

                <label className={styles.calculatorField}>
                  <span>CURRENT CRESTS</span>

                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={currentCrests}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "" || /^\d+$/.test(value)) {
                        setCurrentCrests(value);
                      }
                    }}
                    onBlur={() => {
                      setCurrentCrests(
                        String(Math.min(100000, Number(currentCrests) || 0))
                      );
                    }}
                  />
                </label>
              </div>

              <div className={styles.calculatorKeyHeader}>
                <span className={styles.smallLabel}>
                  SELECT FARMING KEY
                </span>
                <strong>+{calculatorReward.level}</strong>
              </div>

              <div className={styles.calculatorKeyGrid}>
                {calculatorOptions.map((reward) => (
                  <button
                    key={reward.level}
                    type="button"
                    aria-pressed={
                      calculatorReward.level === reward.level
                    }
                    className={
                      calculatorReward.level === reward.level
                        ? styles.calculatorKeyActive
                        : ""
                    }
                    onClick={() =>
                      setCalculatorLevel(reward.level)
                    }
                  >
                    +{reward.level}
                  </button>
                ))}
              </div>

              <p className={styles.calculatorHint}>
                +{bestFarmingReward.level} is the lowest
                listed key awarding the maximum{" "}
                {bestFarmingReward.crestAmount}{" "}
                {crestType} Mistcrests per run.
              </p>
            </div>

            <div className={styles.calculatorResult}>
              <span className={styles.smallLabel}>
                YOUR FARMING PLAN
              </span>

              <div className={styles.calculatorResultMain}>
                <span>ESTIMATED RUNS NEEDED</span>
                <strong>{runsNeeded}</strong>
                <small>
                  at keystone level +{calculatorReward.level}
                </small>
              </div>

              <div className={styles.calculatorResultRows}>
                <div>
                  <span>Crests per run</span>
                  <strong>
                    {calculatorReward.crestAmount}
                  </strong>
                </div>

                <div>
                  <span>Crests remaining</span>
                  <strong>{remainingCrests}</strong>
                </div>

                <div>
                  <span>Crests from planned farm</span>
                  <strong>{estimatedTotal}</strong>
                </div>

                <div>
                  <span>Estimated final balance</span>
                  <strong>
                    {currentValue + estimatedTotal}
                  </strong>
                </div>
              </div>

              <div className={styles.calculatorRecommendation}>
                {runsNeeded === 0 ? (
                  "You already have enough Crests for this goal."
                ) : extraRuns > 0 ? (
                  <>
                    <strong>
                      Better farming option: +{bestFarmingReward.level}
                    </strong>
                    <p>
                      Run +{bestFarmingReward.level} instead of
                      +{calculatorReward.level} to save{" "}
                      {extraRuns} {extraRuns === 1 ? "run" : "runs"}.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setCalculatorLevel(bestFarmingReward.level)
                      }
                    >
                      Use recommended key →
                    </button>
                  </>
                ) : (
                  <>
                    Your selected key needs {runsNeeded}{" "}
                    {runsNeeded === 1 ? "run" : "runs"}.
                    This matches the lowest possible run count
                    in the current Crest table.
                  </>
                )}
              </div>

              <p className={styles.calculatorDisclaimer}>
                Estimates use the displayed Crest reward
                table. Actual rewards may depend on
                completion conditions and game updates.
              </p>
            </div>
          </div>
        </section>

        {/* FULL LOOT TABLE */}

        <section className={styles.referenceSection}>
          <button
            type="button"
            className={styles.tableToggle}
            aria-expanded={showTable}
            onClick={() => setShowTable((current) => !current)}
          >
            <div>
              <span className={styles.overline}>
                FULL REFERENCE
              </span>
              <h2>Complete Mythic+ Loot Table</h2>
              <p>
                Compare gear and Crest rewards from +2 to +20.
              </p>
            </div>

            <span className={styles.toggleSymbol}>
              {showTable ? "−" : "+"}
            </span>
          </button>

          {showTable && (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>KEY</th>
                    <th>DUNGEON</th>
                    <th>DUNGEON TRACK</th>
                    <th>VAULT</th>
                    <th>VAULT TRACK</th>
                    <th>CREST TIER</th>
                    <th>CRESTS / RUN</th>
                  </tr>
                </thead>

                <tbody>
                  {rewards.map((reward) => (
                    <tr
                      key={reward.level}
                      className={
                        level === reward.level
                          ? styles.selectedRow
                          : ""
                      }
                    >
                      <td>+{reward.level}</td>
                      <td>{reward.dungeon}</td>
                      <td>{reward.dungeonTrack}</td>
                      <td>{reward.vault}</td>
                      <td>{reward.vaultTrack}</td>
                      <td>{reward.crest}</td>
                      <td>{reward.crestAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* GUIDE */}

        <section className={styles.guideSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>
                THE ESSENTIALS
              </span>

              <h2>How the Great Vault Works</h2>

              <p>
                Everything you need to plan your
                weekly Mythic+ rewards.
              </p>
            </div>
          </div>

          <div className={styles.guideGrid}>
            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>
                01 / COMPLETE
              </span>
              <h3>Run your dungeons</h3>
              <p>
                Complete Mythic+ dungeons throughout
                the week. Your qualifying key levels
                determine your Vault reward item levels.
              </p>
            </article>

            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>
                02 / UNLOCK
              </span>
              <h3>Earn up to 3 choices</h3>
              <p>
                One, four and eight qualifying runs
                unlock the three dungeon reward choices.
              </p>
            </article>

            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>
                03 / CLAIM
              </span>
              <h3>Choose your reward</h3>
              <p>
                After the weekly reset, open your
                Great Vault and select one reward
                from your available choices.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ */}

        <section className={styles.faqSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>
                COMMON QUESTIONS
              </span>
              <h2>Mythic+ Rewards FAQ</h2>
            </div>
          </div>

          <div className={styles.faqList}>
            {faq.map((item, index) => (
              <div
                key={item.question}
                className={styles.faqItem}
                data-open={openFaq === index}
              >
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() =>
                    setOpenFaq(
                      openFaq === index ? null : index
                    )
                  }
                >
                  <span>{item.question}</span>
                  <span>
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>

                {openFaq === index && (
                  <p>{item.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className={styles.disclaimer}>
          Seasonal reward values can change with game
          updates. Crest calculations are estimates
          and should be checked against current in-game
          rewards before relying on them.
        </p>
      </div>
    </main>
  );
}
