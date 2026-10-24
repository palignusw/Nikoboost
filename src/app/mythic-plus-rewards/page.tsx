"use client";
import {
  mythicDefaults,
  mythicExample,
  delveSources,
  serviceContent,
  delveSettings,
} from "@/data/season";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Seo/Breadcrumbs";
import {
  mythicRewards as rewards,
  getMythicReward,
  vaultThresholds,
  wowSeason,
  type CrestType,
} from "@/data/wowSeason";
import {
  decodePlan,
  encodePlan,
  restoreWeek,
  vaultFor,
  WEEK_STORAGE_KEY,
  MAX_PLANNER_RUNS,
  type PlannerWeek,
} from "@/lib/rewardsPlanner";
import WeeklyGoal from "./components/WeeklyGoal";
import RewardSelect from "./components/RewardSelect";
import styles from "./page.module.scss";

type View = "vault" | "compare" | "crests";
const subscribeHydration = () => () => {};
const emptyWeek = (): PlannerWeek => ({ completed: [], planned: [] });
const keyOptions = rewards.map((row) => ({
  value: row.level,
  label: `+${row.level} Keystone`,
  detail: `${row.dungeon} loot · ${row.vault} Vault`,
}));
const crestTypes: CrestType[] = ["Champion", "Hero", "Myth"];
const rowFor = (key: number) => getMythicReward(key)!;

function readSavedWeek(): PlannerWeek {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(WEEK_STORAGE_KEY) ?? "null",
    );
    if (
      saved &&
      typeof saved === "object" &&
      "season" in saved &&
      saved.season !== wowSeason.id
    )
      return emptyWeek();
    const restored = restoreWeek(saved);
    if (restored) return restored;
    // Old saves were simulations, so migrate them as planned, never completed.
    const legacy: unknown = JSON.parse(
      localStorage.getItem("nikoboost:mythic-plus:vault-planner:v1") ?? "null",
    );
    if (
      legacy &&
      typeof legacy === "object" &&
      "runs" in legacy &&
      Array.isArray(legacy.runs)
    ) {
      return (
        restoreWeek({ completed: [], planned: legacy.runs }) ?? emptyWeek()
      );
    }
  } catch {
    /* Storage is optional. */
  }
  return emptyWeek();
}

export default function RewardsExplorer() {
  const [view, setView] = useState<View>("vault");
  const [week, setWeek] = useState<PlannerWeek>(emptyWeek);
  const [loaded, setLoaded] = useState(false);
  const [undo, setUndo] = useState<PlannerWeek | null>(null);
  const [example, setExample] = useState(false);
  const [undoExample, setUndoExample] = useState(false);
  const [shared, setShared] = useState<PlannerWeek | null>(null);
  const [notice, setNotice] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [level, setLevel] = useState(mythicDefaults.key);
  const [quantity, setQuantity] = useState(1);
  const [compareA, setCompareA] = useState(mythicDefaults.key);
  const [compareB, setCompareB] = useState(mythicDefaults.compareKey);
  const [showTable, setShowTable] = useState(false);
  const [crestType, setCrestType] = useState<CrestType>("Myth");
  const [crestGoal, setCrestGoal] = useState("120");
  const [currentCrests, setCurrentCrests] = useState("0");
  const [farmKey, setFarmKey] = useState(mythicDefaults.farmKey);
  const [customYield, setCustomYield] = useState("");
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  if (hydrated && !loaded) {
    setWeek(readSavedWeek());
    const query = new URLSearchParams(window.location.search);
    if (query.get("season") && query.get("season") !== wowSeason.id) {
      setNotice(
        "This link belongs to a different season. Your saved week is unchanged.",
      );
    } else if (query.has("plan") || query.has("done")) {
      const planned = decodePlan(query.get("plan") ?? "");
      const completed = decodePlan(query.get("done") ?? "");
      if (
        planned &&
        completed &&
        planned.length + completed.length <= MAX_PLANNER_RUNS
      )
        setShared({ planned, completed });
      else
        setNotice("This shared link is invalid. Your saved week is unchanged.");
    }
    if (window.location.hash === "#crest-calculator") setView("crests");
    if (
      ["#reward-explorer", "#reward-reference"].includes(window.location.hash)
    )
      setView("compare");
    if (window.location.hash === "#reward-reference") setShowTable(true);
    setLoaded(true);
  }

  useEffect(() => {
    if (!loaded || example) return;
    try {
      localStorage.setItem(
        WEEK_STORAGE_KEY,
        JSON.stringify({ ...week, season: wowSeason.id }),
      );
    } catch {
      /* The tool remains usable without storage. */
    }
  }, [week, loaded, example]);

  const allRuns = [...week.completed, ...week.planned];
  const currentVault = vaultFor(week.completed);
  const plannedVault = vaultFor(allRuns);
  const candidate = Array<number>(quantity).fill(level);
  const nextVault = vaultFor([...allRuns, ...candidate]);
  const changed = nextVault.flatMap((row, index) =>
    row && (!plannedVault[index] || row.vault > plannedVault[index]!.vault)
      ? [
          `choice ${index + 1} ${plannedVault[index] ? "to" : "at"} ${row.vault} iLvl`,
        ]
      : [],
  );
  const selected = rowFor(level);
  const limitReached = allRuns.length + quantity > MAX_PLANNER_RUNS;
  const a = rowFor(compareA);
  const b = rowFor(compareB);
  const farmOptions = rewards.filter((row) => row.crest === crestType);
  const farm =
    farmOptions.find((row) => row.level === farmKey) ?? farmOptions[0];
  const bounded = (text: string) =>
    Math.min(100000, Math.max(0, Number(text) || 0));
  const remaining = Math.max(0, bounded(crestGoal) - bounded(currentCrests));
  const yieldPerRun =
    customYield === ""
      ? farm.crestAmount
      : Math.min(1000, Math.max(1, Number(customYield) || 1));
  const farmRuns = Math.ceil(remaining / yieldPerRun);

  function update(next: PlannerWeek, message = "Your week has been updated.") {
    setUndo(week);
    setUndoExample(example);
    setWeek(next);
    setNotice(…9620 tokens truncated…Key);
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", resize);
    };
  }, [menuOpen]);

  return (
    <>
      {menuOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Dismiss navigation"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}
      <header ref={header} className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link
            href="/"
            className={styles.logo}
            aria-label="NikoBoost home — reset configurator"
            onClick={closeMenu}
          >
            <Image
              src="/images/branding/nikoboost-logo-v2.png"
              alt="NikoBoost"
              width={260}
              height={72}
              priority
            />
          </Link>
          <nav className={styles.nav} aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.page ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className={styles.actions}>
            <Link
              href={bookingHref}
              className={styles.book}
              onClick={closeMenu}
            >
              {bookingLabel}
              <span aria-hidden="true">↗</span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="nikoboost-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        <nav
          id="nikoboost-mobile-nav"
          className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
          aria-label="Mobile navigation"
          inert={!menuOpen}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.page ? "page" : undefined}
              onClick={closeMenu}
            >
              {link.label}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
          <Link
            href={bookingHref}
            className={styles.mobileBook}
            onClick={closeMenu}
          >
            {pathname === "/delves"
              ? "Configure your Delves"
              : "Configure Your Run"}
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>
    </>
  );
}
