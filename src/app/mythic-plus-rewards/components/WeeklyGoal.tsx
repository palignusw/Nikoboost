"use client";

import { useState } from "react";
import { mythicRewards } from "@/data/wowSeason";
import { getWeeklyGoal, MAX_PLANNER_RUNS } from "@/lib/rewardsPlanner";
import RewardSelect from "./RewardSelect";
import styles from "../page.module.scss";

const targets = [...new Set(mythicRewards.map((reward) => reward.vault))].map(
  (value) => {
    const row = mythicRewards.find((reward) => reward.vault === value)!;
    return {
      value,
      label: `${value} iLvl`,
      detail: `${row.vaultTrack} · from +${row.level}`,
    };
  },
);

type Props = {
  runs: number[];
  completed: number[];
  onAdd: (runs: number[]) => void;
};

export default function WeeklyGoal({ runs, completed, onAdd }: Props) {
  const [target, setTarget] = useState(targets[targets.length - 1].value);
  const [slots, setSlots] = useState(2);
  const goal = getWeeklyGoal(runs, target, slots);
  const current = getWeeklyGoal(completed, target, slots);
  const full = runs.length + goal.missing > MAX_PLANNER_RUNS;

  return (
    <section
      className={styles.goalBuilder}
      data-testid="weekly-goal"
      aria-labelledby="goal-heading"
    >
      <div className={styles.goalControls}>
        <span className={styles.overline}>02 / CHOOSE YOUR WEEKLY GOAL</span>
        <h3 id="goal-heading">What reward are you aiming for?</h3>
        <RewardSelect
          label="Vault item level"
          value={target}
          options={targets}
          onChange={setTarget}
        />
        <span className={styles.fieldLabel}>How many dungeon choices?</span>
        <div
          className={styles.choiceCards}
          role="group"
          aria-label="Dungeon choices"
        >
          {[1, 2, 3].map((count, index) => (
            <button
              key={count}
              type="button"
              aria-pressed={slots === count}
              onClick={() => setSlots(count)}
            >
              <span>
                {count} {count === 1 ? "choice" : "choices"}
              </span>
              <small>
                {[1, 4, 8][index]} qualifying{" "}
                {[1, 4, 8][index] === 1 ? "run" : "runs"}
              </small>
            </button>
          ))}
        </div>
        <p className={styles.goalFootnote}>
          You pick <strong>one item</strong> from your unlocked choices after
          reset. More choices means more chances to find an upgrade.
        </p>
      </div>
      <div className={styles.goalResult}>
        <span className={styles.smallLabel}>
          {current.missing === 0
            ? "ALREADY EARNED THIS WEEK"
            : goal.missing === 0
              ? "COVERED BY YOUR PLAN"
              : "ADD THIS TO REACH YOUR GOAL"}
        </span>
        <strong data-testid="goal-runs">
          {goal.missing === 0 ? "Ready" : `${goal.missing} × +${goal.key}`}
        </strong>
        <p>
          {current.missing === 0
            ? "Your completed runs already meet this goal."
            : goal.missing === 0
              ? "Finish the planned keys below to reach this reward tier."
              : `${goal.missing} more ${goal.missing === 1 ? "run" : "runs"} at +${goal.key} or higher. Your existing keys are already counted.`}
        </p>
        <div className={styles.goalProgress}>
          <span>Completed at this reward tier</span>
          <b>
            {Math.min(current.qualifying, goal.required)} / {goal.required}
          </b>
        </div>
        <div className={styles.goalProgress}>
          <span>Including planned keys</span>
          <b>
            {Math.min(goal.qualifying, goal.required)} / {goal.required}
          </b>
        </div>
        <button
          type="button"
          disabled={goal.missing === 0 || full}
          onClick={() => onAdd(Array<number>(goal.missing).fill(goal.key))}
        >
          {goal.missing === 0
            ? "Goal covered ✓"
            : full
              ? "Planner limit reached"
              : "Add missing runs to plan →"}
        </button>
        <small>Planning is free. This does not place an order.</small>
      </div>
    </section>
  );
}
