
import type {
  MythicPlusConfig,
} from "../../hooks/useMythicPlusConfig";

import {
  formatRole,
} from "../../hooks/useMythicPlusConfig";

import {
  SummaryRow,
} from "../../components/ConfiguratorUI";

import styles from "./OrderSummary.module.scss";

type Props = {
  config: MythicPlusConfig;
  onReserve: () => void;
};

const formatGold = (value: number) =>
  value.toLocaleString("en-US");

export default function OrderSummary({
  config,
  onReserve,
}: Props) {
  const {
    base,
    afkExtra,
    roleExtra,
    specificExtra,
    traderExtra,
    discount,
    total,
  } = config.calculation;

  const beforeDiscount =
    base +
    afkExtra +
    roleExtra +
    specificExtra +
    traderExtra;

  const discountPercent =
    beforeDiscount > 0
      ? Math.round(
          (discount / beforeDiscount) * 100
        )
      : 0;

  return (
    <aside className={styles.summary}>
      <div className={styles.available}>
        <span />
        AVAILABLE
      </div>

      <span className={styles.summaryLabel}>
        YOUR ORDER
      </span>

      <h3>
        Mythic +{config.keyLevel}
      </h3>

      <div className={styles.orderInfo}>
        <SummaryRow
          label="Runs"
          value={`${config.runs}`}
        />

        <SummaryRow
          label="Mode"
          value={
            config.participation === "play"
              ? "I Play"
              : "AFK / Minimal"
          }
        />

        {config.participation === "play" && (
          <SummaryRow
            label="Role"
            value={formatRole(config.role)}
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
          value={config.playerClass}
        />

        <SummaryRow
          label="Armor"
          value={config.armorType}
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
          value={config.region}
        />
      </div>

      {config.specificDungeon &&
        config.selectedDungeons.length > 0 && (
          <div
            className={
              styles.selectedDungeonSummary
            }
          >
            <span>SPECIFIC DUNGEONS</span>

            {config.selectedDungeons.map(
              ({ dungeon, count }) => (
                <div key={dungeon}>
                  <span>{dungeon}</span>
                  <strong>×{count}</strong>
                </div>
              )
            )}

            {config.remainingRuns > 0 && (
              <div>
                <span>Any dungeon</span>
                <strong>
                  ×{config.remainingRuns}
                </strong>
              </div>
            )}
          </div>
        )}

      <div className={styles.breakdown}>
        <SummaryRow
          label="Base"
          value={formatGold(base)}
        />

        {afkExtra > 0 && (
          <SummaryRow
            label="AFK / Minimal"
            value={`+${formatGold(afkExtra)}`}
          />
        )}

        {roleExtra > 0 && (
          <SummaryRow
            label={`${formatRole(config.role)} role`}
            value={`+${formatGold(roleExtra)}`}
          />
        )}

        {specificExtra > 0 && (
          <SummaryRow
            label="Specific dungeons"
            value={`+${formatGold(specificExtra)}`}
          />
        )}

        {traderExtra > 0 && (
          <SummaryRow
            label="Loot traders"
            value={`+${formatGold(traderExtra)}`}
          />
        )}

        {discount > 0 && (
          <SummaryRow
            label="Package discount"
            value={`-${formatGold(discount)}`}
            positive
          />
        )}
      </div>

      <div className={styles.total}>
        <div className={styles.totalHeader}>
          <span className={styles.totalLabel}>
            TOTAL PRICE
          </span>

          {discountPercent > 0 && (
            <span className={styles.discountBadge}>
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        <div
          className={styles.priceContainer}
          aria-live="polite"
          aria-atomic="true"
        >
          <strong
            key={total}
            className={styles.priceValue}
            data-testid="order-total"
          >
            {formatGold(total)}
            <small> GOLD</small>
          </strong>
        </div>

        {discount > 0 && (
          <p className={styles.savingsText}>
            You save {formatGold(discount)} gold
            with this package
          </p>
        )}
      </div>

      <button
        type="button"
        className={styles.reserve}
        onClick={onReserve}
      >
        <span className={styles.reserveText}>
          Reserve run
        </span>

        <span
          className={styles.reserveArrow}
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <p className={styles.note}>
        No registration required.
        You&apos;ll enter your BattleTag
        and contact details on the next step.
      </p>
    </aside>
  );
}
