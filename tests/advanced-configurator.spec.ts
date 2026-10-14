
import {
  test,
  expect,
  type Page,
} from "@playwright/test";

// NikoBoost advanced configurator tests.
// No real orders are submitted.

async function openConfigurator(page: Page) {
  await page.goto("/");

  await page.getByRole("link", {
    name: /Build Your Run/i,
  }).click();

  await expect(page).toHaveURL(/#mythic$/);
}

async function nextStep(page: Page) {
  await page.getByRole("button", {
    name: /Continue/i,
  }).click();
}

async function openDungeons(
  page: Page,
  options?: {
    runs?: 1 | 4 | 8;
    playerClass?: string;
  }
) {
  await openConfigurator(page);

  if (options?.runs && options.runs !== 1) {
    await page
      .locator('[class*="quickRuns"]')
      .getByRole("button", {
        name: new RegExp(
          `^${options.runs}\\s*RUNS$`,
          "i"
        ),
      })
      .click();
  }

  await nextStep(page);

  if (options?.playerClass) {
    await page.getByRole("button", {
      name: `Select ${options.playerClass}`,
    }).click();
  }

  await nextStep(page);

  await expect(
    page.getByRole("button", {
      name: "Add one Altar of Fangs run",
    })
  ).toHaveCount(0);
}

async function enableSpecificDungeons(page: Page) {
  await page.getByText("Specific dungeons", {
    exact: true,
  }).first().click();

  await expect(
    page.getByRole("progressbar", {
      name: "Specific dungeon runs assigned",
    })
  ).toBeVisible();
}

async function addDungeon(
  page: Page,
  dungeon: string,
  count: number
) {
  const button = page.getByRole("button", {
    name: `Add one ${dungeon} run`,
  });

  for (let i = 0; i < count; i++) {
    await button.click();
  }
}

async function expectTotal(
  page: Page,
  expected: number
) {
  const formatted = expected.toLocaleString("en-US");

  await expect(
    page.getByTestId("order-total")
  ).toHaveText(
    new RegExp(`^${formatted}\\s*GOLD$`)
  );
}

function traderButton(page: Page, amount: number) {
  const traders = page.locator('[class*="traders"]')
    .first();

  return traders.getByRole("button", {
    name: amount === 0
      ? /None/i
      : new RegExp(`^\\+${amount}\\b`),
  });
}

test.describe("NikoBoost advanced configurator", () => {
  test("Cannot allocate more dungeon runs than ordered", async ({
    page,
  }) => {
    await openDungeons(page, { runs: 4 });
    await enableSpecificDungeons(page);

    await addDungeon(page, "Altar of Fangs", 4);

    const progress = page.getByRole("progressbar", {
      name: "Specific dungeon runs assigned",
    });

    await expect(progress).toHaveAttribute(
      "aria-valuenow",
      "4"
    );

    await expect(progress).toHaveAttribute(
      "aria-valuemax",
      "4"
    );

    await expect(
      page.getByText("✓ ALL RUNS ASSIGNED")
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: "Add one Murder Row run",
      })
    ).toBeDisabled();

    // 4 runs +10 = 320,000
    // Specific dungeons +10% = 32,000
    // Package discount -5% = 17,600
    // Total = 334,400
    await expectTotal(page, 334_400);
  });

  test("Can distribute four runs between two dungeons", async ({
    page,
  }) => {
    await openDungeons(page, { runs: 4 });
    await enableSpecificDungeons(page);

    await addDungeon(page, "Altar of Fangs", 2);
    await addDungeon(page, "Murder Row", 2);

    const progress = page.getByRole("progressbar", {
      name: "Specific dungeon runs assigned",
    });

    await expect(progress).toHaveAttribute(
      "aria-valuenow",
      "4"
    );

    await expect(
      page.getByText("✓ ALL RUNS ASSIGNED")
    ).toBeVisible();

    await expectTotal(page, 334_400);
  });

  test("Specific surcharge applies only to assigned runs", async ({
    page,
  }) => {
    await openDungeons(page, { runs: 4 });
    await enableSpecificDungeons(page);

    await addDungeon(page, "Altar of Fangs", 2);

    const progress = page.getByRole("progressbar", {
      name: "Specific dungeon runs assigned",
    });

    await expect(progress).toHaveAttribute(
      "aria-valuenow",
      "2"
    );

    // 4 runs = 320,000
    // 2 specific runs = +16,000
    // 5% discount on 336,000 = 16,800
    // Total = 319,200
    await expectTotal(page, 319_200);
  });

  test("Switching back to Any dungeon resets allocation", async ({
    page,
  }) => {
    await openDungeons(page, { runs: 4 });
    await enableSpecificDungeons(page);

    await addDungeon(page, "Altar of Fangs", 2);

    await expectTotal(page, 319_200);

    await page.getByText("Any dungeon", {
      exact: true,
    }).first().click();

    await expect(
      page.getByRole("progressbar", {
        name: "Specific dungeon runs assigned",
      })
    ).toHaveCount(0);

    await expectTotal(page, 304_000);
  });

  test("Rogue allows four loot traders", async ({
    page,
  }) => {
    await openDungeons(page, {
      playerClass: "Rogue",
    });

    const four = traderButton(page, 4);

    await expect(four).toBeEnabled();
    await four.click();

    await expect(four).toHaveClass(/activeTrader/);

    // +10 run: 80,000
    // Four traders: +45%
    // Total: 116,000
    await expectTotal(page, 116_000);
  });

  test("Mage cannot select four loot traders", async ({
    page,
  }) => {
    await openDungeons(page, {
      playerClass: "Mage",
    });

    const three = traderButton(page, 3);
    const four = traderButton(page, 4);

    await expect(three).toBeEnabled();
    await expect(four).toBeDisabled();

    await three.click();

    await expectTotal(page, 108_000);
  });

  test("Region selection switches from EU to NA", async ({
    page,
  }) => {
    await openDungeons(page);

    const regionGrid = page.locator(
      '[class*="regionGrid"]'
    );

    const eu = regionGrid.getByRole("button", {
      name: "EU",
      exact: true,
    });

    const na = regionGrid.getByRole("button", {
      name: "NA",
      exact: true,
    });

    await expect(eu).toHaveClass(/activeOption/);

    await na.click();

    await expect(na).toHaveClass(/activeOption/);
    await expect(eu).not.toHaveClass(/activeOption/);

    // Currently both regions use the same basePrices.
    await expectTotal(page, 80_000);
  });
});
