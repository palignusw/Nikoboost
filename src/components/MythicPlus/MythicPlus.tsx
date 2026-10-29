
"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./MythicPlus.module.scss";

import {
  useMythicPlusConfig,
  formatRole,
} from "./hooks/useMythicPlusConfig";

import BookingDraftNotice from "@/components/BookingDraft/BookingDraftNotice";
import { useBookingDraft } from "@/components/BookingDraft/useBookingDraft";
import { parseMythicDraft } from "@/lib/bookingDrafts";

import { reportBookingEvent } from "@/lib/bookingAnalytics";
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

const NOT_SELECTED = "Not selected";

export default function MythicPlus() {
  const config = useMythicPlusConfig();

  const configuratorRef =
    useRef<HTMLDivElement>(null);

  const actionsRef =
    useRef<HTMLDivElement>(null);

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

  const [validationAttempted, setValidationAttempted] =
    useState(false);

  // Mobile price panel
  const [configuratorVisible, setConfiguratorVisible] =
    useState(false);

  const [actionsNear, setActionsNear] =
    useState(false);


  const [priceExpanded, setPriceExpanded] =
    useState(false);

  const draft = useBookingDraft({
    service: "mythic", value: config.draftValue,
    dirty: Object.values(config.confirmed).some(Boolean) || config.runGoal !== "standard",
    parse: parseMythicDraft,
    restore: config.restoreDraft,
    reset: () => {
      config.resetDraft();
      setCurrentStep(1);
      setMaxUnlockedStep(1);
      setValidationAttempted(false);
      setPriceExpanded(false);
    },
  });

  // ========================================
  // STEP VALIDATION
  // ========================================

  function getMissingFields(step: Step): MissingField[] {
    const missing: MissingField[] = [];
    const isCrestFarming = config.runGoal === "crest";

    if (isCrestFarming && (step === 2 || step === 3)) {
      return [];
    }

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

      if (isCrestFarming && !config.confirmed.region) {
        missing.push({
          id: "region",
          message: "Choose EU or NA region",
          section: "Region",
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
          message:
            "Assign at least one specific dungeon run",
          section: "Dungeon",
        });
      }

      if (!config.confirmed.traders) {
        missing.push({
          id: "traders",
          message:
            "Choose loot traders (None is allowed)",
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

  const missingFields =
    getMissingFields(currentStep);

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
  // MOBILE PRICE VISIBILITY
  // ========================================

  useEffect(() => {
    const configurator =
      configuratorRef.current;

    const actions =
      actionsRef.current;

    if (!configurator || !actions) return;


    const configuratorObserver =
      new IntersectionObserver(
        ([entry]) => {
          setConfiguratorVisible(
            entry.isIntersecting
          );
        },
        {
          threshold: 0,
        }
      );

    // Hide the floating bar BEFORE the
    // navigation buttons reach the bottom.
    const actionsObserver =
      new IntersectionObserver(
        ([entry]) => {
          setActionsNear(entry.isIntersecting);
        },
        {
          rootMargin: "0px 0px 120px 0px",
          threshold: 0,
        }
      );



    configuratorObserver.observe(configurator);
    actionsObserver.observe(actions);

    return () => {
      configuratorObserver.disconnect();
      actionsObserver.disconnect();
    };
  }, [currentStep]);

  const showMobilePrice = !reservationOpen && !draft.pending && configuratorVisible && !actionsNear;

  const showPrice =
    config.confirmed.keyLevel &&
    config.confirmed.runs;

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
  // SCROLL
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
    const container =
      configuratorRef.current;

    if (!container) return;

    const sections =
      container.querySelectorAll<HTMLElement>(
        "section"
      );

    const target =
      Array.from(sections).find((section) => {
        const heading =
          section.querySelector("header h3");

        return (
          heading?.textContent?.trim() ===
          sectionTitle
        );
      });

    if (!target) {
      scrollToConfigurator();
      return;
    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

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
    setPriceExpanded(false);
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

    // Crest Farming: пропускаем Character и Dungeons & Loot
    const next: Step =
      config.runGoal === "crest" && currentStep === 1
        ? 4
        : ((currentStep + 1) as Step);

    setMaxUnlockedStep((previous) =>
      Math.max(previous, next) as Step
    );

    goToStep(next);
  }

  function previousStep() {
    if (currentStep <= 1) return;
    if (!lockTransition()) return;

    const previous: Step =
      config.runGoal === "crest" && currentStep === 4
        ? 1
        : ((currentStep - 1) as Step);

    goToStep(previous);
  }

  function selectStep(step: number) {
    if (
      config.runGoal === "crest" &&
      step !== 1 &&
      step !== 4
    ) {
      return;
    }
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
    setPriceExpanded(false);

    const firstMissing =
      getMissingFields(step)[0];

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
    if (!canReserve || reservationOpen) return;

    reportBookingEvent("mythic", "form_opened");
    setPriceExpanded(false);
    setReservationOpen(true);
  }

  function handlePrimaryAction() {
    if (firstIncompleteStep < currentStep) {
      returnToIncompleteStep();
      return;
    }

    if (currentStep === 4) {
      if (canReserve) {
        openReservation();
      } else {
        returnToIncompleteStep();
      }

      return;
    }

    if (!currentStepComplete) {
      showValidationErrors();
      return;
    }

    nextStep();
  }

  // ========================================
  // MOBILE ORDER PREVIEW
  // ========================================

  const mobilePriceRows = [
    {
      label: "Key level",
      value: config.confirmed.keyLevel
        ? `+${config.keyLevel}`
        : NOT_SELECTED,
    },
    {
      label: "Runs",
      value: config.confirmed.runs
        ? String(config.runs)
        : NOT_SELECTED,
    },
    {
      label: "Mode",
      value: config.confirmed.participation
        ? config.participation === "play"
          ? "I Play"
          : "AFK / Minimal"
        : NOT_SELECTED,
    },
    {
      label: "Class",
      value: config.confirmed.playerClass
        ? config.playerClass
        : NOT_SELECTED,
    },
    {
      label: "Role",
      value:
        config.confirmed.participation &&
          config.participation === "afk"
          ? "Not required"
          : config.confirmed.playerClass &&
            (
              config.confirmed.role ||
              config.allowedRoles.length === 1
            )
            ? formatRole(config.role)
            : NOT_SELECTED,
    },
    {
      label: "Dungeon",
      value:
        config.runGoal === "crest"
          ? "Any dungeon"
          : !config.confirmed.dungeon
            ? NOT_SELECTED
            : config.specificDungeon
              ? `${config.allocatedSpecificRuns}/${config.runs} specific`
              : "Any",
    },
    {
      label: "Traders",
      value: config.confirmed.traders
        ? config.traders > 0
          ? `+${config.traders}`
          : "None"
        : NOT_SELECTED,
    },

    {
      label: "Region",
      value: config.confirmed.region
        ? config.region
        : NOT_SELECTED,
    },
  ].filter((row) => {
    if (config.runGoal !== "crest") {
      return true;
    }

    return ![
      "Class",
      "Role",
      "Traders",
    ].includes(row.label);
  });

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

        <BookingDraftNotice {...draft} />
        <div
          id="mythic-steps"
          inert={draft.pending ? true : undefined}
          className={styles.stepperAnchor}
        >
          <Stepper
            currentStep={currentStep}
            setCurrentStep={selectStep}
            runGoal={config.runGoal}
          />
        </div>

        <div className={styles.layout} inert={draft.pending ? true : undefined}>
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

            <div
              ref={actionsRef}
              className={styles.stepActions}
            >
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
          <div className={styles.desktopSummary}>      <OrderSummary
            config={config}
            canReserve={canReserve}
            onReserve={handlePrimaryAction}
          />
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING PRICE */}

      {showMobilePrice && (
        <div
          className={styles.mobilePriceBar}
          role="region"
          aria-label="Live order price"
        >
          <div
            id="mobile-price-details"
            className={styles.mobilePriceDetails}
            hidden={!priceExpanded}
          >
            <div
              className={styles.mobilePriceDetailsTitle}
            >
              YOUR ORDER
            </div>

            {mobilePriceRows.map((row) => (
              <div
                key={row.label}
                className={styles.mobilePriceDetailsRow}
              >
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}

            <p
              className={styles.mobilePriceDetailsHint}
            >
              {config.canReserve
                ? "Your configuration is complete."
                : "Price updates as you configure your run."}
            </p>
          </div>

          <button
            type="button"
            className={styles.mobilePriceToggle}
            aria-expanded={priceExpanded}
            aria-controls="mobile-price-details"
            aria-label={
              priceExpanded
                ? "Close order preview"
                : "Expand order preview"
            }
            onClick={() =>
              setPriceExpanded((previous) => !previous)
            }
          >
            <span className={styles.mobilePriceInfo}>
              <span className={styles.mobilePriceLabel}>
                {!showPrice
                  ? "SELECT OPTIONS"
                  : config.canReserve
                    ? "TOTAL PRICE"
                    : "ESTIMATED PRICE"}
              </span>

              <strong className={styles.mobilePriceValue}>
                {showPrice
                  ? config.calculation.total.toLocaleString("en-US")
                  : "—"}

                {showPrice && <small> GOLD</small>}
              </strong>
            </span>

            <span
              className={styles.mobilePriceExpand}
              aria-hidden="true"
            >
              <span>
                {priceExpanded
                  ? "Close"
                  : "Details"}
              </span>

              <span
                className={`${styles.mobilePriceChevron} ${priceExpanded
                  ? styles.mobilePriceChevronOpen
                  : ""
                  }`}
              >
                ↑
              </span>
            </span>
          </button>
        </div>
      )}

      <ReservationModal
        open={reservationOpen}
        config={config}
        onSuccess={draft.clear}
        onClose={() =>
          setReservationOpen(false)
        }
      />
    </section>
  );
}
