
import {
  AFK_SURCHARGE,
  getRunsDiscount,
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

  return (
    <>
      {/* =====================================
          01 — KEY LEVEL
      ===================================== */}

      <OptionSection
        number="01"
        title="Key level"
        value={`+${config.keyLevel}`}
      >
        <div className={styles.keyGrid}>
          {config.keyLevels.map((level) => {
    const active =
  config.confirmed.keyLevel &&
  config.keyLevel === level;

            return (
              <button
                type="button"
                key={level}
                aria-pressed={active}
                aria-label={`Mythic Plus ${level}`}
                className={
                  active
                    ? styles.activeOption
                    : styles.option
                }
                onClick={() =>
                  config.setKeyLevel(level)
                }
              >
                +{level}
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
        value={`${config.runs} ${
          config.runs === 1 ? "run" : "runs"
        }`}
      >
        <div className={styles.runControls}>
          <div className={styles.quickRuns}>
            {config.quickRunOptions.map(
              (amount) => {
                const unavailable =
                  amount <
                  config.allocatedSpecificRuns;

         const active =
  config.confirmed.runs &&
  config.runs === amount;

                const discountPercent =
                  Math.round(
                    getRunsDiscount(amount) * 100
                  );

                return (
                  <button
                    type="button"
                    key={amount}
                    disabled={unavailable}
                    aria-pressed={active}
                    aria-label={`${amount} ${
                      amount === 1
                        ? "run"
                        : "runs"
                    }${
                      discountPercent > 0
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
                      <span
                        className={styles.quickDiscount}
                      >
                        SAVE {discountPercent}%
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          <div className={styles.counter}>
            <button
              type="button"
              aria-label="Decrease number of runs"
              disabled={
                config.runs <= 1 ||
                config.runs <=
                  config.allocatedSpecificRuns
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
          <div
            className={styles.discountBadge}
          >
            SAVE {selectedDiscount}% WITH THIS
            PACKAGE
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
            . To select fewer runs, first
            adjust your dungeon selection.
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
          config.participation === "play"
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
