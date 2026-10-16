import type {
  MythicPlusConfig,
}from "../../hooks/useMythicPlusConfig";

import {
  formatRole,
} from "../../hooks/useMythicPlusConfig";

import styles from "./ReviewStep.module.scss";

export default function ReviewStep({
  config,
}: {
  config: MythicPlusConfig;
}) {
  return (
    <div
      className={
        styles.reviewStep
      }
    >
      <div
        className={
          styles.reviewHeader
        }
      >
        <span>
          ORDER READY
        </span>

        <h3>
          Check your run
        </h3>

        <p>
          Make sure everything
          looks right before
          reserving your run.
        </p>
      </div>

      <div
        className={
          styles.reviewGrid
        }
      >
        <ReviewItem
          label="Key level"
          value={`+${config.keyLevel}`}
        />

        <ReviewItem
          label="Runs"
          value={`${config.runs}`}
        />

        <ReviewItem
          label="Participation"
          value={
            config.participation ===
            "play"
              ? "I Play"
              : "AFK / Minimal"
          }
        />

        <ReviewItem
          label="Class"
          value={
            config.playerClass
          }
        />

        {config.participation ===
          "play" && (
          <ReviewItem
            label="Role"
            value={formatRole(
              config.role
            )}
          />
        )}

        <ReviewItem
          label="Armor"
          value={
            config.armorType
          }
        />

        <ReviewItem
          label="Loot traders"
          value={
            config.traders ===
            0
              ? "None"
              : `+${config.traders}`
          }
        />

        <ReviewItem
          label="Region"
          value={
            config.region
          }
        />
      </div>

      <div
        className={
          styles.reviewDungeons
        }
      >
        <span>
          DUNGEONS
        </span>

        {!config.specificDungeon ? (
          <strong>
            Any dungeon
          </strong>
        ) : (
          <>
            {config.selectedDungeons.map(
              ({
                dungeon,
                count,
              }) => (
                <div
                  key={
                    dungeon
                  }
                >
                  <span>
                    {dungeon}
                  </span>

                  <strong>
                    ×{count}
                  </strong>
                </div>
              )
            )}

            {config.remainingRuns >
              0 && (
              <div>
                <span>
                  Any dungeon
                </span>

                <strong>
                  ×
                  {
                    config.remainingRuns
                  }
                </strong>
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={
          styles.reviewTotal
        }
      >
        <span>
          TOTAL
        </span>

        <strong>
          {config.calculation.total.toLocaleString(
            "en-US"
          )}

          <small>
            {" "}
            GOLD
          </small>
        </strong>
      </div>

      <p
        className={
          styles.reviewHint
        }
      >
        Your full order summary
        stays visible on the
        right.
      </p>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className={
        styles.reviewItem
      }
    >
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );
}