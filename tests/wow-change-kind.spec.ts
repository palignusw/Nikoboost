import { expect, test } from "@playwright/test";
import { classifyWowChange } from "../src/lib/wowChangeKind";

test("change labels distinguish player buffs, nerfs, mixed tuning and fixes conservatively", () => {
  const cases: [string, string | null][] = [
    ["All damage done increased by 5%. Does not affect PvP combat.", "buff"],
    ["Verdancy healing increased by 60%.", "buff"],
    ["Damage taken reduced by 10%.", "buff"],
    ["Damage taken increased by 10%.", "nerf"],
    ["Cooldown reduced to 30 seconds (was 60 seconds).", "buff"],
    ["Mana cost increased by 10%.", "nerf"],
    ["Damage reduction increased by 5%.", "buff"],
    ["Cooldown reduction decreased by 2 seconds.", "nerf"],
    ["All ability damage reduced by 8%.", "nerf"],
    ["Fazed now increases damage by 5% (was 7%).", "nerf"],
    ["Improved Swiftmend increases Swiftmend healing by 40% (was 30%).", "buff"],
    ["Damage increased by 5%. Cooldown increased by 10 seconds.", "balance"],
    ["Damage increased by 5% and cooldown increased by 10 seconds.", "balance"],
    ["Damage increased by 5%. Duration reduced by 10 seconds.", "balance"],
    ["Damage increased by 5% and duration reduced by 10 seconds.", "balance"],
    ["Boss damage increased by 10%.", "balance"],
    ["Absorption increased by 10%.", "buff"],
    ["Duration increased by 10%.", "balance"],
    ["Proc chance increased by 10%.", "balance"],
    ["Fixed an issue that caused healing to be reduced by 10%.", "balance"],
    ["Resolved an issue with target selection.", "fix"],
    ["A bug was fixed in the encounter.", "fix"],
    ["An issue remains under investigation.", null],
    ["Damage is no longer increased by 5%.", "balance"],
    ["New story campaign available.", null],
  ];
  for (const [text, kind] of cases) expect(classifyWowChange(text, "Classes"), text).toBe(kind);
  expect(classifyWowChange("Boss damage increased by 10%.", "Dungeons")).toBe("balance");
  expect(classifyWowChange("Boss damage reduced by 10%.", "Dungeons")).toBe("balance");
  expect(classifyWowChange("Damage increased by 5%.", "Player versus Player")).toBe("buff");
});
