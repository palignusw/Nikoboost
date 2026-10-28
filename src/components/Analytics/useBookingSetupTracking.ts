"use client";
import { useCallback, useEffect, useRef } from "react";
import { reportBookingEvent, type BookingService } from "@/lib/bookingAnalytics";

/** Count a start once per mounted configurator, including an explicit draft resume. */
export function useBookingSetupTracking(service: BookingService, active: boolean) {
  const reported = useRef(false);
  const start = useCallback(() => {
    if (reported.current) return;
    reported.current = true;
    reportBookingEvent(service, "setup_started");
  }, [service]);
  useEffect(() => { if (active) start(); }, [active, start]);
  return start;
}
