"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import {
  BOOKING_ANALYTICS_EVENT, sendBookingEvent, validWebsiteId,
  type BookingTracker,
} from "@/lib/bookingAnalytics";

declare global { interface Window { umami?: BookingTracker } }

export default function BookingAnalytics({ websiteId, hostname }: { websiteId?: string; hostname: string }) {
  const queue = useRef<unknown[]>([]);
  const enabled = validWebsiteId(websiteId);
  const flush = useCallback(() => {
    if (!websiteId || !window.umami) return;
    const tracker = window.umami;
    queue.current.splice(0).forEach((event) => sendBookingEvent(tracker, event, websiteId, hostname));
  }, [websiteId, hostname]);
  useEffect(() => {
    if (!enabled) return;
    if (window.location.hostname !== hostname && window.location.hostname !== `www.${hostname}`) return;
    if (navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    const collect = (event: Event) => {
      if (queue.current.length >= 32) return;
      queue.current.push((event as CustomEvent).detail);
      flush();
    };
    window.addEventListener(BOOKING_ANALYTICS_EVENT, collect);
    return () => {
      window.removeEventListener(BOOKING_ANALYTICS_EVENT, collect);
      queue.current = [];
    };
  }, [enabled, hostname, flush]);
  if (!enabled) return null;
  return <Script
    id="nikoboost-booking-analytics"
    src="https://cloud.umami.is/script.js"
    strategy="afterInteractive"
    data-website-id={websiteId}
    data-auto-track="false"
    data-exclude-search="true"
    data-exclude-hash="true"
    data-do-not-track="true"
    data-domains={`${hostname},www.${hostname}`}
    onReady={flush}
  />;
}
