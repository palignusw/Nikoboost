import { expect, test } from "@playwright/test";
import { isAllowedOrderOrigin } from "../src/lib/orderRequestSecurity";

test.describe("order origin validation", () => {
  test("accepts both production domains", () => {
    expect(isAllowedOrderOrigin("https://www.nikoboost.online", undefined, true)).toBe(true);
    expect(isAllowedOrderOrigin("https://nikoboost.online", undefined, true)).toBe(true);
  });

  test("rejects absent, null, and unrelated origins", () => {
    expect(isAllowedOrderOrigin(null, undefined, true)).toBe(false);
    expect(isAllowedOrderOrigin("null", undefined, true)).toBe(false);
    expect(isAllowedOrderOrigin("https://example.com", undefined, true)).toBe(false);
    expect(isAllowedOrderOrigin("https://www.nikoboost.online.evil.test", undefined, true)).toBe(false);
  });

  test("allows localhost only during development", () => {
    expect(isAllowedOrderOrigin("http://localhost:3000", undefined, false)).toBe(true);
    expect(isAllowedOrderOrigin("http://127.0.0.1:3000", undefined, false)).toBe(true);
    expect(isAllowedOrderOrigin("http://localhost:3000", undefined, true)).toBe(false);
  });

  test("supports an explicitly configured preview origin", () => {
    expect(
      isAllowedOrderOrigin(
        "https://nikoboost-preview.vercel.app",
        "https://nikoboost-preview.vercel.app/path",
        true
      )
    ).toBe(true);
  });

  test("fails closed on invalid SITE_URL", () => {
    expect(() => isAllowedOrderOrigin("https://www.nikoboost.online", "not-a-url", true)).toThrow();
    expect(() => isAllowedOrderOrigin("https://www.nikoboost.online", "javascript:alert(1)", true)).toThrow();
  });
});
