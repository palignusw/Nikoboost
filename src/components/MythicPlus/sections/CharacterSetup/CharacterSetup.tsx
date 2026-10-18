
import type { CSSProperties } from "react";

import {
  roleSurcharges,
} from "@/data/mythicPlus";

import type {
  MythicPlusConfig,
} from "../../hooks/useMythicPlusConfig";

import {
  formatRole,
} from "../../hooks/useMythicPlusConfig";

import {
  OptionSection,
} from "../../components/ConfiguratorUI";

import styles from "./CharacterSetup.module.scss";

const classIcons: Record<string, string> = {
  Warrior: "warrior",
  Paladin: "paladin",
  Hunter: "hunter",
  Rogue: "rogue",
  Priest: "priest",
  "Death Knight": "deathknight",
  Shaman: "shaman",
  Mage: "mage",
  Warlock: "warlock",
  Monk: "monk",
  Druid: "druid",
  "Demon Hunter": "demonhunter",
  Evoker: "evoker",
};

const classColors: Record<string, string> = {
  Warrior: "#C69B6D",
  Paladin: "#F48CBA",
  Hunter: "#AAD372",
  Rogue: "#FFF468",
  Priest: "#FFFFFF",
  "Death Knight": "#C41E3A",
  Shaman: "#0070DD",
  Mage: "#3FC7EB",
  Warlock: "#8788EE",
  Monk: "#00FF98",
  Druid: "#FF7C0A",
  "Demon Hunter": "#A330C9",
  Evoker: "#33937F",
};

const roleIcons: Record<string, string> = {
  dps: "⚔",
  tank: "🛡",
  healer: "✚",
};

export default function CharacterSetup({
  config,
}: {
  config: MythicPlusConfig;
}) {
  const classConfirmed =
    config.confirmed.playerClass;

  const roleConfirmed =
    config.confirmed.role;

  return (
    <OptionSection
      number="04"
      title="Your character"
      value={
        classConfirmed
          ? config.armorType
          : "Not selected"
      }
    >
      <div className={styles.characterSetup}>
        <div className={styles.classSelection}>
          <span className={styles.classLabel}>
            Choose your class
          </span>

          <div className={styles.classIconGrid}>
            {config.classes.map((wowClass) => {
              const selected =
                classConfirmed &&
                config.playerClass === wowClass;

              const iconName = classIcons[wowClass];

              const classColor =
                classColors[wowClass] ?? "#FFFFFF";

              return (
                <button
                  key={wowClass}
                  type="button"
                  title={wowClass}
                  aria-label={`Select ${wowClass}`}
                  aria-pressed={selected}
                  onClick={() =>
                    config.handleClassChange(wowClass)
                  }
                  className={`${styles.classIconButton} ${
                    selected
                      ? styles.classIconSelected
                      : ""
                  }`}
                  style={
                    {
                      "--wow-class-color": classColor,
                    } as CSSProperties
                  }
                >
                  {iconName && (
                    <img
                      src={`/images/classes/${iconName}.jpg`}
                      alt=""
                      width={56}
                      height={56}
                      className={styles.classIconImage}
                    />
                  )}

                  <span className={styles.className}>
                    {wowClass}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.selectedClassInfo}>
            <div className={styles.selectedClassText}>
              <span>SELECTED CHARACTER</span>

              <strong>
                {classConfirmed
                  ? config.playerClass
                  : "Choose a class"}
              </strong>
            </div>

            {classConfirmed && (
              <div className={styles.armorBadge}>
                {config.armorType} Armor
              </div>
            )}
          </div>
        </div>

        <div className={styles.roleSelection}>
          <span className={styles.roleLabel}>
            Role
          </span>

          {!classConfirmed ? (
            <small className={styles.roleNote}>
              Choose your class first to select
              your role.
            </small>
          ) : config.participation === "afk" ? (
            <small className={styles.roleNote}>
              Role is not used for AFK /
              minimal participation.
            </small>
          ) : (
            <>
              <div className={styles.roleButtonGrid}>
                {config.allowedRoles.map((role) => {
                  const selected =
                    roleConfirmed &&
                    config.role === role;

                  const icon =
                    roleIcons[role.toLowerCase()] ??
                    "◆";

                  const surcharge = Math.round(
                    roleSurcharges[role] * 100
                  );

                  return (
                    <button
                      type="button"
                      key={role}
                      aria-pressed={selected}
                      aria-label={`${formatRole(role)}${
                        surcharge > 0
                          ? `, ${surcharge}% extra`
                          : ", no role surcharge"
                      }`}
                      onClick={() =>
                        config.setRole(role)
                      }
                      className={`${styles.roleCard} ${
                        selected
                          ? styles.roleCardActive
                          : ""
                      }`}
                    >
                      <span
                        className={styles.roleCardIcon}
                        aria-hidden="true"
                      >
                        {icon}
                      </span>

                      <span
                        className={styles.roleCardContent}
                      >
                        <strong>
                          {formatRole(role)}
                        </strong>

                        <small
                          className={
                            surcharge > 0
                              ? styles.roleExtra
                              : styles.roleFree
                          }
                        >
                          {surcharge > 0
                            ? `+${surcharge}%`
                            : "NO EXTRA"}
                        </small>
                      </span>

                      {selected && (
                        <span
                          className={styles.roleCheck}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {roleConfirmed &&
                roleSurcharges[config.role] > 0 && (
                  <small className={styles.roleNote}>
                    +
                    {Math.round(
                      roleSurcharges[config.role] *
                        100
                    )}
                    % composition adjustment
                  </small>
                )}
            </>
          )}
        </div>
      </div>
    </OptionSection>
  );
}
