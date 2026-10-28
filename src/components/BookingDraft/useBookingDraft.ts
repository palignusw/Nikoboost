"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { draftKey, encodeBookingDraft, readBookingDraft } from "@/lib/bookingDrafts";

const CHANGE = "nikoboost:booking-draft-change";
const UNAVAILABLE = "storage-unavailable";
const failedWrites = new Set<string>();
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE, listener);
  };
}
const serverSnapshot = () => undefined;

export function useBookingDraft<T>({ service, value, dirty, parse, restore, reset }: {
  service: "mythic" | "delves"; value: T; dirty: boolean;
  parse: (value: unknown) => T | null; restore: (value: T) => void; reset: () => void;
}) {
  const key = draftKey(service);
  const snapshot = useCallback(() => {
    try { return failedWrites.has(key) ? UNAVAILABLE : localStorage.getItem(key) ?? ""; } catch { return UNAVAILABLE; }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState<T | null>(null);
  if (raw !== undefined && !checked) {
    setPending(readBookingDraft(raw, parse));
    setChecked(true);
  }
  const serialized = JSON.stringify(value);
  useEffect(() => {
    if (!checked || pending) return;
    if (!dirty) {
      try {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          window.dispatchEvent(new Event(CHANGE));
        }
      } catch { /* Optional storage. */ }
      return;
    }
    const previous = readBookingDraft(snapshot(), parse);
    // Returning or resuming does not extend the seven days without an edit.
    if (previous && JSON.stringify(previous) === serialized) return;
    try {
      const clean = parse(JSON.parse(serialized));
      if (!clean) return;
      localStorage.setItem(key, encodeBookingDraft(clean));
      failedWrites.delete(key);
      window.dispatchEvent(new Event(CHANGE));
    } catch {
      failedWrites.add(key);
      window.dispatchEvent(new Event(CHANGE));
    }
  }, [checked, pending, dirty, serialized, key, parse, snapshot]);

  function clear() {
    try { localStorage.removeItem(key); failedWrites.delete(key); window.dispatchEvent(new Event(CHANGE)); } catch { /* Optional storage. */ }
  }
  function startOver() { clear(); reset(); setPending(null); }
  function resume() {
    const current = readBookingDraft(snapshot(), parse);
    if (current) restore(current);
    else { clear(); reset(); }
    setPending(null);
  }
  return { pending: !!pending, saved: !!readBookingDraft(raw, parse), ready: checked,
    unavailable: raw === UNAVAILABLE, resume, startOver, clear };
}
