
"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./DatePicker.module.scss";

type DatePickerProps = {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  disabled?: boolean;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function toDateString(year: number, month: number, day: number) {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function todayString() {
  const today = new Date();
  return toDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export default function DatePicker({
  value,
  onChange,
  required = false,
  disabled = false,
}: DatePickerProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = parseDate(value) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = todayString();

  const selected = parseDate(value);

  const formattedValue = selected
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selected)
    : "Select a date";

  const cells = Array.from(
    { length: Math.ceil((firstDay + daysInMonth) / 7) * 7 },
    (_, index) => index - firstDay + 1
  );

  const canGoPrevious =
    toDateString(year, month + 1, 0) >= today &&
    toDateString(year, month, 1) >
      today.slice(0, 7) + "-01";

  function changeMonth(direction: number) {
    setCurrentMonth(
      new Date(year, month + direction, 1)
    );
  }

  function selectDay(day: number) {
    const nextDate = toDateString(year, month, day);

    if (nextDate < today) return;

    onChange(nextDate);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${
          open ? styles.triggerOpen : ""
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={() => {
          if (!open) {
            const date = parseDate(value) ?? new Date();
            setCurrentMonth(
              new Date(date.getFullYear(), date.getMonth(), 1)
            );
          }

          setOpen((previous) => !previous);
        }}
      >
        <span className={value ? styles.value : styles.placeholder}>
          {formattedValue}
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
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      </button>

      {/* {required && (
        <input
          type="text"
          className={styles.validationInput}
          value={value}
          required
          tabIndex={-1}
          aria-label="Preferred date"
          onChange={() => {}}
          onInvalid={() => {
            setOpen(true);
          }}
        />
      )} */}

      {open && (
        <div
          id={id}
          className={styles.calendar}
          role="dialog"
          aria-label="Choose preferred start date"
        >
          <div className={styles.calendarHeader}>
            <div className={styles.calendarHeading}>
              <span className={styles.calendarIcon}>✦</span>
              <strong>Select your date</strong>
            </div>

            <span className={styles.brand}>NIKOBOOST</span>
          </div>

          <div className={styles.monthNavigation}>
            <strong>
              {MONTHS[month]} {year}
            </strong>

            <div>
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoPrevious}
                onClick={() => changeMonth(-1)}
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {WEEKDAYS.map((day) => (
              <span key={day} className={styles.weekday}>
                {day}
              </span>
            ))}

            {cells.map((day, index) => {
              if (day < 1 || day > daysInMonth) {
                return (
                  <span
                    key={`empty-${index}`}
                    className={styles.empty}
                  />
                );
              }

              const dateString = toDateString(year, month, day);
              const isPast = dateString < today;
              const isToday = dateString === today;
              const isSelected = dateString === value;

              return (
                <button
                  type="button"
                  key={dateString}
                  className={[
                    styles.day,
                    isToday ? styles.today : "",
                    isSelected ? styles.selected : "",
                  ].join(" ")}
                  disabled={isPast}
                  aria-label={new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(year, month, day))}
                  aria-pressed={isSelected}
                  onClick={() => selectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className={styles.calendarFooter}>
            <div>
              <span>SELECTED DATE</span>
              <strong>
                {selected ? formattedValue : "Not selected"}
              </strong>
            </div>

            <button
              type="button"
              className={styles.todayButton}
              onClick={() => {
                const now = new Date();

                setCurrentMonth(
                  new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                  )
                );

                selectDayFromToday(now);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function selectDayFromToday(date: Date) {
    onChange(
      toDateString(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    );

    setOpen(false);
    triggerRef.current?.focus();
  }
}
