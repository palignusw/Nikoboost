import {
  AFK_SURCHARGE,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../hooks/useMythicPlusConfig";

import {
  ChoiceCard,
  Divider,
  OptionSection,
} from "../components/ConfiguratorUI";

import styles from "../MythicPlus.module.scss";

export default function RunSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  return (
    <>
      <OptionSection
        number="01"
        title="Key level"
        value={`+${config.keyLevel}`}
      >
        <div
          className={
            styles.keyGrid
          }
        >
          {config.keyLevels.map(
            (level) => (
              <button
                type="button"
                key={
                  level
                }
                className={
                  config.keyLevel ===
                  level
                    ? styles.activeOption
                    : styles.option
                }
                onClick={() =>
                  config.setKeyLevel(
                    level
                  )
                }
              >
                +{level}
              </button>
            )
          )}
        </div>
      </OptionSection>

      <Divider />

      <OptionSection
        number="02"
        title="Number of runs"
        value={`${config.runs} ${
          config.runs === 1
            ? "run"
            : "runs"
        }`}
      >
        <div
          className={
            styles.runControls
          }
        >

          <div
            className={
              styles.quickRuns
            }
          >
            {config.quickRunOptions.map(
              (amount) => {
                const unavailable =
                  amount <
                  config.allocatedSpecificRuns;

                return (
                  <button
                    type="button"
                    key={
                      amount
                    }
                    disabled={
                      unavailable
                    }
                    className={
                      config.runs ===
                      amount
                        ? styles.activeOption
                        : styles.option
                    }
                    onClick={() =>
                      config.setRunCount(
                        amount
                      )
                    }
                  >
                    {amount}

                    <span>
                      {amount ===
                      1
                        ? "RUN"
                        : "RUNS"}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          <div
            className={
              styles.counter
            }
          >
            <button
              type="button"
              disabled={
                config.runs <=
                  1 ||
                config.runs <=
                  config.allocatedSpecificRuns
              }
              onClick={
                config.decreaseRuns
              }
            >
              −
            </button>

            <strong>
              {
                config.runs
              }
            </strong>

            <button
              type="button"
              disabled={
                config.runs >=
                50
              }
              onClick={
                config.increaseRuns
              }
            >
              +
            </button>
          </div>

        </div>

        {config.calculation
          .discountPercent >
          0 && (
          <div
            className={
              styles.discountBadge
            }
          >
            SAVE{" "}
            {Math.round(
              config.calculation
                .discountPercent *
                100
            )}
            % WITH THIS PACKAGE
          </div>
        )}
      </OptionSection>

      <Divider />

      <OptionSection
        number="03"
        title="Participation"
        value={
          config.participation ===
          "play"
            ? "I Play"
            : "AFK / Minimal"
        }
      >
        <div
          className={
            styles.twoCards
          }
        >
          <ChoiceCard
            active={
              config.participation ===
              "play"
            }
            title="I Play"
            description="Play normally together with the boosting team."
            badge="BEST PRICE"
            onClick={() =>
              config.handleParticipation(
                "play"
              )
            }
          />

          <ChoiceCard
            active={
              config.participation ===
              "afk"
            }
            title="AFK / Minimal"
            description="Minimal participation. Some mechanics may still require movement."
            price={`+${Math.round(
              AFK_SURCHARGE *
                100
            )}%`}
            onClick={() =>
              config.handleParticipation(
                "afk"
              )
            }
          />
        </div>
      </OptionSection>
    </>
  );
}