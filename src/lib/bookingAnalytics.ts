/** Only fixed event names and service names are accepted. Never pass form data here. */
export const BOOKING_ANALYTICS_EVENT = "nikoboost:booking-event";
export type BookingService = "mythic" | "delves";
export type BookingStage = "setup_started" | "form_opened" | "sent" | "send_failed";
export type BookingEvent = { service: BookingService; stage: BookingStage };
const stages: readonly BookingStage[] = ["setup_started", "form_opened", "sent", "send_failed"];
export const validWebsiteId = (id: string | undefined): id is string =>
  !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function validEvent(event: unknown): event is BookingEvent {
  if (!event || typeof event !== "object") return false;
  const { service, stage } = event as BookingEvent;
  return (service === "mythic" || service === "delves") && stages.includes(stage);
}

export function reportBookingEvent(service: BookingService, stage: BookingStage) {
  if (typeof window === "undefined" || !validEvent({ service, stage })) return;
  // This internal signal does not persist or send anything by itself.
  try { window.dispatchEvent(new CustomEvent(BOOKING_ANALYTICS_EVENT, { detail: { service, stage } })); }
  catch { /* Analytics must never interrupt a booking. */ }
}

export function bookingEventPayload(event: unknown, websiteId: string, hostname: string) {
  if (!validWebsiteId(websiteId) || !validEvent(event)) return null;
  return {
    website: websiteId,
    hostname,
    url: event.service === "mythic" ? "/" : "/delves",
    title: event.service === "mythic" ? "Mythic+ booking" : "Delves booking",
    name: `booking_${event.stage}`,
    data: { service: event.service },
  };
}
export type BookingEventPayload = NonNullable<ReturnType<typeof bookingEventPayload>>;
export type BookingTracker = { track: (payload: BookingEventPayload) => unknown };
export function sendBookingEvent(tracker: BookingTracker, event: unknown, websiteId: string, hostname: string) {
  const payload = bookingEventPayload(event, websiteId, hostname);
  if (!payload) return;
  try { void Promise.resolve(tracker.track(payload)).catch(() => {}); }
  catch { /* Blocked analytics must never affect the order form. */ }
}
