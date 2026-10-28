
"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { validateSchedule } from "@/lib/reservationSchedule";
import { getMythicReward } from "@/data/wowSeason";
import { dungeons } from "@/data/mythicPlus";
import DatePicker from "../../DatePicker/DatePicker"
import TimePicker from "../../TimePicker/TimePicker";

import type { MythicPlusConfig } from "../hooks/useMythicPlusConfig";
import { formatRole } from "../hooks/useMythicPlusConfig";

import styles from "./ReservationModal.module.scss";
import {
  downloadOrderPdf,
  type OrderReceipt,
} from "./downloadOrderPdf";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  config: MythicPlusConfig;
};

type CustomerForm = {
  battleTag: string;
  discord: string;
  character: string;
  realm: string;
  comment: string;
  website: string;
};

const emptyForm: CustomerForm = {
  battleTag: "",
  discord: "",
  character: "",
  realm: "",
  comment: "",
  website: "",
};

const timezones = Intl.supportedValuesOf("timeZone")
  .map((timezone) => ({
    value: timezone,
    label: timezone.replaceAll("_", " "),
  }));

if (!timezones.some((zone) => zone.value === "UTC")) {
  timezones.unshift({
    value: "UTC",
    label: "UTC",
  });
}


export default function ReservationModal({
  open,
  onClose,
  onSuccess,
  config,
}: Props) {
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const [scheduleMode, setScheduleMode] = useState<
    "exact" | "flexible"
  >("exact");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // The modal is initially closed, so browser-local state is safe to initialize here.
  const [timezone, setTimezone] = useState(() => {
    try {
      return (
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin"
      );
    } catch {
      return "Europe/Berlin";
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] =
    useState<OrderReceipt | null>(null);

  const [downloading, setDownloading] =
    useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        if (orderId) {
          window.location.assign("/");
        } else {
          onClose();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusable = Array.from(
        modal.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'
        )
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.tabIndex !== -1
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open, onClose, submitting, orderId]);

  // Reset response state before rendering a reopened dialog. Preserve form inputs.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError("");
      setOrderId("");
      setFinalTotal(null);
      setCopied(false);
      setReceipt(null);
      setDownloading(false);
    }
  }

  if (!open) return null;

  function updateField(field: keyof CustomerForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || orderId) return;

    setError("");


    if (scheduleMode === "exact") {
      const validation = validateSchedule(
        date,
        time,
        timezone
      );

      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }


    const preferredTime =
      scheduleMode === "flexible"
        ? `Flexible — please contact me (${timezone})`
        : `${date} ${time} (${timezone})`;

    setSubmitting(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            ...form,
            preferredTime,
          },

          order: {
            runGoal: config.runGoal,
            keyLevel: config.keyLevel,
            runs: config.runs,
            participation: config.participation,
            region: config.region,

            ...(config.runGoal === "standard"
              ? {
                role: config.role,
                playerClass: config.playerClass,
                traders: config.traders,
                specificDungeon: config.specificDungeon,
                dungeonCounts: config.dungeonCounts,
              }
              : {}),
          },

        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not submit the order."
        );
      }

      if (
        typeof data.orderId !== "string" ||
        typeof data.total !== "number" ||
        !Number.isFinite(data.total)
      ) {
        throw new Error("Invalid confirmation from server.");
      }

      if (
        !data.receipt ||
        data.receipt.orderId !== data.orderId ||
        data.receipt.total !== data.total
      ) {
        throw new Error(
          "Invalid order receipt from server."
        );
      }

      setReceipt(data.receipt as OrderReceipt);
      setOrderId(data.orderId);
      setFinalTotal(data.total);
      onSuccess?.();

      // Clear the submitted customer form.
      setForm({ ...emptyForm });
      setDate("");
      setTime("");
      setScheduleMode("exact");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyOrderId() {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
    } catch {
      setError("Could not copy automatically. Select the Order ID to copy it.");
    }
  }
  async function handleDownloadPdf() {
    if (!receipt || downloading) return;

    setError("");
    setDownloading(true);

    try {
      await downloadOrderPdf(receipt);
    } catch (downloadError) {
      console.error(downloadError);
      setError(
        "Could not generate PDF. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  function goToHomepage() {
    // Full navigation resets the configurator state too.
    window.location.assign("/");
  }

  const mode =
    config.participation === "play"
      ? "I Play"
      : "AFK / Minimal";

  const selectedDungeons = config.specificDungeon
    ? dungeons.filter(
      (name) => (config.dungeonCounts[name] ?? 0) > 0
    )
    : [];

  const remainingRuns = config.specificDungeon
    ? config.remainingRuns
    : config.runs;


  const isCrestFarming = config.runGoal === "crest";

  const crestReward =
    isCrestFarming && config.confirmed.keyLevel
      ? getMythicReward(config.keyLevel)
      : null;

  const estimatedCrests = crestReward
    ? crestReward.crestAmount * config.runs
    : null;


  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-title"
        aria-describedby="reservation-description"
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label="Close reservation"
          onClick={orderId ? goToHomepage : onClose}
          disabled={submitting}
        >
          ×
        </button>

        {orderId ? (
          <div className={styles.success} role="status">
            <div className={styles.successIcon}>✓</div>

            <span>RESERVATION RECEIVED</span>

            <h2 id="reservation-title">
              Your order is in.
            </h2>

            <p id="reservation-description">
              Your request has been received.
              We&apos;ll contact you on Discord
              to confirm team availability,
              payment details and the start time.
            </p>

            <div className={styles.successOrder}>
              <div>
                <span>ORDER ID</span>
                <strong>{orderId}</strong>

                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={copyOrderId}
                >
                  {copied ? "✓ Copied" : "Copy Order ID"}
                </button>
              </div>

              <div>
                <span>TOTAL</span>
                <strong>
                  {finalTotal?.toLocaleString("en-US")}
                  <small> GOLD</small>
                </strong>
              </div>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <p className={styles.successNote}>
              Save your Order ID in case you need to
              contact us about this reservation.
            </p>

            <div className={styles.receiptActions}>
              <button
                type="button"
                className={styles.downloadReceipt}
                onClick={handleDownloadPdf}
                disabled={!receipt || downloading}
              >
                {downloading
                  ? "Generating PDF..."
                  : "↓ Download PDF Receipt"}
              </button>

              <button
                type="button"
                className={styles.done}
                onClick={goToHomepage}
              >
                Back to Homepage →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <span>FINAL STEP • NIKOBOOST</span>

              <h2 id="reservation-title">
                Reserve your run.
              </h2>

              <p id="reservation-description">
                Review your configuration and leave
                your details. No account required.
              </p>
            </div>


            <div className={styles.orderPreview}>
              <div className={styles.previewTop}>
                <div>
                  <span>
                    {isCrestFarming
                      ? "CREST FARMING"
                      : "YOUR ORDER"}
                  </span>

                  <strong>
                    Mythic+ +{config.keyLevel}
                    <small>
                      {" "}× {config.runs}{" "}
                      {config.runs === 1 ? "run" : "runs"}
                    </small>
                  </strong>
                </div>

                <div className={styles.previewPrice}>
                  <span>ESTIMATED TOTAL</span>

                  <strong>
                    {config.calculation.total.toLocaleString("en-US")}
                    <small> GOLD</small>
                  </strong>
                </div>
              </div>

              <div className={styles.previewDetails}>
                {!isCrestFarming && (
                  <>
                    <div>
                      <span>Class</span>
                      <strong>{config.playerClass}</strong>
                    </div>

                    <div>
                      <span>Role</span>
                      <strong>
                        {config.participation === "play"
                          ? formatRole(config.role)
                          : "—"}
                      </strong>
                    </div>
                  </>
                )}

                <div>
                  <span>Mode</span>
                  <strong>{mode}</strong>
                </div>

                <div>
                  <span>Region</span>
                  <strong>{config.region}</strong>
                </div>

                {isCrestFarming ? (
                  <>
                    <div>
                      <span>Crest Type</span>
                      <strong>
                        {crestReward
                          ? `${crestReward.crest} Mistcrests`
                          : "Unavailable"}
                      </strong>
                    </div>

                    <div>
                      <span>Estimated Crests</span>
                      <strong>
                        {estimatedCrests ?? "Unavailable"}
                      </strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span>Loot Traders</span>
                      <strong>
                        {config.traders === 0
                          ? "None"
                          : `+${config.traders}`}
                      </strong>
                    </div>

                    <div>
                      <span>Armor</span>
                      <strong>{config.armorType}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.previewDungeons}>
                <span>DUNGEONS</span>

                {isCrestFarming ? (
                  <div>
                    <strong>Any Dungeon</strong>
                    <span>×{config.runs}</span>
                  </div>
                ) : (
                  <>
                    {selectedDungeons.map((name) => (
                      <div key={name}>
                        <strong>{name}</strong>
                        <span>
                          ×{config.dungeonCounts[name]}
                        </span>
                      </div>
                    ))}

                    {remainingRuns > 0 && (
                      <div>
                        <strong>Any Dungeon</strong>
                        <span>×{remainingRuns}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <p className={styles.priceNote}>
                {isCrestFarming
                  ? "Crest rewards are estimates. Final price and availability are confirmed before the run."
                  : "Final price and availability are confirmed before the run."}
              </p>
            </div>


            <form onSubmit={handleSubmit}>
              <div className={styles.formHeading}>
                <span>01</span>
                <h3>Contact & character details</h3>
              </div>

              <div className={styles.formGrid}>
                <label>
                  <span>BattleTag *</span>
                  <input
                    disabled={submitting}
                    required
                    autoComplete="off"
                    maxLength={80}
                    value={form.battleTag}
                    placeholder="Player#1234"
                    onChange={(event) =>
                      updateField(
                        "battleTag",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Discord *</span>
                  <input
                    disabled={submitting}
                    required
                    maxLength={80}
                    value={form.discord}
                    placeholder="@username"
                    onChange={(event) =>
                      updateField(
                        "discord",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Character Name *</span>
                  <input
                    disabled={submitting}
                    required
                    maxLength={80}
                    value={form.character}
                    placeholder="Your character"
                    onChange={(event) =>
                      updateField(
                        "character",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Realm *</span>
                  <input
                    disabled={submitting}
                    required
                    maxLength={80}
                    value={form.realm}
                    placeholder="Tarren Mill"
                    onChange={(event) =>
                      updateField(
                        "realm",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>

              <div className={styles.formHeading}>
                <span>02</span>
                <h3>Preferred start time</h3>
              </div>

              <p className={styles.formHint}>
                Tell us when you would like to start.
                We&apos;ll confirm the exact time on Discord.
              </p>

              <div className={styles.scheduleOptions}>
                <button
                  disabled={submitting}
                  type="button"
                  className={
                    scheduleMode === "exact"
                      ? styles.scheduleActive
                      : styles.scheduleButton
                  }
                  aria-pressed={scheduleMode === "exact"}
                  onClick={() => setScheduleMode("exact")}
                >
                  Choose date & time
                </button>

                <button
                  disabled={submitting}
                  type="button"
                  className={
                    scheduleMode === "flexible"
                      ? styles.scheduleActive
                      : styles.scheduleButton
                  }
                  aria-pressed={scheduleMode === "flexible"}
                  onClick={() => setScheduleMode("flexible")}


                >

                  Flexible time
                </button>
              </div>

              <div className={styles.formGrid}>
                {scheduleMode === "exact" && (
                  <>

                    <div className={styles.dateField}>
                      <span>Preferred Date *</span>

                      <DatePicker
                        value={date}
                        onChange={setDate}
                        disabled={submitting}
                      />
                    </div>



                    <div className={styles.dateField}>
                      <span>Preferred Time *</span>

                      <TimePicker
                        value={time}
                        onChange={setTime}
                        disabled={submitting}
                      />
                    </div>

                  </>
                )}

                <label className={styles.full}>
                  <span>Your Time Zone *</span>
                  <select
                    disabled={submitting}
                    required
                    value={timezone}
                    onChange={(event) =>
                      setTimezone(event.target.value)
                    }
                  >
                    {!timezones.some((zone) => zone.value === timezone) && (
                      <option value={timezone}>
                        Your local time zone ({timezone})
                      </option>
                    )}

                    {timezones.map((zone) => (
                      <option
                        key={zone.value}
                        value={zone.value}
                      >
                        {zone.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {scheduleMode === "flexible" && (
                <p className={styles.flexibleNote}>
                  No problem! We&apos;ll arrange a
                  suitable time with you on Discord.
                </p>
              )}

              <div className={styles.formHeading}>
                <span>03</span>
                <h3>Additional notes</h3>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.full}>
                  <span>Comment (optional)</span>
                  <textarea
                    disabled={submitting}
                    rows={3}
                    maxLength={700}
                    value={form.comment}
                    placeholder="Anything we should know about your run?"
                    onChange={(event) =>
                      updateField(
                        "comment",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label
                  className={styles.honeypot}
                  aria-hidden="true"
                >
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) =>
                      updateField(
                        "website",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancel}
                  disabled={submitting}
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={submitting}
                >
                  {submitting
                    ? "Sending order..."
                    : "Submit Reservation"}

                  {!submitting && (
                    <span aria-hidden="true">→</span>
                  )}
                </button>
              </div>

              <p className={styles.notice}>
                No payment is collected on this website.
                Submission is a reservation request,
                not a confirmed run.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
