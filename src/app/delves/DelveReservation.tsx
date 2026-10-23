"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import DatePicker from "@/components/DatePicker/DatePicker";
import TimePicker from "@/components/TimePicker/TimePicker";
import { validateSchedule } from "@/lib/reservationSchedule";
import { delveName, delvePrice, gold, type DelveConfig } from "@/data/delves";
import { delveArt } from "@/data/delveArt";
import shared from "@/components/MythicPlus/components/ReservationModal.module.scss";
import styles from "./reservation.module.scss";

const timezones = ["UTC", ...Intl.supportedValuesOf("timeZone")];
export default function DelveReservation({
  config,
  onClose,
}: {
  config: DelveConfig;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{
    orderId: string;
    total: number | null;
    quote: boolean;
  } | null>(null);
  const [exact, setExact] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("20:00");
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [detailsOpen, setDetailsOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 701px)").matches,
  );
  const [keys, setKeys] = useState(config.runs);
  const quote = config.kind !== "runs";
  const price = delvePrice(config);
  const title =
    config.kind === "nemesis"
      ? "Azta’rec / Venomfall Deeps"
      : config.kind === "labyrinth"
        ? "Labyrinth of Kindo’jan"
        : `Delves · Tier ${config.tier}`;
  const art =
    delveArt[
      config.kind === "nemesis"
        ? "venomfall-deeps"
        : config.kind === "labyrinth"
          ? "labyrinth"
          : config.delveId
    ] ?? delveArt["midnight-delves"];
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = previous;
    };
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || receipt) return;
    const data = new FormData(e.currentTarget);
    if (exact) {
      const check = validateSchedule(date, time, timezone);
      if (!check.valid) {
        setError(check.error);
        return;
      }
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          customer: {
            battleTag: data.get("battleTag"),
            discord: data.get("discord"),
            character: data.get("character"),
            realm: data.get("realm"),
            website: data.get("website"),
            comment: data.get("comment"),
            preferredTime: exact
              ? `${date} ${time} (${timezone})`
              : `Flexible — please contact me (${timezone})`,
          },
          order: {
            ...config,
            tierUnlocked: data.get("tierUnlocked") === "on",
            cofferKeys: keys,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.error || "Could not submit your request.");
      if (
        typeof result.orderId !== "string" ||
        (result.total !== null &&
          (!Number.isInteger(result.total) || result.total < 0))
      )
        throw new Error(
          "Unexpected confirmation. Contact support before retrying.",
        );
      setReceipt(result);
      dialog.current?.scrollTo({ top: 0 });
    } catch (err) {
      setError(
        err instanceof Error && err.name === "TimeoutError"
          ? "Delivery was not confirmed. Check with support before retrying."
          : err instanceof Error
            ? err.message
            : "Could not submit your request.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className={`${shared.modal} ${styles.booking}`}
      aria-labelledby="delve-reservation-title"
      aria-describedby="delve-reservation-description"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <button
        type="button"
        className={shared.close}
        aria-label="Close reservation"
        disabled={busy}
        onClick={onClose}
      >
        ×
      </button>
      {receipt ? (
        <div className={shared.success} role="status">
          <div className={shared.successIcon}>✓</div>
          <span>RESERVATION RECEIVED</span>
          <h2 id="delve-reservation-title">
            {receipt.quote ? "Let’s plan your adventure." : "Your order is in."}
          </h2>
          <p id="delve-reservation-description">
            We’ll contact you on Discord to confirm details and availability.
          </p>
          <div className={shared.successOrder}>
            <span>YOUR REFERENCE</span>
            <strong>{receipt.orderId}</strong>
            <p>
              {receipt.total === null
                ? "Manual gold quote required"
                : `Server-confirmed total: ${gold(receipt.total)} gold`}
            </p>
          </div>
          <p className={shared.successNote}>
            No payment has been taken. Your start time is confirmed with the
            team.
          </p>
          <button type="button" className={shared.done} onClick={onClose}>
            Done →
          </button>
        </div>
      ) : (
        <>
          <div className={shared.header}>
            <span>FINAL STEP • NIKOBOOST</span>
            <h2 id="delve-reservation-title">
              {quote ? "Plan your adventure." : "Reserve your run."}
            </h2>
            <p id="delve-reservation-description">
              Review your configuration and leave your details. No account
              required.
            </p>
          </div>
          <div className={shared.orderPreview}>
            <div className={styles.previewArt}>
              <Image
                src={art.src}
                alt={art.alt}
                fill
                sizes="(max-width: 700px) 100vw, 720px"
              />
              <span>
                {quote ? "SPECIALIST EXPEDITION" : "YOUR DELVE EXPEDITION"}
              </span>
            </div>
            <div className={shared.previewTop}>
              <div>
                <span>YOUR ORDER</span>
                <strong>
                  {title}
                  {!quote && (
                    <small>
                      {" "}
                      × {config.runs} {config.runs === 1 ? "run" : "runs"}
                    </small>
                  )}
                </strong>
              </div>
              <div className={shared.previewPrice}>
                <span>{quote ? "PRICE TO CONFIRM" : "ESTIMATED TOTAL"}</span>
                <strong>
                  {quote ? "Custom quote" : gold(price.total)}
                  {!quote && <small> GOLD</small>}
                </strong>
              </div>
            </div>
            <details
              className={styles.orderDetails}
              open={detailsOpen}
              onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
            >
              <summary>
                {detailsOpen ? "Hide order details" : "View order details"}{" "}
                <span>{detailsOpen ? "−" : "+"}</span>
              </summary>
              <div className={shared.previewDetails}>
                {[
                  ["Class", config.playerClass],
                  ["Mode", "Self-play"],
                  ["Region", config.region],
                  [
                    "Service",
                    quote
                      ? "Specialist enquiry"
                      : config.format === "bountiful"
                        ? "Bountiful Delves"
                        : "Weekly Vault clears",
                  ],
                  [
                    "Coffer Keys",
                    !quote && config.format === "bountiful"
                      ? `${config.runs} of your own`
                      : "Not required",
                  ],
                  ["Payment", "In-game gold"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className={shared.previewDungeons}>
                <span>DESTINATION</span>
                <div>
                  <strong>{quote ? title : delveName(config.delveId)}</strong>
                  {!quote && <span>×{config.runs}</span>}
                </div>
              </div>
            </details>
            <p className={shared.priceNote}>
              Final scope, price and availability are confirmed before the run.
              {!quote && config.format === "bountiful"
                ? " Bountiful rotation and eligibility are checked in-game."
                : ""}
            </p>
          </div>
          <form onSubmit={submit} aria-busy={busy}>
            <fieldset disabled={busy} className={styles.fieldset}>
              <div className={shared.formHeading}>
                <span>01</span>
                <h3>Contact & character details</h3>
              </div>
              <div className={shared.formGrid}>
                {[
                  ["battleTag", "BattleTag", "Player#1234"],
                  ["discord", "Discord username", "@username"],
                  ["character", "Character name", "Your character"],
                  ["realm", "Realm", "Tarren Mill"],
                ].map(([name, label, placeholder]) => (
                  <label key={name}>
                    <span>{label} *</span>
                    <input
                      name={name}
                      aria-label={label}
                      required
                      maxLength={80}
                      minLength={name === "discord" ? 2 : 1}
                      autoComplete="off"
                      placeholder={placeholder}
                      pattern={
                        name === "battleTag"
                          ? "[^\\s#]{2,50}#[0-9]{3,12}"
                          : undefined
                      }
                    />
                  </label>
                ))}
              </div>
              <div className={shared.formHeading}>
                <span>02</span>
                <h3>Preferred start time</h3>
              </div>
              <p className={shared.formHint}>
                Tell us when you would like to start. We’ll confirm the exact
                time on Discord.
              </p>
              <div className={shared.scheduleOptions}>
                <button
                  type="button"
                  className={
                    exact ? shared.scheduleActive : shared.scheduleButton
                  }
                  aria-pressed={exact}
                  onClick={() => setExact(true)}
                >
                  Choose date & time
                </button>
                <button
                  type="button"
                  className={
                    !exact ? shared.scheduleActive : shared.scheduleButton
                  }
                  aria-pressed={!exact}
                  onClick={() => setExact(false)}
                >
                  Flexible time
                </button>
              </div>
              <div className={shared.formGrid}>
                {exact && (
                  <>
                    <div className={shared.dateField}>
                      <span>Preferred Date *</span>
                      <DatePicker
                        value={date}
                        onChange={setDate}
                        disabled={busy}
                      />
                    </div>
                    <div className={shared.dateField}>
                      <span>Preferred Time *</span>
                      <TimePicker
                        value={time}
                        onChange={setTime}
                        disabled={busy}
                      />
                    </div>
                  </>
                )}
                <label className={shared.full}>
                  <span>Your Time Zone *</span>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    required
                  >
                    {!timezones.includes(timezone) && (
                      <option value={timezone}>
                        {timezone.replaceAll("_", " ")}
                      </option>
                    )}
                    {timezones.map((t) => (
                      <option value={t} key={t}>
                        {t.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!exact && (
                <p className={shared.flexibleNote}>
                  No problem! We’ll arrange a suitable time with you on Discord.
                </p>
              )}
              <div className={shared.formHeading}>
                <span>03</span>
                <h3>{quote ? "Your objective" : "Additional notes"}</h3>
              </div>
              <div className={shared.formGrid}>
                <label className={shared.full}>
                  <span>
                    {quote ? "Your exact objective *" : "Comment (optional)"}
                  </span>
                  <textarea
                    name="comment"
                    rows={3}
                    maxLength={700}
                    required={quote}
                    placeholder={
                      quote
                        ? "Which wing, difficulty or encounter would you like help with?"
                        : "Anything we should know about your run?"
                    }
                  />
                </label>
                <label className={shared.honeypot} aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
                {!quote && config.format === "bountiful" && (
                  <label className={shared.full}>
                    <span>Your Restored Coffer Keys *</span>
                    <input
                      aria-label="Restored Coffer Keys"
                      type="number"
                      min={config.runs}
                      max={1000}
                      required
                      value={keys}
                      onChange={(e) => setKeys(Number(e.target.value))}
                    />
                  </label>
                )}
              </div>
              <div className={styles.requirements}>
                {!quote && (
                  <label>
                    <input type="checkbox" name="tierUnlocked" required />
                    <span>
                      I have access to Tier {config.tier} on this character.
                    </span>
                  </label>
                )}
                <label>
                  <input type="checkbox" required />
                  <span>
                    I understand this is a self-play request. Specific loot and
                    an instant start are not guaranteed. Payment is arranged
                    in-game after confirmation.
                  </span>
                </label>
              </div>
              <div className={shared.actions}>
                <button
                  type="button"
                  className={shared.cancel}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className={shared.submit}>
                  {busy
                    ? "Sending order..."
                    : quote
                      ? "Send quote request"
                      : "Submit Reservation"}
                  {!busy && <span aria-hidden="true">→</span>}
                </button>
              </div>
            </fieldset>
            {error && (
              <div className={shared.error} role="alert">
                {error}
              </div>
            )}
            <p className={shared.notice}>
              No payment is collected on this website. Submission is a
              reservation request, not a confirmed run.
            </p>
          </form>
        </>
      )}
    </dialog>
  );
}
