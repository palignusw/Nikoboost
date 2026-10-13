import {
  traderSurcharges,
  type Region,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../hooks/useMythicPlusConfig";

import {
  Divider,
  OptionSection,
} from "../components/ConfiguratorUI";

import styles from "../MythicPlus.module.scss";

export default function LootSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  return (
    <>
      <OptionSection
        number="06"
        title="Loot traders"
        value={
          config.traders ===
          0
            ? "Personal loot"
            : `+${config.traders} ${
                config.traders ===
                1
                  ? "trader"
                  : "traders"
              }`
        }
      >
        <div
          className={
            styles.traders
          }
        >
          {[0, 1, 2, 3, 4].map(
            (
              amount
            ) => {
              const unavailable =
                amount >
                config.maxTraders;

              return (
                <button
                  type="button"
                  key={
                    amount
                  }
                  disabled={
                    unavailable
                  }
                  onClick={() => {
                    if (
                      !unavailable
                    ) {
                      config.setTraders(
                        amount
                      );
                    }
                  }}
                  className={
                    config.traders ===
                    amount
                      ? styles.activeTrader
                      : styles.trader
                  }
                >
                  <strong>
                    {amount ===
                    0
                      ? "None"
                      : `+${amount}`}
                  </strong>

                  <span>
                    {unavailable
                      ? "Unavailable"
                      : amount ===
                          0
                        ? "Personal loot"
                        : `+${Math.round(
                            traderSurcharges[
                              amount
                            ] *
                              100
                          )}%`}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <p
          className={
            styles.helper
          }
        >
          Traders match
          your{" "}
          <strong>
            {
              config.armorType
            }
          </strong>{" "}
          armor type and
          offer eligible
          tradable loot.

          {config.maxTraders <
            4 &&
            " Four matching traders are unavailable for this armor type."}
        </p>
      </OptionSection>

      <Divider />

      <OptionSection
        number="07"
        title="Region"
        value={
          config.region
        }
      >
        <div
          className={
            styles.regionGrid
          }
        >
          {(
            [
              "EU",
              "NA",
            ] as Region[]
          ).map(
            (
              region
            ) => (
              <button
                type="button"
                key={
                  region
                }
                onClick={() =>
                  config.setRegion(
                    region
                  )
                }
                className={
                  config.region ===
                  region
                    ? styles.activeOption
                    : styles.option
                }
              >
                {
                  region
                }
              </button>
            )
          )}
        </div>
      </OptionSection>
    </>
  );
}