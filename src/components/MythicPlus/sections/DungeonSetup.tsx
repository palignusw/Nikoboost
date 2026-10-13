
import {
  SPECIFIC_DUNGEON_SURCHARGE,
  dungeons,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../hooks/useMythicPlusConfig";

import {
  ChoiceCard,
  OptionSection,
} from "../components/ConfiguratorUI";

import styles from "../MythicPlus.module.scss";

const dungeonImages: Record<string, string> = {
  "Altar of Fangs": "altar-of-fangs",
  "Murder Row": "murder-row",
  "Den of Nalorakk": "den-of-nalorakk",
  "The Blinding Vale": "the-blinding-vale",
  "Voidscar Arena": "voidscar-arena",
  "Kings' Rest": "kings-rest",
  "Temple of Sethraliss": "temple-of-sethraliss",
  "Ruby Life Pools": "ruby-life-pools",
};

export default function DungeonSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  const progress =
    config.runs > 0
      ? Math.min(
          100,
          (config.allocatedSpecificRuns /
            config.runs) *
            100
        )
      : 0;

  return (
    <OptionSection
      number="05"
      title="Dungeon"
      value={
        config.specificDungeon
          ? `${config.allocatedSpecificRuns}/${config.runs} specific`
          : "Any dungeon"
      }
    >
      <div className={styles.twoCards}>
        <ChoiceCard
          active={!config.specificDungeon}
          title="Any dungeon"
          description="Fastest available group and best price."
          badge="BEST PRICE"
          onClick={() =>
            config.handleSpecificDungeon(false)
          }
        />

        <ChoiceCard
          active={config.specificDungeon}
          title="Specific dungeons"
          description="Choose how many runs you want in each dungeon."
          price={`+${Math.round(
            SPECIFIC_DUNGEON_SURCHARGE * 100
          )}% / selected run`}
          onClick={() =>
            config.handleSpecificDungeon(true)
          }
        />
      </div>

      {config.specificDungeon && (
        <div className={styles.dungeonAllocator}>
          <div className={styles.allocationStatus}>
            <div>
              <span>RUNS ASSIGNED</span>
              <strong>
                {config.allocatedSpecificRuns}
                <small>/{config.runs}</small>
              </strong>
            </div>

            <div>
              {config.remainingRuns > 0 ? (
                <>
                  <strong>
                    {config.remainingRuns}
                  </strong>
                  <span>
                    {config.remainingRuns === 1
                      ? "run remains Any Dungeon"
                      : "runs remain Any Dungeon"}
                  </span>
                </>
              ) : (
                <span
                  className={styles.allAssigned}
                >
                  ✓ ALL RUNS ASSIGNED
                </span>
              )}
            </div>
          </div>

          <div
            className={styles.dungeonProgress}
            role="progressbar"
            aria-label="Specific dungeon runs assigned"
            aria-valuenow={
              config.allocatedSpecificRuns
            }
            aria-valuemin={0}
            aria-valuemax={config.runs}
          >
            <div
              className={styles.dungeonProgressFill}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            className={styles.dungeonAllocationGrid}
          >
            {dungeons.map((dungeonName) => {
              const amount =
                config.dungeonCounts[dungeonName];

              const maxReached =
                config.allocatedSpecificRuns >=
                config.runs;

              const image =
                dungeonImages[dungeonName];

              return (
                <div
                  key={dungeonName}
                  className={
                    amount > 0
                      ? styles.activeDungeonAllocation
                      : styles.dungeonAllocation
                  }
                >
                  <div
                    className={
                      styles.dungeonVisualInfo
                    }
                  >
                    <div
                      className={
                        styles.dungeonThumbnail
                      }
                    >
                      <img
                        src={`/images/dungeons/${image}.jpg`}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    </div>

                    <div className={styles.dungeonName}>
                      <span>{dungeonName}</span>

                      {amount > 0 && (
                        <small>
                          {amount}{" "}
                          {amount === 1
                            ? "run"
                            : "runs"}
                        </small>
                      )}
                    </div>
                  </div>

                  <div
                    className={
                      styles.dungeonCounter
                    }
                  >
                    <button
                      type="button"
                      aria-label={`Remove one ${dungeonName} run`}
                      disabled={amount === 0}
                      onClick={() =>
                        config.changeDungeonAmount(
                          dungeonName,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>{amount}</strong>

                    <button
                      type="button"
                      aria-label={`Add one ${dungeonName} run`}
                      disabled={maxReached}
                      onClick={() =>
                        config.changeDungeonAmount(
                          dungeonName,
                          1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </OptionSection>
  );
}
