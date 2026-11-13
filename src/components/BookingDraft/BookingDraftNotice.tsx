"use client";
import styles from "./BookingDraftNotice.module.scss";

type Props = { restored: boolean; saved: boolean; ready: boolean; unavailable: boolean;
  startOver: () => void };
export default function BookingDraftNotice(draft: Props) {
  if (!draft.ready) return null;
  return (
    <aside className={styles.notice} aria-label="Saved run settings">
      <div>
        <strong>{draft.unavailable ? "Browser saving is unavailable" : draft.saved ? (draft.restored ? "Your saved settings were restored" : "Your run settings are saved") : "Your settings can be saved here"}</strong>
        <p>{draft.unavailable ? "You can still book normally, but your settings may not survive closing this page." : "Saved for 7 days after your last change, only in this browser on this device. Contact details are not saved."}</p>
      </div>
      <div className={styles.actions}>
        {draft.saved && <button type="button" onClick={draft.startOver}>Start over</button>}
      </div>
    </aside>
  );
}
