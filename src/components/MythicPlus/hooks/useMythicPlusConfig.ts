"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AFK_SURCHARGE,
  SPECIFIC_DUNGEON_SURCHARGE,
  basePrices,
  classArmor,
  classRoles,
  dungeons,
  getMaxTraders,
  getRunsDiscount,
  roleSurcharges,
  traderSurcharges,
  type DungeonName,
  type Participation,
  type Region,
  type Role,
} from "@/data/mythicPlus";

const keyLevels = Array.from(
  { length: 19 },
  (_, index) => index + 2
);

const quickRunOptions = [
  1,
  4,
  8,
];

const classes =
  Object.keys(classArmor);

function createEmptyDungeonCounts(): Record<
  DungeonName,
  number
> {
  return Object.fromEntries(
    dungeons.map(
      (dungeon) => [
        dungeon,
        0,
      ]
    )
  ) as Record<
    DungeonName,
    number
  >;
}

export function formatRole(
  role: Role
) {
  if (role === "dps") {
    return "DPS";
  }

  return (
    role[0].toUpperCase() +
    role.slice(1)
  );
}

export function useMythicPlusConfig() {
  const [
    keyLevel,
    setKeyLevel,
  ] = useState(10);

  const [
    runs,
    setRuns,
  ] = useState(1);

  const [
    participation,
    setParticipation,
  ] =
    useState<Participation>(
      "play"
    );

  const [
    region,
    setRegion,
  ] =
    useState<Region>("EU");

  const [
    role,
    setRole,
  ] =
    useState<Role>("dps");

  const [
    playerClass,
    setPlayerClass,
  ] =
    useState("Rogue");

  const [
    specificDungeon,
    setSpecificDungeon,
  ] =
    useState(false);

  const [
    dungeonCounts,
    setDungeonCounts,
  ] = useState<
    Record<
      DungeonName,
      number
    >
  >(
    createEmptyDungeonCounts
  );

  const [
    traders,
    setTraders,
  ] =
    useState(0);

  const armorType =
    classArmor[playerClass];

  const allowedRoles =
    classRoles[playerClass];

  const maxTraders =
    getMaxTraders(
      armorType
    );

  const allocatedSpecificRuns =
    useMemo(() => {
      return Object.values(
        dungeonCounts
      ).reduce(
        (
          total,
          amount
        ) =>
          total + amount,
        0
      );
    }, [dungeonCounts]);

  const remainingRuns =
    runs -
    allocatedSpecificRuns;

  const selectedDungeons =
    useMemo(() => {
      return dungeons
        .filter(
          (dungeon) =>
            dungeonCounts[
              dungeon
            ] > 0
        )
        .map(
          (dungeon) => ({
            dungeon,
            count:
              dungeonCounts[
                dungeon
              ],
          })
        );
    }, [dungeonCounts]);

  const calculation =
    useMemo(() => {
      const singleRun =
        basePrices[
          keyLevel
        ];

      const base =
        singleRun *
        runs;

      const afkExtra =
        participation ===
        "afk"
          ? Math.round(
              base *
                AFK_SURCHARGE
            )
          : 0;

      const roleExtra =
        participation ===
        "play"
          ? Math.round(
              base *
                roleSurcharges[
                  role
                ]
            )
          : 0;

      const specificExtra =
        Math.round(
          singleRun *
            allocatedSpecificRuns *
            SPECIFIC_DUNGEON_SURCHARGE
        );

      const traderExtra =
        Math.round(
          base *
            traderSurcharges[
              traders
            ]
        );

      const extras =
        afkExtra +
        roleExtra +
        specificExtra +
        traderExtra;

      const beforeDiscount =
        base +
        extras;

      const discountPercent =
        getRunsDiscount(
          runs
        );

      const discount =
        Math.round(
          beforeDiscount *
            discountPercent
        );

      const total =
        beforeDiscount -
        discount;

      return {
        singleRun,
        base,

        afkExtra,
        roleExtra,
        specificExtra,
        traderExtra,

        extras,

        discount,
        discountPercent,

        total,
      };
    }, [
      keyLevel,
      runs,
      participation,
      role,
      allocatedSpecificRuns,
      traders,
    ]);

  function setRunCount(
    amount: number
  ) {
    const next =
      Math.max(
        1,
        Math.min(
          50,
          amount
        )
      );

    if (
      next <
      allocatedSpecificRuns
    ) {
      return;
    }

    setRuns(next);
  }

  function decreaseRuns() {
    setRunCount(
      runs - 1
    );
  }

  function increaseRuns() {
    setRunCount(
      runs + 1
    );
  }

  function handleParticipation(
    value: Participation
  ) {
    setParticipation(
      value
    );

    if (
      value === "afk"
    ) {
      setRole("dps");
    }
  }

  function handleClassChange(
    newClass: string
  ) {
    setPlayerClass(
      newClass
    );

    const newRoles =
      classRoles[
        newClass
      ];

    const newArmor =
      classArmor[
        newClass
      ];

    if (
      !newRoles.includes(
        role
      )
    ) {
      setRole(
        newRoles[0]
      );
    }

    const newMaxTraders =
      getMaxTraders(
        newArmor
      );

    if (
      traders >
      newMaxTraders
    ) {
      setTraders(
        newMaxTraders
      );
    }
  }

  function handleSpecificDungeon(
    value: boolean
  ) {
    setSpecificDungeon(
      value
    );

    if (!value) {
      setDungeonCounts(
        createEmptyDungeonCounts()
      );
    }
  }

  function changeDungeonAmount(
    dungeonName: DungeonName,
    difference: number
  ) {
    setDungeonCounts(
      (current) => {
        const currentAmount =
          current[
            dungeonName
          ];

        const currentTotal =
          Object.values(
            current
          ).reduce(
            (
              total,
              amount
            ) =>
              total +
              amount,
            0
          );

        if (
          difference < 0 &&
          currentAmount <=
            0
        ) {
          return current;
        }

        if (
          difference > 0 &&
          currentTotal >=
            runs
        ) {
          return current;
        }

        return {
          ...current,

          [dungeonName]:
            currentAmount +
            difference,
        };
      }
    );
  }

  return {
    keyLevels,
    quickRunOptions,
    classes,

    keyLevel,
    setKeyLevel,

    runs,
    setRunCount,
    decreaseRuns,
    increaseRuns,

    participation,
    handleParticipation,

    region,
    setRegion,

    role,
    setRole,

    playerClass,
    handleClassChange,

    specificDungeon,
    handleSpecificDungeon,

    dungeonCounts,
    changeDungeonAmount,

    traders,
    setTraders,

    armorType,
    allowedRoles,
    maxTraders,

    allocatedSpecificRuns,
    remainingRuns,
    selectedDungeons,

    calculation,
  };
}

export type MythicPlusConfig =
  ReturnType<
    typeof useMythicPlusConfig
  >;