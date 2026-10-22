"use client";

import { useState } from "react";
import { mythicRewards } from "@/data/wowSeason";
import { getWeeklyGoal, MAX_PLANNER_RUNS } from "@/lib/rewardsPlanner";
import styles from "../page.module.scss";

const targets = [...new Set(mythicRewards.map((reward) => reward.vault))];

type Props = { runs: number[]; onChange: (runs: number[]) => void };

export default function WeeklyGoal({ runs, onChange }: Props) {
  const [target, setTarget] = useState(targets[targets.length - 1]);
  const [slots, setSlots] = useState(2);
  const goal = getWeeklyGoal(runs, target, slots);
  const full = runs.length + goal.missing > MAX_PLANNER_RUNS;

  return (
    <div className={styles.goalBuilder} data-testid="weekly-goal">
      <div className={styles.goalControls}>
        <span className={styles.overline}>START WITH YOUR GOAL</span>
        <h3>What do you want next reset?</h3>
        <p>Choose your reward. We’ll work out the fewest additional runs at the lowest qualifying key.</p>
        <div className={styles.goalFields}>
          <label>
            <span>Vault item level</span>
            <select value={target} onChange={(event) => setTarget(Number(event.target.value))}>
              {targets.map((value) => <option key={value} value={value}>{value} iLvl</option>)}
            </select>
          </label>
          <label>
            <span>Dungeon choices</span>
            <select value={slots} onChange={(event) => setSlots(Number(event.target.value))}>
              <option value={1}>1 choice · 1 run</option>
              <option value={2}>2 choices · 4 runs</option>
              <option value={3}>3 choices · 8 runs</option>
            </select>
          </label>
        </div>
        <span className={styles.goalFootnote}>More choices, one reward to claim. Lower keys already in your plan are kept.</span>
      </div>
      <div className={styles.goalResult}>
        <span className={styles.smallLabel}>{goal.missing === 0 ? "GOAL REACHED IN YOUR PLAN" : "YOUR SHORTEST ROUTE"}</span>
        <strong data-testid="goal-runs">{goal.missing === 0 ? "Ready" : `${goal.missing} × +${goal.key}`}</strong>
        <p>{goal.missing === 0 ? `${slots} ${slots === 1 ? "choice" : "choices"} at ${target} iLvl or higher.` : `${goal.missing} more ${goal.missing === 1 ? "run" : "runs"} at +${goal.key} or higher.`}</p>
        <div className={styles.goalProgress}><span>Qualifying runs in your plan</span><b>{Math.min(goal.qualifying, goal.required)} / {goal.required}</b></div>
        <button type="button" disabled={goal.missing === 0 || full} onClick={() => onChange([...runs, ...Array<number>(goal.missing).fill(goal.key)])}>
          {goal.missing === 0 ? "Goal included in plan ✓" : full ? "Planner limit reached" : "Add missing runs →"}
        </button>
        <small>This adds planned runs. Nothing is booked or completed.</small>
      </div>
    </div>
  );
}
