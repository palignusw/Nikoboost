
"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./TimePicker.module.scss";

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
};

const HOURS = Array.from(
  { length: 24 },
  (_, index) => String(index).padStart(2, "0")
);

const MINUTES = ["00", "15", "30", "45"];

export default function TimePicker({
  value,
  onChange,
  disabled = false,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(
    value.split(":")[0] || "20"
  );
  const [minute, setMinute] = useState(
    value.split(":")[1] || "00"
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    function handleOutside(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape, true);
    };
  }, [open]);

  function selectTime() {
    onChange(`${hour}:${minute}`);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function openPicker() {
    if (disabled) return;

    if (!open) {
      setHour(value.split(":")[0] || "20");
      setMinute(value.split(":")[1] || "00");
    }
    setOpen((current) => !current);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${
          open ? styles.triggerOpen : ""
        }`}
        aria-label={
          value
            ? `Preferred time ${value}`
            : "Select preferred time"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        disabled={disabled}
        onClick={openPicker}
      >
        <span
          className={
            value ? styles.value : styles.placeholder
          }
        >
          {value || "Select a time"}
        </span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      </button>

      {open && (
        <div
          id={id}
          className={styles.popup}
          role="dialog"
          aria-label="Choose preferred time"
        >
          <div className={styles.popupHeader}>
            <div className={styles.heading}>
              <span className={styles.headingIcon}>✦</span>
              <strong>Select your time</strong>
            </div>

            <span className={styles.brand}>
              NIKOBOOST
            </span>
          </div>

          <div className={styles.sectionHeading}>
            <span>HOUR</span>
            <span>24-HOUR FORMAT</span>
          </div>

          <div className={styles.hoursGrid}>
            {HOURS.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.timeOption} ${
                  hour === item ? styles.selected : ""
                }`}
                aria-pressed={hour === item}
                onClick={() => setHour(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.sectionHeading}>
            <span>MINUTES</span>
            <span>15-MINUTE INTERVALS</span>
          </div>

          <div className={styles.minutesGrid}>
            {MINUTES.map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.timeOption} ${
                  minute === item ? styles.selected : ""
                }`}
                aria-pressed={minute === item}
                onClick={() => setMinute(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.popupFooter}>
            <div className={styles.selectedTime}>
              <span>SELECTED TIME</span>
              <strong>
                {hour}:{minute}
              </strong>
            </div>

            <button
              type="button"
              className={styles.confirm}
              onClick={selectTime}
            >
              Confirm
              <span aria-hidden="true">✓</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
