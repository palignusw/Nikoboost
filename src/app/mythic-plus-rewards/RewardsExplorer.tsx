
"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.scss";

type Reward = {
  level: number;
  dungeon: number;
  dungeonTrack: string;
  vault: number;
  vaultTrack: string;
  crest: string;
};

// Сохраняем таблицу из предыдущей версии.
// Перед публикацией данные сезона нужно ещё раз сверить.
const rewards: Reward[] = [
  { level: 2, dungeon: 295, dungeonTrack: "Champion 2/6", vault: 305, vaultTrack: "Hero 1/6", crest: "Champion" },
  { level: 3, dungeon: 295, dungeonTrack: "Champion 2/6", vault: 305, vaultTrack: "Hero 1/6", crest: "Champion" },
  { level: 4, dungeon: 298, dungeonTrack: "Champion 3/6", vault: 308, vaultTrack: "Hero 2/6", crest: "Hero" },
  { level: 5, dungeon: 302, dungeonTrack: "Champion 4/6", vault: 308, vaultTrack: "Hero 2/6", crest: "Hero" },
  { level: 6, dungeon: 305, dungeonTrack: "Hero 1/6", vault: 311, vaultTrack: "Hero 3/6", crest: "Hero" },
  { level: 7, dungeon: 305, dungeonTrack: "Hero 1/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Hero" },
  { level: 8, dungeon: 308, dungeonTrack: "Hero 2/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Hero" },
  { level: 9, dungeon: 308, dungeonTrack: "Hero 2/6", vault: 315, vaultTrack: "Hero 4/6", crest: "Myth" },
  ...Array.from({ length: 11 }, (_, i) => ({
    level: i + 10,
    dungeon: 311,
    dungeonTrack: "Hero 3/6",
    vault: 318,
    vaultTrack: "Myth 1/6",
    crest: "Myth",
  })),
];

const faq = [
  {
    question: "How many Mythic+ runs unlock all Great Vault slots?",
    answer:
      "You need 8 qualifying dungeon completions to unlock all three dungeon reward choices. The first and second choices unlock after 1 and 4 runs.",
  },
  {
    question: "How is the Great Vault item level calculated?",
    answer:
      "Your first dungeon slot uses your highest completed key, the second uses your fourth-highest, and the third uses your eighth-highest qualifying run.",
  },
  {
    question: "Do higher keys always provide better gear?",
    answer:
      "No. Dungeon and Great Vault item levels have seasonal caps. Keys above the reward cap can still be useful for rating, achievements, and other progression goals.",
  },
  {
    question: "Does this planner track my character automatically?",
    answer:
      "No. This is a manual planning tool. Add the key levels you have completed or plan to complete to preview your weekly Vault options.",
  },
];

function rewardFor(level: number) {
  return rewards.find((reward) => reward.level === level) ?? rewards[8];
}

export default function RewardsExplorer() {
  const [level, setLevel] = useState(10);
  const [runs, setRuns] = useState<number[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selected = rewardFor(level);

  const vault = useMemo(() => {
    const sorted = [...runs].sort((a, b) => b - a);

    return [1, 4, 8].map((required) => {
      const key = sorted[required - 1];

      return key === undefined ? null : rewardFor(key);
    });
  }, [runs]);

  const addRun = () => {
    setRuns((previous) => [...previous, level]);
  };

  const removeRun = (index: number) => {
    setRuns((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

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
              Compare keystone rewards, explore item levels, and
              plan your weekly Great Vault — all in one place.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroMetaItem}>
              <span>MAX DUNGEON LOOT</span>
              <strong>311 <small>iLvl</small></strong>
            </div>

            <div className={styles.heroMetaDivider} />

            <div className={styles.heroMetaItem}>
              <span>MAX VAULT REWARD</span>
              <strong>318 <small>iLvl</small></strong>
            </div>
          </div>
        </header>

        <section className={styles.workspace} aria-labelledby="explorer-heading">
          <div className={styles.workspaceHeader}>
            <div>
              <span className={styles.overline}>REWARD EXPLORER</span>
              <h2 id="explorer-heading">Choose your key level</h2>
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
                    className={`${styles.keyButton} ${
                      level === reward.level ? styles.keyActive : ""
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
                  Higher keys can increase rewards up to the seasonal
                  cap. Select any level to see its loot.
                </p>
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.previewTop}>
                <span>REWARD PREVIEW</span>
                <span className={styles.previewKey}>KEY +{level}</span>
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

                <div className={`${styles.previewRow} ${styles.vaultReward}`}>
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
              </div>

              <div className={styles.previewBottom}>
                <div>
                  <span>CREST TIER</span>
                  <strong>{selected.crest} Mistcrest</strong>
                </div>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addRun}
                >
                  <span>+</span>
                  Add to Vault Planner
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.plannerSection} aria-labelledby="planner-heading">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>WEEKLY PROGRESSION</span>
              <h2 id="planner-heading">Great Vault Planner</h2>
              <p>
                Build your weekly run list and preview your Vault rewards.
              </p>
            </div>

            <div className={styles.runCounter}>
              <strong>{runs.length}</strong>
              <span>RUNS ADDED</span>
            </div>
          </div>

          <div className={styles.planner}>
            <div className={styles.plannerTop}>
              <div>
                <span className={styles.smallLabel}>DUNGEON PROGRESS</span>
                <strong>{Math.min(runs.length, 8)} / 8</strong>
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
                  width: `${Math.min((runs.length / 8) * 100, 100)}%`,
                }}
              />
            </div>

            <div className={styles.vaultGrid}>
              {[1, 4, 8].map((required, index) => {
                const reward = vault[index];
                const unlocked = reward !== null;

                return (
                  <div
                    className={`${styles.vaultSlot} ${
                      unlocked ? styles.vaultSlotActive : ""
                    }`}
                    key={required}
                  >
                    <div className={styles.slotHeader}>
                      <span>VAULT SLOT 0{index + 1}</span>
                      <span className={styles.slotState}>
                        {unlocked ? "● UNLOCKED" : "○ LOCKED"}
                      </span>
                    </div>

                    <div className={styles.slotBody}>
                      {reward ? (
                        <>
                          <strong>{reward.vault}</strong>
                          <span>iLvl · {reward.vaultTrack}</span>
                        </>
                      ) : (
                        <>
                          <strong className={styles.lockedValue}>—</strong>
                          <span>
                            {required - runs.length} more{" "}
                            {required - runs.length === 1 ? "run" : "runs"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={styles.slotFooter}>
                      {unlocked
                        ? `Based on +${reward.level}`
                        : `Requires ${required} completed ${
                            required === 1 ? "run" : "runs"
                          }`}
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
            </div>
          </div>
        </section>

        <section className={styles.referenceSection}>
          <button
            type="button"
            className={styles.tableToggle}
            aria-expanded={showTable}
            onClick={() => setShowTable((current) => !current)}
          >
            <div>
              <span className={styles.overline}>FULL REFERENCE</span>
              <h2>Complete Mythic+ Loot Table</h2>
              <p>Compare every key level from +2 to +20.</p>
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
                    <th>CREST</th>
                  </tr>
                </thead>

                <tbody>
                  {rewards.map((reward) => (
                    <tr
                      key={reward.level}
                      className={
                        level === reward.level ? styles.selectedRow : ""
                      }
                    >
                      <td>+{reward.level}</td>
                      <td>{reward.dungeon}</td>
                      <td>{reward.dungeonTrack}</td>
                      <td>{reward.vault}</td>
                      <td>{reward.vaultTrack}</td>
                      <td>{reward.crest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.guideSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>THE ESSENTIALS</span>
              <h2>How the Great Vault Works</h2>
              <p>
                Everything you need to plan your weekly Mythic+ rewards.
              </p>
            </div>
          </div>

          <div className={styles.guideGrid}>
            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>01 / COMPLETE</span>
              <h3>Run your dungeons</h3>
              <p>
                Complete Mythic+ dungeons throughout the week.
                Your highest completed keys determine the item
                levels offered in your dungeon Vault choices.
              </p>
            </article>

            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>02 / UNLOCK</span>
              <h3>Earn up to 3 choices</h3>
              <p>
                Your first, fourth, and eighth qualifying dungeon
                completions unlock the three dungeon reward slots.
              </p>
            </article>

            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>03 / CLAIM</span>
              <h3>Choose your reward</h3>
              <p>
                After the weekly reset, open your Great Vault
                and choose one reward from your available options.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.overline}>COMMON QUESTIONS</span>
              <h2>Mythic+ Rewards FAQ</h2>
            </div>
          </div>

          <div className={styles.faqList}>
            {faq.map((item, index) => (
              <div className={styles.faqItem} key={item.question}>
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                >
                  <span>{item.question}</span>
                  <span>{openFaq === index ? "−" : "+"}</span>
                </button>

                {openFaq === index && <p>{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>

        <p className={styles.disclaimer}>
          Reward values are season-specific and may change with game
          updates. Verify current item levels before relying on
          this guide.
        </p>
      </div>
    </main>
  );
}
