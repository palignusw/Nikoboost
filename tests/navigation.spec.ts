import { test, expect } from "@playwright/test";

test("navigation prioritizes services and tools, highlights the page and books the current service", async ({
  page,
}, info) => {
  await page.goto("/delves");
  const mobile = info.project.name.includes("Mobile");
  const nav = page.getByRole("navigation", {
    name: mobile ? "Mobile navigation" : "Main navigation",
    exact: true,
  });
  if (mobile)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  if (mobile) {
    await expect(nav).toHaveCSS("opacity", "1");
    await expect(nav).toHaveCSS("background-color", "rgb(11, 14, 20)");
  }
  await expect(nav.getByRole("link")).toHaveText(
    mobile
      ? [
          "Mythic+↗",
          "Delves↗",
          "Rewards & Tools↗",
          "Gold Prices↗",
          "How it works↗",
          "FAQ↗",
          "Configure your Delves→",
        ]
      : [
          "Mythic+",
          "Delves",
          "Rewards & Tools",
          "Gold Prices",
          "How it works",
          "FAQ",
        ],
  );
  await expect(nav.getByRole("link", { name: /^Delves/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  if (mobile) {
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Open menu", exact: true }),
    ).toBeFocused();
    await expect(nav).not.toBeVisible();
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  }
  await nav.getByRole("link", { name: /Rewards & Tools/ }).click();
  await expect(page).toHaveURL(/mythic-plus-rewards/);
  if (mobile)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(
    nav.getByRole("link", { name: /Rewards & Tools/ }),
  ).toHaveAttribute("aria-current", "page");
  if (mobile) await page.keyboard.press("Escape");
  await page.goto("/delves");
  await page.getByRole("link", { name: /Book Delves/ }).click();
  await expect(page).toHaveURL(/#delve-builder$/);
  await expect(page.locator("#delve-builder")).toBeInViewport();
});
