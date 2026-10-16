
import type {
  MythicPlusConfig,
} from "../../hooks/useMythicPlusConfig";

import {
  formatRole,
} from "../../hooks/useMythicPlusConfig";

import styles from "./ReviewStep.module.scss";

export default function ReviewStep({
  config,
}: {
  config: MythicPlusConfig;
}) {
  const totalGold =
    config.calculation.total.toLocaleString("en-US");

  const discountPercent = Math.round(
    config.calculation.discountPercent * 100
  );

  const participation =
    config.participation === "play"
      ? "I Play"
      : "AFK / Minimal";

  const traderLabel =
    config.traders === 0
      ? "Personal loot"
      : `${config.traders} ${
          config.traders === 1
            ? "trader"
            : "traders"
        }`;

  return (
    <div className={styles.reviewStep}>
      {/* ===================================
          HEADER
      =================================== */}

      <div className={styles.reviewHeader}>
        <div className={styles.reviewEyebrow}>
          <span className={styles.statusDot} />

          FINAL REVIEW
        </div>

        <h3>Review your order</h3>

        <p>
          Your Mythic+ run is almost ready.
          Check your configuration before
          submitting your reservation.
        </p>
      </div>

      {/* ===================================
          ORDER OVERVIEW
      =================================== */}

      <div className={styles.overviewCard}>
        <div className={styles.overviewTop}>
          <div className={styles.overviewHeading}>
            <span>MYTHIC+ SERVICE</span>

            <h4>
              Mythic+ <span>+{config.keyLevel}</span>
            </h4>

            <p>
              {config.runs}{" "}
              {config.runs === 1 ? "run" : "runs"}
              {" · "}
              {config.region} Region
            </p>
          </div>

          <div className={styles.overviewEmblem}>
            M+
          </div>
        </div>

        <div className={styles.overviewStats}>
          <div>
            <span>KEY LEVEL</span>

            <strong>+{config.keyLevel}</strong>
          </div>

          <div>
            <span>TOTAL RUNS</span>

            <strong>{config.runs}</strong>
          </div>

          <div>
            <span>REGION</span>

            <strong>{config.region}</strong>
          </div>
        </div>
      </div>

      {/* ===================================
          CHARACTER CONFIGURATION
      =================================== */}

      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionNumber}>
              01
            </span>

            <h4>Character & Service</h4>
          </div>

          <span className={styles.sectionStatus}>
            CONFIGURED
          </span>
        </div>

        <div className={styles.reviewGrid}>
          <ReviewItem
            label="Character class"
            value={config.playerClass}
            icon="✦"
          />

          <ReviewItem
            label="Participation"
            value={participation}
            icon="⚔"
          />

          {config.participation === "play" && (
            <ReviewItem
              label="Preferred role"
              value={formatRole(config.role)}
              icon="◆"
            />
          )}

          <ReviewItem
            label="Armor type"
            value={config.armorType}
            icon="⬡"
          />

          <ReviewItem
            label="Loot traders"
            value={traderLabel}
            icon="✧"
          />
        </div>
      </section>

      {/* ===================================
          DUNGEON CONFIGURATION
      =================================== */}

      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionNumber}>
              02
            </span>

            <h4>Dungeon Selection</h4>
          </div>

          <span className={styles.sectionStatus}>
            {config.specificDungeon
              ? "CUSTOM"
              : "FLEXIBLE"}
          </span>
        </div>

        <div className={styles.reviewDungeons}>
          {!config.specificDungeon ? (
            <div className={styles.dungeonRow}>
              <div className={styles.dungeonRowInfo}>
                <span className={styles.dungeonIcon}>
                  ◈
                </span>

                <div>
                  <strong>Any dungeon</strong>

                  <small>
                    Fastest available group
                  </small>
                </div>
              </div>

              <span className={styles.dungeonCount}>
                ×{config.runs}
              </span>
            </div>
          ) : (
            <>
              {config.selectedDungeons.map(
                ({ dungeon, count }) => (
                  <div
                    key={dungeon}
                    className={styles.dungeonRow}
                  >
                    <div className={styles.dungeonRowInfo}>
                      <span className={styles.dungeonIcon}>
                        ◈
                      </span>

                      <div>
                        <strong>{dungeon}</strong>

                        <small>
                          Specific dungeon
                        </small>
                      </div>
                    </div>

                    <span className={styles.dungeonCount}>
                      ×{count}
                    </span>
                  </div>
                )
              )}

              {config.remainingRuns > 0 && (
                <div className={styles.dungeonRow}>
                  <div className={styles.dungeonRowInfo}>
                    <span className={styles.dungeonIcon}>
                      ◇
                    </span>

                    <div>
                      <strong>Any dungeon</strong>

                      <small>
                        Remaining flexible runs
                      </small>
                    </div>
                  </div>

                  <span className={styles.dungeonCount}>
                    ×{config.remainingRuns}
                  </span>
                </div>
              )}
            </>
          )}

          <div className={styles.dungeonFooter}>
            <span>Total dungeon runs</span>

            <strong>{config.runs}</strong>
          </div>
        </div>
      </section>

      {/* ===================================
          FINAL PRICE
      =================================== */}

      <div className={styles.reviewTotal}>
        <div className={styles.totalTop}>
          <div>
            <span className={styles.totalEyebrow}>
              ORDER TOTAL
            </span>

            <h4>Your final price</h4>
          </div>

          {discountPercent > 0 && (
            <span className={styles.discountBadge}>
              SAVE {discountPercent}%
            </span>
          )}
        </div>

        <div className={styles.totalAmount}>
          <strong>{totalGold}</strong>

          <span>GOLD</span>
        </div>

        <div className={styles.totalDivider} />

        <div className={styles.totalDetails}>
          <div>
            <span>Payment method</span>

            <strong>In-game gold</strong>
          </div>

          <div>
            <span>Game region</span>

            <strong>{config.region}</strong>
          </div>
        </div>
      </div>

      {/* ===================================
          FOOTER
      =================================== */}

      <div className={styles.reviewFooter}>
        <span className={styles.footerIcon}>
          ✓
        </span>

        <p>
          Review your selections above.
          When everything looks correct,
          continue to reserve your run.
        </p>
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className={styles.reviewItem}>
      <span
        className={styles.reviewItemIcon}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className={styles.reviewItemContent}>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}
