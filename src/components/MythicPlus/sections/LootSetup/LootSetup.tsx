
import {
  traderSurcharges,
  type Region,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../../hooks/useMythicPlusConfig";

import {
  Divider,
  OptionSection,
} from "../../components/ConfiguratorUI";

import styles from "./LootSetup.module.scss";

export default function LootSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  const selectedSurcharge =
    Math.round(
      traderSurcharges[config.traders] * 100
    );

  return (
    <>
      <OptionSection
        number="06"
        title="Loot traders"
        value={
          config.traders === 0
            ? "Personal loot"
            : `+${config.traders} ${
                config.traders === 1
                  ? "trader"
                  : "traders"
              }`
        }
      >
        <div className={styles.lootIntro}>
          <div className={styles.lootIntroIcon}>
            ✦
          </div>

          <div className={styles.lootIntroText}>
            <strong>Increase your loot opportunities</strong>

            <p>
              Add teammates with matching armor types
              who can trade eligible loot to you.
            </p>
          </div>
        </div>

        <div className={styles.traders}>
          {[0, 1, 2, 3, 4].map((amount) => {
            const unavailable =
              amount > config.maxTraders;

            const selected =
              config.traders === amount;

            const surcharge =
              Math.round(
                traderSurcharges[amount] * 100
              );

            return (
              <button
                type="button"
                key={amount}
                disabled={unavailable}
                aria-pressed={selected}
                aria-label={
                  unavailable
                    ? `${amount} loot traders unavailable`
                    : amount === 0
                      ? "No loot traders, personal loot"
                      : `${amount} loot traders, ${surcharge}% extra`
                }
                onClick={() => {
                  if (!unavailable) {
                    config.setTraders(amount);
                  }
                }}
                className={
                  selected
                    ? styles.activeTrader
                    : styles.trader
                }
              >
                {selected && (
                  <span
                    className={styles.traderSelectedMark}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}

                <span
                  className={styles.traderIcon}
                  aria-hidden="true"
                >
                  {amount === 0 ? "◇" : "✦"}
                </span>

                <strong>
                  {amount === 0
                    ? "None"
                    : `+${amount}`}
                </strong>

                <span className={styles.traderPrice}>
                  {unavailable
                    ? "Unavailable"
                    : amount === 0
                      ? "NO EXTRA"
                      : `+${surcharge}%`}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.lootSummary}>
          <div className={styles.lootSummaryTop}>
            <div>
              <span className={styles.summaryEyebrow}>
                YOUR LOOT SETUP
              </span>

              <strong>
                {config.traders === 0
                  ? "Personal loot"
                  : `${config.traders} ${
                      config.traders === 1
                        ? "Loot Trader"
                        : "Loot Traders"
                    }`}
              </strong>
            </div>

            <span
              className={
                selectedSurcharge > 0
                  ? styles.summaryPrice
                  : styles.summaryFree
              }
            >
              {selectedSurcharge > 0
                ? `+${selectedSurcharge}%`
                : "NO EXTRA"}
            </span>
          </div>

          <div className={styles.lootSummaryDivider} />

          <div className={styles.armorRow}>
            <span>Matching armor</span>

            <strong>{config.armorType}</strong>
          </div>

          <p className={styles.lootDisclaimer}>
            {config.traders === 0
              ? "No additional loot traders selected."
              : "Traders can offer eligible tradable items. Specific drops are not guaranteed."}
          </p>
        </div>

        {config.maxTraders < 4 && (
          <p className={styles.availabilityNote}>
            <span aria-hidden="true">ⓘ</span>
            A maximum of {config.maxTraders} matching
            loot traders is available for this
            armor type.
          </p>
        )}
      </OptionSection>

      <Divider />

      <OptionSection
        number="07"
        title="Region"
        value={config.region}
      >
        <div className={styles.regionGrid}>
          {(["EU", "NA"] as Region[]).map(
            (region) => {
              const selected =
                config.region === region;

              return (
                <button
                  type="button"
                  key={region}
                  aria-pressed={selected}
                  onClick={() =>
                    config.setRegion(region)
                  }
                  className={
                    selected
                      ? styles.activeOption
                      : styles.option
                  }
                >
                  <span className={styles.regionSymbol}>
                    {region === "EU" ? "✦" : "◆"}
                  </span>

                  <span className={styles.regionContent}>
                    <strong>{region}</strong>

                    <small>
                      {region === "EU"
                        ? "Europe"
                        : "North America"}
                    </small>
                  </span>

                  {selected && (
                    <span
                      className={styles.regionSelectedMark}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        <p className={styles.regionHint}>
          Choose the region where your World of
          Warcraft character is located.
        </p>
      </OptionSection>
    </>
  );
}
