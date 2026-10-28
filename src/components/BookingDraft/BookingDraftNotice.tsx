"use client";
import styles from "./BookingDraftNotice.module.scss";

type Props = { pending: boolean; saved: boolean; ready: boolean; unavailable: boolean;
  resume: () => void; startOver: () => void };
export default function BookingDraftNotice(draft: Props) {
  if (!draft.ready) return null;
  return (
    <aside className={styles.notice} aria-label="Saved run settings">
      <div>
        <strong>{draft.pending ? "You have saved run settings" : draft.unavailable ? "Browser saving is unavailable" : draft.saved ? "Your run settings are saved" : "Your settings can be saved here"}</strong>
        <p>{draft.unavailable ? "You can still book normally, but your settings may not survive closing this page." : "Saved for 7 days after your last change, only in this browser on this device. Contact details are not saved."}</p>
      </div>
      <div className={styles.actions}>
        {draft.pending && <button type="button" onClick={draft.resume}>Continue setup</button>}
        {(draft.pending || draft.saved) && <button type="button" onClick={draft.startOver}>Start over</button>}
      </div>
    </aside>
  );
}
