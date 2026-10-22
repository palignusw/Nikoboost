
import type { CSSProperties } from "react";

import styles from "./Stepper.module.scss";

type StepItem = {
  number: number;
  label: string;
};

const standardSteps: StepItem[] = [
  { number: 1, label: "Run" },
  { number: 2, label: "Character" },
  { number: 3, label: "Dungeons & Loot" },
  { number: 4, label: "Review" },
];

const crestSteps: StepItem[] = [
  { number: 1, label: "Farming Setup" },
  { number: 4, label: "Review" },
];

type Props = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  runGoal?: "standard" | "crest";
};

export default function Stepper({
  currentStep,
  setCurrentStep,
  runGoal = "standard",
}: Props) {
  const isCrestFarming = runGoal === "crest";

  const steps = isCrestFarming
    ? crestSteps
    : standardSteps;

  const foundIndex = steps.findIndex(
    (step) => step.number === currentStep
  );

  const activeIndex =
    foundIndex >= 0 ? foundIndex : 0;

  const indicatorStyle = {
    "--step-index": activeIndex,
    "--mobile-column": activeIndex % 2,
    "--mobile-row": Math.floor(activeIndex / 2),
  } as CSSProperties;

  const progressStyle = {
    width: `${
      ((activeIndex + 1) / steps.length) * 100
    }%`,
  };

  return (
    <nav
      className={`${styles.stepper} ${
        isCrestFarming ? styles.crestStepper : ""
      }`}
      aria-label="Mythic+ configuration steps"
    >
      <span
        className={styles.activeIndicator}
        style={indicatorStyle}
        aria-hidden="true"
      />

      {steps.map((step, index) => {
        const active = step.number === currentStep;
        const completed = index < activeIndex;

        return (
          <button
            key={step.number}
            type="button"
            aria-current={active ? "step" : undefined}
            aria-label={`Step ${index + 1} of ${
              steps.length
            }: ${step.label}${
              completed ? ", completed" : ""
            }`}
            onClick={() => setCurrentStep(step.number)}
            className={[
              styles.step,
              active ? styles.stepActive : "",
              completed ? styles.stepCompleted : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.stepNumber}>
              {completed ? (
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              ) : (
                index + 1
              )}
            </span>

            <span className={styles.stepLabel}>
              {step.label}
            </span>
          </button>
        );
      })}

      <span
        className={styles.progressTrack}
        aria-hidden="true"
      >
        <span
          className={styles.progressFill}
          style={progressStyle}
        />
      </span>
    </nav>
  );
}
