
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

export default function MythicPlus() {
  const config = useMythicPlusConfig();

  const configuratorRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  // Show the mobile price bar only while
  // the configurator is visible.
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

  function nextStep() {
    setCurrentStep((step) =>
      Math.min(4, step + 1)
    );

    scrollToConfigurator();
  }

  function previousStep() {
    setCurrentStep((step) =>
      Math.max(1, step - 1)
    );

    scrollToConfigurator();
  }

  function openReservation() {
    setReservationOpen(true);
  }

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
            setCurrentStep={(step) => {
              setCurrentStep(step);
              scrollToConfigurator();
            }}
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

              {currentStep < 4 ? (
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={nextStep}
                >
                  Continue
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={openReservation}
                >
                  Reserve run
                  <span>→</span>
                </button>
              )}
            </div>
          </div>

          <OrderSummary
            config={config}
            onReserve={openReservation}
          />
        </div>
      </div>

      {/* Mobile floating price bar */}
      {showMobileBar && !reservationOpen && (
        <div className={styles.mobilePriceBar}>
          <div className={styles.mobilePriceInfo}>
            <span className={styles.mobilePriceLabel}>
              TOTAL PRICE
            </span>

            <strong className={styles.mobilePriceValue}>
              {config.calculation.total.toLocaleString(
                "en-US"
              )}
              <small> GOLD</small>
            </strong>
          </div>

          <button
            type="button"
            className={styles.mobileReserveButton}
            onClick={openReservation}
          >
            Reserve run
            <span aria-hidden="true">→</span>
          </button>
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
