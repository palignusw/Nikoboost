
import {
  AFK_SURCHARGE,
  getRunsDiscount,
  basePrices,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../../hooks/useMythicPlusConfig";

import {
  ChoiceCard,
  Divider,
  OptionSection,
} from "../../components/ConfiguratorUI";

import styles from "./RunSetup.module.scss";
import { getMythicReward } from "@/data/wowSeason";

export default function RunSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  const selectedDiscount = Math.round(
    config.calculation.discountPercent * 100
  );

  const hasAllocatedDungeons =
    config.allocatedSpecificRuns > 0;
  const reward = config.confirmed.keyLevel
    ? getMythicReward(config.keyLevel)
    : null;

  const estimatedCrests =
    reward && config.confirmed.runs
      ? reward.crestAmount * config.runs
      : null;

  return (
    <>
      {/* =====================================
          00 — RUN GOAL
      ===================================== */}

      <div className={styles.goalSection}>
        <div className={styles.goalHeading}>
          <span>CHOOSE YOUR GOAL</span>
          <p>What are you running Mythic+ for?</p>
        </div>

        <div className={styles.goalGrid}>
          <button
            type="button"
            aria-pressed={config.runGoal === "standard"}
            className={`${styles.goalCard} ${config.runGoal === "standard"
              ? styles.goalCardActive
              : ""
              }`}
            onClick={() => config.setRunGoal("standard")}
          >
            <span className={styles.goalIcon}>⚔</span>

            <span className={styles.goalContent}>
              <strong>Standard Run</strong>
              <small>
                Gear, Great Vault & dungeon completion
              </small>
            </span>

            <span className={styles.goalRadio} />
          </button>

          <button
            type="button"
            aria-pressed={config.runGoal === "crest"}
            className={`${styles.goalCard} ${config.runGoal === "crest"
              ? styles.goalCardActive
              : ""
              }`}
            onClick={() => {
              config.resetKeyLevelForCrest();
              config.setRunGoal("crest");
            }}
          >
            <span className={styles.goalIcon}>✦</span>

            <span className={styles.goalContent}>
              <strong>Crest Farming</strong>
              <small>
                Farm upgrade currency efficiently
              </small>
            </span>

            <span className={styles.goalRadio} />
          </button>
        </div>
      </div>

      {/* =====================================
          CREST FARMING SETUP
      ===================================== */}

      {config.runGoal === "crest" && (
        <div className={styles.crestSetup}>
          <div className={styles.crestSetupHeader}>
            <span className={styles.crestSetupIcon}>✦</span>

            <div>
              <strong>Crest Farming</strong>
              <p>
                Choose your key level and number of runs below.
                Your estimated rewards will update automatically.
              </p>
            </div>
          </div>

          <div className={styles.crestRegion}>
            <span className={styles.crestRegionLabel}>
              SELECT REGION
            </span>

            <div className={styles.crestRegionOptions}>
              {(["EU", "NA"] as const).map((region) => (
                <button
                  key={region}
                  type="button"
                  aria-pressed={
                    config.confirmed.region &&
                    config.region === region
                  }
                  className={
                    config.confirmed.region &&
                      config.region === region
                      ? styles.crestRegionActive
                      : styles.crestRegionButton
                  }
                  onClick={() => config.setRegion(region)}
                >
                  {region === "EU"
                    ? "Europe (EU)"
                    : "North America (NA)"}
                </button>
              ))}
            </div>
          </div>

          {reward && (
            <div className={styles.crestSetupStats}>
              <div>
                <span>KEY LEVEL</span>
                <strong>
                  {config.confirmed.keyLevel
                    ? `+${config.keyLevel}`
                    : "—"}
                </strong>
              </div>

              <div>
                <span>CREST TYPE</span>
                <strong>{reward?.crest ?? "—"}</strong>
              </div>

              <div>
                <span>ESTIMATED CRESTS</span>
                <strong>{estimatedCrests ?? "—"}</strong>
              </div>
            </div>
          )}

          <p className={styles.crestSetupDescription}>
            {!config.confirmed.keyLevel
              ? "Select a key level to see the Crest type."
              : !config.confirmed.runs
                ? "Select the number of runs to calculate your rewards."
                : reward
                  ? `Estimated ${reward.crest} Mistcrests across ${config.runs} ${config.runs === 1 ? "run" : "runs"
                  }. Rewards depend on completion conditions.`
                  : "Crest rewards are unavailable for this key level."}
          </p>
        </div>
      )}

      <Divider />

      {/* =====================================
          01 — KEY LEVEL
      ===================================== */}

      <OptionSection
        number="01"
        title="Key level"
        value={`+${config.keyLevel}`}
      >
        <div className={styles.keyGrid}>
          {config.keyLevels
            .filter((level) =>
              config.runGoal === "crest" ? level <= 12 : true
            )
            .map((level) => {
              const active =
                config.confirmed.keyLevel &&
                config.keyLevel === level;

              const price = basePrices[level];

              const formattedPrice =
                price.toLocaleString("en-US");

              const shortPrice =
                price >= 1_000_000
                  ? `${+(price / 1_000_000).toFixed(2)}M`
                  : `${+(price / 1_000).toFixed(1)}K`;

              return (
                <button
                  type="button"
                  key={level}
                  aria-pressed={active}
                  aria-label={`Mythic Plus ${level}, ${formattedPrice} gold per run`}
                  className={`${active
                    ? styles.activeOption
                    : styles.option
                    } ${styles.keyButton}`}
                  onClick={() =>
                    config.setKeyLevel(level)
                  }
                >
                  <span className={styles.keyNumber}>
                    +{level}
                  </span>

                  {/* Mobile: visible price */}
                  <span
                    className={styles.keyMobilePrice}
                    aria-hidden="true"
                  >
                    {shortPrice}
                  </span>

                  {/* Desktop: hover tooltip */}
                  <span
                    className={styles.keyTooltip}
                    aria-hidden="true"
                  >
                    <span className={styles.tooltipLabel}>
                      KEY +{level}
                    </span>

                    <strong className={styles.tooltipPrice}>
                      {formattedPrice}
                      <span> GOLD</span>
                    </strong>

                    <span className={styles.tooltipFooter}>
                      PER RUN
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      </OptionSection>

      <Divider />

      {/* =====================================
          02 — NUMBER OF RUNS
      ===================================== */}

      <OptionSection
        number="02"
        title="Number of runs"
        value={`${config.runs} ${config.runs === 1 ? "run" : "runs"
          }`}
      >
        <div className={styles.runControls}>
          <div className={styles.quickRuns}>
            {config.quickRunOptions.map((amount) => {
              const unavailable =
                amount < config.allocatedSpecificRuns;

              const active =
                config.confirmed.runs &&
                config.runs === amount;

              const discountPercent = Math.round(
                getRunsDiscount(amount) * 100
              );

              return (
                <button
                  type="button"
                  key={amount}
                  disabled={unavailable}
                  aria-pressed={active}
                  aria-label={`${amount} ${amount === 1 ? "run" : "runs"
                    }${discountPercent > 0
                      ? `, save ${discountPercent} percent`
                      : ""
                    }`}
                  className={
                    active
                      ? styles.activeOption
                      : styles.option
                  }
                  onClick={() =>
                    config.setRunCount(amount)
                  }
                >
                  <strong>{amount}</strong>

                  <span className={styles.runCaption}>
                    {amount === 1
                      ? "RUN"
                      : "RUNS"}
                  </span>

                  {discountPercent > 0 && (
                    <span className={styles.quickDiscount}>
                      SAVE {discountPercent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={styles.counter}>
            <button
              type="button"
              aria-label="Decrease number of runs"
              disabled={
                config.runs <= 1 ||
                config.runs <= config.allocatedSpecificRuns
              }
              onClick={config.decreaseRuns}
            >
              −
            </button>

            <strong aria-live="polite">
              {config.runs}
            </strong>

            <button
              type="button"
              aria-label="Increase number of runs"
              disabled={config.runs >= 50}
              onClick={config.increaseRuns}
            >
              +
            </button>
          </div>
        </div>

        {selectedDiscount > 0 && (
          <div className={styles.discountBadge}>
            SAVE {selectedDiscount}% WITH THIS PACKAGE
          </div>
        )}

        {hasAllocatedDungeons && (
          <p className={styles.runsHint}>
            You have already selected{" "}
            <strong>
              {config.allocatedSpecificRuns}
            </strong>{" "}
            specific{" "}
            {config.allocatedSpecificRuns === 1
              ? "run"
              : "runs"}
            . To select fewer runs, first adjust your
            dungeon selection.
          </p>
        )}
      </OptionSection>

      <Divider />

      {/* =====================================
          03 — PARTICIPATION
      ===================================== */}

      <OptionSection
        number="03"
        title="Participation"
        value={
          !config.confirmed.participation
            ? "Not selected"
            : config.participation === "play"
              ? "I Play"
              : "AFK / Minimal"
        }
      >
        <div className={styles.twoCards}>
          <ChoiceCard
            active={
              config.confirmed.participation &&
              config.participation === "play"
            }
            title="I Play"
            description="Play normally together with the boosting team."
            badge="PLAY WITH TEAM"
            onClick={() =>
              config.handleParticipation("play")
            }
          />

          <ChoiceCard
            active={
              config.confirmed.participation &&
              config.participation === "afk"
            }
            title="AFK / Minimal"
            description="Minimal participation. Some mechanics may still require movement."
            price={`+${Math.round(
              AFK_SURCHARGE * 100
            )}%`}
            onClick={() =>
              config.handleParticipation("afk")
            }
          />
        </div>
      </OptionSection>
    </>
  );
}
