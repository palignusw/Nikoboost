
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./MythicPlus.module.scss";

import {
  useMythicPlusConfig,
} from "./hooks/useMythicPlusConfig";

import Stepper from "./components/Stepper";
import ReservationModal from "./components/ReservationModal";

import RunSetup from "./sections/RunSetup/RunSetup";
import CharacterSetup from "./sections/CharacterSetup/CharacterSetup";
import DungeonSetup from "./sections/DungeonSetup/DungeonSetup";
import LootSetup from "./sections/LootSetup/LootSetup";
import OrderSummary from "./sections/OrderSummary/OrderSummary";
import ReviewStep from "./sections/ReviewStep/ReviewStep";

type Step = 1 | 2 | 3 | 4;

type MissingField = {
  id: string;
  message: string;
  section: string;
};

export default function MythicPlus() {
  const config = useMythicPlusConfig();

  const configuratorRef = useRef<HTMLDivElement>(null);

  const transitionLockedRef = useRef(false);

  const transitionTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const [currentStep, setCurrentStep] =
    useState<Step>(1);

  const [maxUnlockedStep, setMaxUnlockedStep] =
    useState<Step>(1);

  const [reservationOpen, setReservationOpen] =
    useState(false);

  const [showMobileBar, setShowMobileBar] =
    useState(false);

  const [validationAttempted, setValidationAttempted] =
    useState(false);

  // ========================================
  // VALIDATION
  // ========================================

  function getMissingFields(step: Step): MissingField[] {
    const missing: MissingField[] = [];

    if (step === 1) {
      if (!config.confirmed.keyLevel) {
        missing.push({
          id: "keyLevel",
          message: "Choose your key level",
          section: "Key level",
        });
      }

      if (!config.confirmed.runs) {
        missing.push({
          id: "runs",
          message: "Choose the number of runs",
          section: "Number of runs",
        });
      }

      if (!config.confirmed.participation) {
        missing.push({
          id: "participation",
          message: "Choose I Play or AFK / Minimal",
          section: "Participation",
        });
      }
    }

    if (step === 2) {
      if (!config.confirmed.playerClass) {
        missing.push({
          id: "playerClass",
          message: "Choose your character class",
          section: "Your character",
        });
      }

      const roleRequired =
        config.participation === "play" &&
        config.confirmed.playerClass &&
        config.allowedRoles.length > 1;

      if (roleRequired && !config.confirmed.role) {
        missing.push({
          id: "role",
          message: "Choose your character role",
          section: "Your character",
        });
      }
    }

    if (step === 3) {
      if (!config.confirmed.dungeon) {
        missing.push({
          id: "dungeon",
          message: "Choose your dungeon preference",
          section: "Dungeon",
        });
      } else if (
        config.specificDungeon &&
        config.allocatedSpecificRuns === 0
      ) {
        missing.push({
          id: "dungeonAllocation",
          message: "Assign at least one specific dungeon run",
          section: "Dungeon",
        });
      }

      if (!config.confirmed.traders) {
        missing.push({
          id: "traders",
          message: "Choose loot traders (None is allowed)",
          section: "Loot traders",
        });
      }

      if (!config.confirmed.region) {
        missing.push({
          id: "region",
          message: "Choose EU or NA region",
          section: "Region",
        });
      }
    }

    return missing;
  }

  const missingFields = getMissingFields(currentStep);

  const step1Complete =
    getMissingFields(1).length === 0;

  const step2Complete =
    getMissingFields(2).length === 0;

  const step3Complete =
    getMissingFields(3).length === 0;

  const allStepsComplete =
    step1Complete &&
    step2Complete &&
    step3Complete;

  const firstIncompleteStep: Step =
    !step1Complete
      ? 1
      : !step2Complete
        ? 2
        : !step3Complete
          ? 3
          : 4;

  const currentStepComplete =
    currentStep === 4
      ? allStepsComplete
      : missingFields.length === 0;

  const canReserve =
    currentStep === 4 &&
    maxUnlockedStep === 4 &&
    allStepsComplete;

  const primaryButtonLabel =
    currentStep === 4
      ? canReserve
        ? "Reserve run"
        : "Finish setup"
      : currentStepComplete
        ? "Continue"
        : "Complete this step";

  const showErrors =
    validationAttempted &&
    missingFields.length > 0;

  // ========================================
  // MOBILE PRICE BAR
  // ========================================

  useEffect(() => {
    const element = configuratorRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileBar(entry.isIntersecting);
      },
      {
        threshold: 0,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // ========================================
  // CLEANUP
  // ========================================

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // ========================================
  // SCROLL HELPERS
  // ========================================

  function scrollToConfigurator() {
    setTimeout(() => {
      document
        .getElementById("mythic-steps")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 0);
  }

  function scrollToField(sectionTitle: string) {
    const container = configuratorRef.current;

    if (!container) return;

    const sections =
      container.querySelectorAll<HTMLElement>(
        "section"
      );

    const target = Array.from(sections).find(
      (section) => {
        const heading =
          section.querySelector("header h3");

        return (
          heading?.textContent?.trim() ===
          sectionTitle
        );
      }
    );

    if (!target) {
      scrollToConfigurator();
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // Brief visual highlight of the missing field.
    if (
      typeof target.animate === "function" &&
      !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      target.animate(
        [
          {
            boxShadow:
              "0 0 0 0 rgba(248,113,113,0)",
          },
          {
            boxShadow:
              "0 0 0 2px rgba(248,113,113,0.9)",
          },
          {
            boxShadow:
              "0 0 0 0 rgba(248,113,113,0)",
          },
        ],
        {
          duration: 1500,
          easing: "ease-in-out",
        }
      );
    }
  }

  // ========================================
  // TRANSITION LOCK
  // ========================================

  function lockTransition() {
    if (transitionLockedRef.current) {
      return false;
    }

    transitionLockedRef.current = true;

    if (transitionTimerRef.current !== null) {
      clearTimeout(transitionTimerRef.current);
    }

    transitionTimerRef.current = setTimeout(() => {
      transitionLockedRef.current = false;
      transitionTimerRef.current = null;
    }, 650);

    return true;
  }

  // ========================================
  // NAVIGATION
  // ========================================

  function goToStep(step: Step) {
    setValidationAttempted(false);
    setCurrentStep(step);
    scrollToConfigurator();
  }

  function nextStep() {
    if (currentStep >= 4) return;

    if (!currentStepComplete) {
      showValidationErrors();
      return;
    }

    if (firstIncompleteStep < currentStep) {
      returnToIncompleteStep();
      return;
    }

    if (!lockTransition()) return;

    const next = (currentStep + 1) as Step;

    setMaxUnlockedStep((previous) =>
      Math.max(previous, next) as Step
    );

    goToStep(next);
  }

  function previousStep() {
    if (currentStep <= 1) return;

    if (!lockTransition()) return;

    goToStep((currentStep - 1) as Step);
  }

  function selectStep(step: number) {
    if (step < 1 || step > 4) return;

    const selectedStep = step as Step;

    if (selectedStep > maxUnlockedStep) return;

    if (selectedStep > firstIncompleteStep) {
      return;
    }

    if (selectedStep === currentStep) return;

    if (!lockTransition()) return;

    goToStep(selectedStep);
  }

  // ========================================
  // VALIDATION ACTIONS
  // ========================================

  function showValidationErrors() {
    setValidationAttempted(true);

    const firstMissing = missingFields[0];

    if (firstMissing) {
      scrollToField(firstMissing.section);
    }
  }

  function returnToIncompleteStep() {
    const step = firstIncompleteStep;

    setCurrentStep(step);
    setValidationAttempted(true);

    const firstMissing = getMissingFields(step)[0];

    if (firstMissing) {
      setTimeout(() => {
        scrollToField(firstMissing.section);
      }, 50);
    }
  }

  // ========================================
  // RESERVATION
  // ========================================

  function openReservation() {
    if (!canReserve) {
      return;
    }

    setReservationOpen(true);
  }

  function handlePrimaryAction() {
    // An earlier step became incomplete.
    if (firstIncompleteStep < currentStep) {
      returnToIncompleteStep();
      return;
    }

    // Final step.
    if (currentStep === 4) {
      if (canReserve) {
        openReservation();
      } else {
        returnToIncompleteStep();
      }

      return;
    }

    // Show specific missing fields.
    if (!currentStepComplete) {
      showValidationErrors();
      return;
    }

    nextStep();
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <section
      id="mythic"
      className={styles.section}
    >
      <div className="container">
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              MYTHIC+ CONFIGURATOR
            </span>

            <h2>
              Build your
              <span> perfect run.</span>
            </h2>
          </div>

          <p>
            Configure exactly what you need.
            Your price updates instantly.
          </p>
        </header>

        <div
          id="mythic-steps"
          className={styles.stepperAnchor}
        >
          <Stepper
            currentStep={currentStep}
            setCurrentStep={selectStep}
          />
        </div>

        <div className={styles.layout}>
          <div
            ref={configuratorRef}
            className={styles.configurator}
          >
            <div className={styles.stepContent}>
              <div
                key={currentStep}
                className={styles.stepPanel}
              >
                {currentStep === 1 && (
                  <RunSetup config={config} />
                )}

                {currentStep === 2 && (
                  <CharacterSetup config={config} />
                )}

                {currentStep === 3 && (
                  <>
                    <DungeonSetup config={config} />

                    <div
                      className={styles.stepDivider}
                    />

                    <LootSetup config={config} />
                  </>
                )}

                {currentStep === 4 && (
                  <ReviewStep config={config} />
                )}
              </div>
            </div>

            {/* VALIDATION ERRORS */}

            {showErrors && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  marginTop: 24,
                  padding: "18px 20px",
                  border:
                    "1px solid rgba(248,113,113,0.35)",
                  borderRadius: 12,
                  background:
                    "rgba(248,113,113,0.065)",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 12,
                    color: "#ffb4ba",
                    fontSize: 14,
                  }}
                >
                  Please complete the following:
                </strong>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  {missingFields.map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() =>
                        scrollToField(field.section)
                      }
                      style={{
                        padding: 0,
                        border: 0,
                        background: "transparent",
                        color: "#ffd0d4",
                        fontSize: 13,
                        textAlign: "left",
                        lineHeight: 1.6,
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          marginRight: 8,
                          color: "#ff7c88",
                        }}
                      >
                        !
                      </span>

                      {field.message}

                      <span
                        aria-hidden="true"
                        style={{
                          marginLeft: 8,
                          color: "#ff9ba5",
                        }}
                      >
                        ↑
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP ACTIONS */}

            <div className={styles.stepActions}>
              {currentStep > 1 && (
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={previousStep}
                >
                  ← Back
                </button>
              )}

              <button
                type="button"
                className={styles.continueButton}
                onClick={handlePrimaryAction}
              >
                {primaryButtonLabel}

                <span aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>

          <OrderSummary
            config={config}
            canReserve={canReserve}
            onReserve={handlePrimaryAction}
          />
        </div>
      </div>

      {/* MOBILE PRICE BAR — PRICE ONLY */}

      {showMobileBar && !reservationOpen && (
        <div className={styles.mobilePriceBar}>
          <div className={styles.mobilePriceInfo}>
            <span className={styles.mobilePriceLabel}>
              {canReserve
                ? "TOTAL PRICE"
                : "ESTIMATED PRICE"}
            </span>

            <strong className={styles.mobilePriceValue}>
              {config.calculation.total.toLocaleString(
                "en-US"
              )}

              <small> GOLD</small>
            </strong>
          </div>
        </div>
      )}

      <ReservationModal
        open={reservationOpen}
        config={config}
        onClose={() =>
          setReservationOpen(false)
        }
      />
    </section>
  );
}
