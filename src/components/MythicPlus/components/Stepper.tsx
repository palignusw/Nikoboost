import styles from "./Stepper.module.scss";

const steps = [
  {
    number: 1,
    label: "Run",
  },
  {
    number: 2,
    label: "Character",
  },
  {
    number: 3,
    label: "Dungeons & Loot",
  },
  {
    number: 4,
    label: "Review",
  },
];

export default function Stepper({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (
    step: number
  ) => void;
}) {
  return (
    <div className={styles.stepper}>
      {steps.map((step) => {
        const active =
          step.number ===
          currentStep;

        const completed =
          step.number <
          currentStep;

        return (
          <button
            type="button"
            key={step.number}
            onClick={() =>
              setCurrentStep(
                step.number
              )
            }
            className={`${styles.step} ${
              active
                ? styles.stepActive
                : ""
            } ${
              completed
                ? styles.stepCompleted
                : ""
            }`}
          >
            <span
              className={
                styles.stepNumber
              }
            >
              {completed
                ? "✓"
                : step.number}
            </span>

            <span
              className={
                styles.stepLabel
              }
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}