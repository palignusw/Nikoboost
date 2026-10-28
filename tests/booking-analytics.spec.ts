import { expect, test } from "@playwright/test";
import { bookingEventPayload, sendBookingEvent, type BookingEvent, type BookingEventPayload } from "../src/lib/bookingAnalytics";
import { openReservation } from "./helpers/configurator";
import { mockReceipt, mockDelveReceipt } from "./helpers/receipt";
const id = "12345678-1234-1234-1234-123456789abc";

test("booking analytics sends only allowlisted data and isolates transport failures", async () => {
  const event = { service: "mythic", stage: "sent", battleTag: "Secret#1234", discord: "secret", orderId: "SECRET" };
  expect(bookingEventPayload(event, id, "nikoboost.online")).toEqual({
    website: id, hostname: "nikoboost.online", url: "/", title: "Mythic+ booking", name: "booking_sent", data: { service: "mythic" },
  });
  expect(bookingEventPayload({ service: "delves", stage: "send_failed", error: "SECRET" }, id, "nikoboost.online")?.url).toBe("/delves");
  expect(bookingEventPayload({ service: "mythic", stage: "SECRET" }, id, "nikoboost.online")).toBeNull();
  expect(bookingEventPayload({ service: "SECRET", stage: "sent" }, id, "nikoboost.online")).toBeNull();
  expect(bookingEventPayload(event, "", "nikoboost.online")).toBeNull();
  const sent: BookingEventPayload[] = [];
  sendBookingEvent({ track: (data) => sent.push(data) }, event, id, "nikoboost.online");
  expect(sent).toHaveLength(1);
  expect(JSON.stringify(sent)).not.toContain("SECRET");
  expect(() => sendBookingEvent({ track: () => { throw new Error("blocked"); } }, event, id, "nikoboost.online")).not.toThrow();
  sendBookingEvent({ track: () => Promise.reject(new Error("offline")) }, event, id, "nikoboost.online");
  await Promise.resolve();
});

for (const service of ["mythic", "delves"] as const) {
  test(`${service} booking records stages without contacts or duplicate starts`, async ({ page }) => {
    await page.addInitScript(() => {
      const target = window as unknown as { bookingEvents: unknown[] };
      target.bookingEvents = [];
      window.addEventListener("nikoboost:booking-event", (event) => target.bookingEvents.push((event as CustomEvent).detail));
    });
    let requests = 0;
    await page.route("**/api/order", async (route) => {
      requests++;
      if (requests === 1) return route.fulfill({ status: 503, json: { error: "SECRET_RESPONSE" } });
      const total = service === "mythic" ? 80000 : 190000;
      await route.fulfill({ status: 200, json: {
        ok: true, orderId: "SECRET_ORDER", total, ...(service === "delves" ? { quote: false } : {}),
        receipt: service === "mythic" ? mockReceipt("SECRET_ORDER", total) : mockDelveReceipt("SECRET_ORDER", total),
      } });
    });
    if (service === "mythic") await openReservation(page);
    else {
      await page.goto("/delves");
      // Opening the default setup still counts as starting a booking.
      await page.getByRole("button", { name: /Reserve this expedition/ }).click();
    }
    const events = () => page.evaluate(() => (window as unknown as { bookingEvents: BookingEvent[] }).bookingEvents);
    await expect.poll(events).toEqual([{ service, stage: "setup_started" }, { service, stage: "form_opened" }]);
    const modal = page.getByRole("dialog");
    const submit = modal.getByRole("button", { name: /Submit Reservation/ });
    await submit.click();
    expect(requests).toBe(0);
    expect(await events()).toHaveLength(2);
    await modal.getByPlaceholder("Player#1234").fill("Secret#1234");
    await modal.getByPlaceholder("@username").fill("secret_discord");
    await modal.getByPlaceholder("Your character").fill("SecretCharacter");
    await modal.getByPlaceholder("Tarren Mill").fill("SecretRealm");
    if (service === "mythic") await modal.getByRole("button", { name: "Flexible time" }).click();
    else {
      await modal.getByRole("checkbox").nth(0).check();
      await modal.getByRole("checkbox").nth(1).check();
    }
    await submit.click();
    await expect.poll(events).toEqual([{ service, stage: "setup_started" }, { service, stage: "form_opened" }, { service, stage: "send_failed" }]);
    await submit.click();
    await expect.poll(events).toEqual([{ service, stage: "setup_started" }, { service, stage: "form_opened" }, { service, stage: "send_failed" }, { service, stage: "sent" }]);
    expect(requests).toBe(2);
    expect(JSON.stringify(await events())).not.toMatch(/secret/i);
  });
}
