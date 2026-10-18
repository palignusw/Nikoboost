
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
  canReserve: boolean;
  onReserve: () => void;
};

const formatGold = (value: number) =>
  value.toLocaleString("en-US");

const NOT_SELECTED = "Not selected";

export default function OrderSummary({
  config,
  canReserve,
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

  const {
    confirmed,
    participation,
    allowedRoles,
  } = config;

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

  const roleAutoSelected =
    confirmed.playerClass &&
    allowedRoles.length === 1;

  const roleSelected =
    confirmed.role || roleAutoSelected;

  const configurationComplete =
    config.canReserve;
  const showPrice =
    confirmed.keyLevel &&
    confirmed.runs;



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
        {confirmed.keyLevel
          ? `Mythic +${config.keyLevel}`
          : "Mythic+ Run"}
      </h3>

      <div className={styles.orderInfo}>
        <SummaryRow
          label="Key level"
          value={
            confirmed.keyLevel
              ? `+${config.keyLevel}`
              : NOT_SELECTED
          }
        />

        <SummaryRow
          label="Runs"
          value={
            confirmed.runs
              ? `${config.runs}`
              : NOT_SELECTED
          }
        />

        <SummaryRow
          label="Mode"
          value={
            confirmed.participation
              ? participation === "play"
                ? "I Play"
                : "AFK / Minimal"
              : NOT_SELECTED
          }
        />

        {(!confirmed.participation ||
          participation === "play") && (
            <SummaryRow
              label="Role"
              value={
                confirmed.participation &&
                  roleSelected
                  ? formatRole(config.role)
                  : NOT_SELECTED
              }
            />
          )}

        <SummaryRow
          label="Dungeon"
          value={
            !confirmed.dungeon
              ? NOT_SELECTED
              : config.specificDungeon
                ? `${config.allocatedSpecificRuns}/${config.runs} specific`
                : "Any"
          }
        />

        <SummaryRow
          label="Class"
          value={
            confirmed.playerClass
              ? config.playerClass
              : NOT_SELECTED
          }
        />

        <SummaryRow
          label="Armor"
          value={
            confirmed.playerClass
              ? config.armorType
              : NOT_SELECTED
          }
        />

        <SummaryRow
          label="Traders"
          value={
            confirmed.traders
              ? config.traders > 0
                ? `+${config.traders}`
                : "None"
              : NOT_SELECTED
          }
        />

        <SummaryRow
          label="Region"
          value={
            confirmed.region
              ? config.region
              : NOT_SELECTED
          }
        />
      </div>

      {confirmed.dungeon &&
        config.specificDungeon &&
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

      {showPrice && (
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
      )}

      <div className={styles.total}>
        <div className={styles.totalHeader}>
          <span className={styles.totalLabel}>
            {configurationComplete
              ? "TOTAL PRICE"
              : "ESTIMATED PRICE"}
          </span>

          {showPrice && discountPercent > 0 && (
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
          {showPrice ? (
            <strong
              key={total}
              className={styles.priceValue}
              data-testid="order-total"
            >
              {formatGold(total)}
              <small> GOLD</small>
            </strong>
          ) : (
            <span className={styles.totalLabel}>
              Select key level and runs
            </span>
          )}
        </div>

        {showPrice && discount > 0 && (
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
          {canReserve
            ? "Reserve run"
            : "Continue setup"}
        </span>

        <span
          className={styles.reserveArrow}
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <p className={styles.note}>
        {canReserve
          ? "No registration required. You'll enter your BattleTag and contact details on the next step."
          : "Complete the configuration steps before reserving your run."}
      </p>
    </aside>
  );
}
