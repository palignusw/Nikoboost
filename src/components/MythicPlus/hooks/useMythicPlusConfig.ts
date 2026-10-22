
"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
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

export type RunGoal = "standard" | "crest";

const keyLevels = Array.from(
  { length: 19 },
  (_, index) => index + 2
);

const quickRunOptions = [1, 4, 8];
const classes = Object.keys(classArmor);

function createEmptyDungeonCounts(): Record<DungeonName, number> {
  return Object.fromEntries(
    dungeons.map((dungeon) => [dungeon, 0])
  ) as Record<DungeonName, number>;
}

export function formatRole(role: Role) {
  return role === "dps"
    ? "DPS"
    : role[0].toUpperCase() + role.slice(1);
}

type ConfirmedChoices = {
  keyLevel: boolean;
  runs: boolean;
  participation: boolean;
  playerClass: boolean;
  role: boolean;
  dungeon: boolean;
  traders: boolean;
  region: boolean;
};

export function useMythicPlusConfig() {
  // Default values are for estimated pricing only.
  // They are not confirmed user choices.

  const [keyLevel, setKeyLevelState] = useState(10);
  const [runs, setRuns] = useState(1);
  const [runGoal, setRunGoal] = useState<RunGoal>("standard");

  const [participation, setParticipation] =
    useState<Participation>("play");

  const [region, setRegionState] =
    useState<Region>("EU");

  const [role, setRoleState] =
    useState<Role>("dps");

  const [playerClass, setPlayerClass] =
    useState("Rogue");

  const armorType = classArmor[playerClass];
  const allowedRoles = classRoles[playerClass];

  const [specificDungeon, setSpecificDungeon] =
    useState(false);

  const [dungeonCounts, setDungeonCounts] =
    useState<Record<DungeonName, number>>(
      createEmptyDungeonCounts
    );

  const [traders, setTradersState] = useState(0);
  const maxTraders = getMaxTraders(armorType);

  const [confirmed, setConfirmed] =
    useState<ConfirmedChoices>({
      keyLevel: false,
      runs: false,
      participation: false,
      playerClass: false,
      role: false,
      dungeon: false,
      traders: false,
      region: false,
    });

  // KEY LEVEL

  const setKeyLevel: Dispatch<SetStateAction<number>> =
    (value) => {
      const requested =
        typeof value === "function"
          ? value(keyLevel)
          : value;

      if (
        !Number.isInteger(requested) ||
        requested < 2 ||
        requested > 20
      ) {
        return;
      }

      setKeyLevelState(requested);

      setConfirmed((previous) => ({
        ...previous,
        keyLevel: true,
      }));
    };

  const resetKeyLevelForCrest = () => {
    if (keyLevel <= 12) return;

    // Возвращаем допустимое начальное значение
    setKeyLevelState(12);

    // Но не считаем его выбранным пользователем
    setConfirmed((previous) => ({
      ...previous,
      keyLevel: false,
    }));
  };

  // ROLE

  const setRole: Dispatch<SetStateAction<Role>> =
    (value) => {
      if (
        !confirmed.playerClass ||
        participation === "afk"
      ) {
        return;
      }

      const requested =
        typeof value === "function"
          ? value(role)
          : value;

      if (!allowedRoles.includes(requested)) {
        return;
      }

      setRoleState(requested);

      setConfirmed((previous) => ({
        ...previous,
        role: true,
      }));
    };

  // REGION

  const setRegion: Dispatch<SetStateAction<Region>> =
    (value) => {
      const requested =
        typeof value === "function"
          ? value(region)
          : value;

      if (requested !== "EU" && requested !== "NA") {
        return;
      }

      setRegionState(requested);

      setConfirmed((previous) => ({
        ...previous,
        region: true,
      }));
    };

  // LOOT TRADERS

  const setTraders: Dispatch<SetStateAction<number>> =
    (value) => {
      const requested =
        typeof value === "function"
          ? value(traders)
          : value;

      if (!Number.isFinite(requested)) {
        return;
      }

      const next = Math.max(
        0,
        Math.min(maxTraders, Math.trunc(requested))
      );

      setTradersState(next);

      setConfirmed((previous) => ({
        ...previous,
        traders: true,
      }));
    };

  // DUNGEON ALLOCATION

  const allocatedSpecificRuns = useMemo(() => {
    return Object.values(dungeonCounts).reduce(
      (total, amount) => total + amount,
      0
    );
  }, [dungeonCounts]);

  const remainingRuns = runs - allocatedSpecificRuns;

  const selectedDungeons = useMemo(() => {
    return dungeons
      .filter((dungeon) => dungeonCounts[dungeon] > 0)
      .map((dungeon) => ({
        dungeon,
        count: dungeonCounts[dungeon],
      }));
  }, [dungeonCounts]);

  // PRICE CALCULATION

  const calculation = useMemo(() => {
    const singleRun = basePrices[keyLevel];
    const base = singleRun * runs;

    const afkExtra =
      participation === "afk"
        ? Math.round(base * AFK_SURCHARGE)
        : 0;

    const roleExtra =
      runGoal === "standard" && participation === "play"
        ? Math.round(base * roleSurcharges[role])
        : 0;

    const specificExtra =
      runGoal === "standard"
        ? Math.round(
          singleRun *
          allocatedSpecificRuns *
          SPECIFIC_DUNGEON_SURCHARGE
        )
        : 0;

    const traderExtra =
      runGoal === "standard"
        ? Math.round(base * traderSurcharges[traders])
        : 0;

    const extras =
      afkExtra +
      roleExtra +
      specificExtra +
      traderExtra;

    const beforeDiscount = base + extras;

    const discountPercent = getRunsDiscount(runs);

    const discount = Math.round(
      beforeDiscount * discountPercent
    );

    const total = beforeDiscount - discount;

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

  // RUN COUNT

  function setRunCount(amount: number) {
    if (!Number.isFinite(amount)) {
      return;
    }

    const next = Math.max(
      1,
      Math.min(50, Math.trunc(amount))
    );

    if (next < allocatedSpecificRuns) {
      return;
    }

    setRuns(next);

    setConfirmed((previous) => ({
      ...previous,
      runs: true,
    }));
  }

  function decreaseRuns() {
    setRunCount(runs - 1);
  }

  function increaseRuns() {
    setRunCount(runs + 1);
  }

  // PARTICIPATION

  function handleParticipation(value: Participation) {
    if (value !== "play" && value !== "afk") {
      return;
    }

    setParticipation(value);

    setConfirmed((previous) => ({
      ...previous,
      participation: true,
      role: value === "afk" ? false : previous.role,
    }));

    if (value === "afk") {
      setRoleState("dps");
    }
  }

  // CLASS CHANGE

  function handleClassChange(newClass: string) {
    if (
      !Object.prototype.hasOwnProperty.call(
        classArmor,
        newClass
      )
    ) {
      return;
    }

    const changed = playerClass !== newClass;
    const newRoles = classRoles[newClass];

    const hasSingleRole = newRoles.length === 1;

    setPlayerClass(newClass);

    setRoleState((currentRole) => {
      if (hasSingleRole) {
        return newRoles[0];
      }

      return newRoles.includes(currentRole)
        ? currentRole
        : newRoles[0];
    });

    setConfirmed((previous) => ({
      ...previous,
      playerClass: true,
      role: hasSingleRole
        ? true
        : changed
          ? false
          : previous.role,
      traders: changed
        ? false
        : previous.traders,
    }));

    if (changed) {
      setTradersState(0);
    }
  }

  // DUNGEON TYPE

  function handleSpecificDungeon(value: boolean) {
    setSpecificDungeon(value);

    setConfirmed((previous) => ({
      ...previous,
      dungeon: true,
    }));

    if (!value) {
      setDungeonCounts(createEmptyDungeonCounts());
    }
  }

  // SPECIFIC DUNGEON COUNTS

  function changeDungeonAmount(
    dungeonName: DungeonName,
    difference: number
  ) {
    if (!Number.isFinite(difference)) {
      return;
    }

    const change = Math.trunc(difference);

    if (change === 0) {
      return;
    }

    setDungeonCounts((current) => {
      if (
        !Object.prototype.hasOwnProperty.call(
          current,
          dungeonName
        )
      ) {
        return current;
      }

      const currentAmount = current[dungeonName];

      const currentTotal = Object.values(current).reduce(
        (total, amount) => total + amount,
        0
      );

      const maxForDungeon = Math.max(
        0,
        runs - (currentTotal - currentAmount)
      );

      const nextAmount = Math.max(
        0,
        Math.min(
          maxForDungeon,
          currentAmount + change
        )
      );

      if (nextAmount === currentAmount) {
        return current;
      }

      return {
        ...current,
        [dungeonName]: nextAmount,
      };
    });
  }

  // STEP VALIDATION

  // STEP VALIDATION

  const stepComplete = {
    1:
      confirmed.keyLevel &&
      confirmed.runs &&
      confirmed.participation &&
      (runGoal === "standard" || confirmed.region),

    2:
      runGoal === "crest" ||
      (
        confirmed.playerClass &&
        (
          participation === "afk" ||
          confirmed.role
        )
      ),

    3:
      runGoal === "crest" ||
      (
        confirmed.dungeon &&
        (
          !specificDungeon ||
          allocatedSpecificRuns > 0
        ) &&
        confirmed.traders &&
        confirmed.region
      ),
  };

  const canReserve =
    stepComplete[1] &&
    stepComplete[2] &&
    stepComplete[3];

  return {
    keyLevels,
    quickRunOptions,
    classes,

    keyLevel,
    setKeyLevel,
    resetKeyLevelForCrest,

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
    confirmed,
    stepComplete,
    canReserve,
    runGoal,
    setRunGoal,
  };
}

export type MythicPlusConfig = ReturnType<
  typeof useMythicPlusConfig
>;
