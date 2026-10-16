
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
  if (role === "dps") {
    return "DPS";
  }

  return role[0].toUpperCase() + role.slice(1);
}

export function useMythicPlusConfig() {
  // ========================================
  // RUN CONFIGURATION
  // ========================================

  const [keyLevel, setKeyLevel] = useState(10);

  const [runs, setRuns] = useState(1);

  const [participation, setParticipation] =
    useState<Participation>("play");

  const [region, setRegion] =
    useState<Region>("EU");

  // ========================================
  // CHARACTER CONFIGURATION
  // ========================================

  const [role, setRole] = useState<Role>("dps");

  const [playerClass, setPlayerClass] =
    useState("Rogue");

  const armorType = classArmor[playerClass];

  const allowedRoles = classRoles[playerClass];

  // ========================================
  // DUNGEON CONFIGURATION
  // ========================================

  const [specificDungeon, setSpecificDungeon] =
    useState(false);

  const [dungeonCounts, setDungeonCounts] =
    useState<Record<DungeonName, number>>(
      createEmptyDungeonCounts
    );

  // ========================================
  // LOOT TRADERS
  // ========================================

  const [traders, setTradersState] = useState(0);

  const maxTraders = getMaxTraders(armorType);

  // Сохраняем совместимость с React setter.
  // При этом не позволяем выйти за лимит.

  const setTraders: Dispatch<SetStateAction<number>> = (
    value
  ) => {
    setTradersState((current) => {
      const requested =
        typeof value === "function"
          ? value(current)
          : value;

      if (!Number.isFinite(requested)) {
        return current;
      }

      return Math.max(
        0,
        Math.min(maxTraders, Math.trunc(requested))
      );
    });
  };

  // ========================================
  // DUNGEON ALLOCATION
  // ========================================

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

  // ========================================
  // PRICE CALCULATION
  // ========================================

  const calculation = useMemo(() => {
    const singleRun = basePrices[keyLevel];

    const base = singleRun * runs;

    const afkExtra =
      participation === "afk"
        ? Math.round(base * AFK_SURCHARGE)
        : 0;

    const roleExtra =
      participation === "play"
        ? Math.round(base * roleSurcharges[role])
        : 0;

    const specificExtra = Math.round(
      singleRun *
        allocatedSpecificRuns *
        SPECIFIC_DUNGEON_SURCHARGE
    );

    const traderExtra = Math.round(
      base * traderSurcharges[traders]
    );

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

  // ========================================
  // RUN COUNT HANDLERS
  // ========================================

  function setRunCount(amount: number) {
    if (!Number.isFinite(amount)) {
      return;
    }

    const next = Math.max(
      1,
      Math.min(50, Math.trunc(amount))
    );

    // Нельзя уменьшить количество runs
    // ниже уже распределённых подземелий.

    if (next < allocatedSpecificRuns) {
      return;
    }

    setRuns(next);
  }

  function decreaseRuns() {
    setRunCount(runs - 1);
  }

  function increaseRuns() {
    setRunCount(runs + 1);
  }

  // ========================================
  // PARTICIPATION HANDLER
  // ========================================

  function handleParticipation(value: Participation) {
    setParticipation(value);

    if (value === "afk") {
      setRole("dps");
    }
  }

  // ========================================
  // CLASS CHANGE HANDLER
  // ========================================

  function handleClassChange(newClass: string) {
    if (!Object.prototype.hasOwnProperty.call(classArmor, newClass)) {
      return;
    }

    const newRoles = classRoles[newClass];
    const newArmor = classArmor[newClass];

    setPlayerClass(newClass);

    // Если текущая роль недоступна новому классу,
    // автоматически выбираем допустимую.

    setRole((currentRole) => {
      if (newRoles.includes(currentRole)) {
        return currentRole;
      }

      return newRoles[0];
    });

    // Корректируем количество Loot Traders
    // при смене типа брони.

    const newMaxTraders = getMaxTraders(newArmor);

    setTradersState((current) =>
      Math.min(current, newMaxTraders)
    );
  }

  // ========================================
  // SPECIFIC DUNGEON HANDLER
  // ========================================

  function handleSpecificDungeon(value: boolean) {
    setSpecificDungeon(value);

    if (!value) {
      setDungeonCounts(createEmptyDungeonCounts());
    }
  }

  // ========================================
  // DUNGEON AMOUNT HANDLER
  // ========================================

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
      if (!Object.prototype.hasOwnProperty.call(current, dungeonName)) {
        return current;
      }

      const currentAmount = current[dungeonName];

      const currentTotal = Object.values(current).reduce(
        (total, amount) => total + amount,
        0
      );

      // Сколько максимум можно выделить
      // именно этому подземелью.

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

  // ========================================
  // PUBLIC CONFIG API
  // ========================================

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

export type MythicPlusConfig = ReturnType<
  typeof useMythicPlusConfig
>;
