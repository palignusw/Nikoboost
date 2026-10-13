import type {
  MythicPlusConfig,
} from "../hooks/useMythicPlusConfig";

import {
  formatRole,
} from "../hooks/useMythicPlusConfig";

import {
  SummaryRow,
} from "../components/ConfiguratorUI";

import styles from "../MythicPlus.module.scss";

export default function OrderSummary({
  config,
  onReserve,
}: {
  config:
    MythicPlusConfig;

  onReserve:
    () => void;
}) {
  return (
    <aside
      className={
        styles.summary
      }
    >
      <div
        className={
          styles.available
        }
      >
        <span />
        AVAILABLE
      </div>

      <span
        className={
          styles.summaryLabel
        }
      >
        YOUR ORDER
      </span>

      <h3>
        Mythic +
        {config.keyLevel}
      </h3>

      <div
        className={
          styles.orderInfo
        }
      >
        <SummaryRow
          label="Runs"
          value={`${config.runs}`}
        />

        <SummaryRow
          label="Mode"
          value={
            config.participation ===
            "play"
              ? "I Play"
              : "AFK / Minimal"
          }
        />

        {config.participation ===
          "play" && (
          <SummaryRow
            label="Role"
            value={formatRole(
              config.role
            )}
          />
        )}

        <SummaryRow
          label="Dungeon"
          value={
            config.specificDungeon
              ? `${config.allocatedSpecificRuns}/${config.runs} specific`
              : "Any"
          }
        />

        <SummaryRow
          label="Class"
          value={
            config.playerClass
          }
        />

        <SummaryRow
          label="Armor"
          value={
            config.armorType
          }
        />

        <SummaryRow
          label="Traders"
          value={
            config.traders
              ? `+${config.traders}`
              : "None"
          }
        />

        <SummaryRow
          label="Region"
          value={
            config.region
          }
        />
      </div>

      {config.specificDungeon &&
        config.selectedDungeons
          .length > 0 && (
          <div
            className={
              styles.selectedDungeonSummary
            }
          >
            <span>
              SPECIFIC
              DUNGEONS
            </span>

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
                    {
                      dungeon
                    }
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
          </div>
        )}

      <div
        className={
          styles.breakdown
        }
      >
        <SummaryRow
          label="Base"
          value={config.calculation.base.toLocaleString(
            "en-US"
          )}
        />

        {config.calculation
          .afkExtra >
          0 && (
          <SummaryRow
            label="AFK / Minimal"
            value={`+${config.calculation.afkExtra.toLocaleString(
              "en-US"
            )}`}
          />
        )}

        {config.calculation
          .roleExtra >
          0 && (
          <SummaryRow
            label={`${formatRole(
              config.role
            )} role`}
            value={`+${config.calculation.roleExtra.toLocaleString(
              "en-US"
            )}`}
          />
        )}

        {config.calculation
          .specificExtra >
          0 && (
          <SummaryRow
            label="Specific dungeons"
            value={`+${config.calculation.specificExtra.toLocaleString(
              "en-US"
            )}`}
          />
        )}

        {config.calculation
          .traderExtra >
          0 && (
          <SummaryRow
            label="Loot traders"
            value={`+${config.calculation.traderExtra.toLocaleString(
              "en-US"
            )}`}
          />
        )}

        {config.calculation
          .discount >
          0 && (
          <SummaryRow
            label="Package discount"
            value={`-${config.calculation.discount.toLocaleString(
              "en-US"
            )}`}
            positive
          />
        )}
      </div>

      <div
        className={
          styles.total
        }
      >
        <span>
          Total
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

      <button
        type="button"
        className={
          styles.reserve
        }
        onClick={
          onReserve
        }
      >
        Reserve run

        <span>
          →
        </span>
      </button>

      <p
        className={
          styles.note
        }
      >
        No registration
        required. You&apos;ll
        enter your BattleTag
        and contact details
        on the next step.
      </p>
    </aside>
  );
}