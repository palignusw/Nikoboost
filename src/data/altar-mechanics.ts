import type { AltarBossId } from "./altar-study";

/** Audit of the Altar teaching scenes, 25 October 2026. Unknowns stay explicit. */
export const altarMechanics: Record<
  AltarBossId,
  {
    checked: readonly string[];
    limits: string;
    sources: readonly { label: string; url: string }[];
  }
> = {
  ravi: {
    checked: [
      "Before zero energy, make a pile without Fresh Meat the nearest pile. Break the eating-phase absorb shield.",
      "Catch every Messy Eater impact; an uncaught chunk adds Carrion Burst. The highlighted impact is an example, not a spawn count.",
      "Feeding Frenzy no longer accelerates Messy Eater or Carrion Burst after Blizzard’s August 21 hotfix.",
      "Also spread for Triple Shot, dodge Regurgitate and falling stalactites, and mitigate Hydrastrike. These are outside this animation.",
    ],
    limits:
      "The number of simultaneous Messy Eater impacts and their cadence are unverified. No fixed number of soakers is prescribed. Shield strength and break time are illustrative.",
    sources: [
      {
        label: "Messy Eater · spell 1306345",
        url: "https://www.wowhead.com/spell=1306345/messy-eater",
      },
      {
        label: "Blizzard · August 21 adjustments",
        url: "https://us.forums.blizzard.com/en/wow/t/altar-of-fangs-adjustments-august-21/2339724",
      },
      {
        label: "Tactyks · encounter execution",
        url: "https://www.method.gg/guides/dungeons/altar-of-fangs",
      },
    ],
  },
  "writhing-coil": {
    checked: [
      "Cover three consecutive Toxic Atrophy casts with an interrupt rotation and a backup.",
      "All attached players move 10 yards farther to trigger Uncoil; this is movement, not a normal kick on Death Rattle.",
      "Five split adds can be controlled. Keep fixates away from melee contact and cover their casts while cleaving.",
      "Assimilation reforms the boss. Undermining is a separate ground hazard; the removed five-ray diagram was not a verified telegraph.",
      "Also handle Burrowing Charge → Venom Jet, Tail Scythe and Synchronized Venom. These are outside this animation.",
    ],
    limits:
      "Split-phase length is compressed, not a live countdown. Guides and journal variants disagree about its exact duration and hazard presentation; no fixed reform rays are asserted. One add per player is only an example assignment.",
    sources: [
      {
        label: "Vine Grip · current spell",
        url: "https://www.wowhead.com/spell=1300328/vine-grip",
      },
      {
        label: "Undermining · current spell",
        url: "https://www.wowhead.com/spell=1305390/undermining",
      },
      {
        label: "Petko · encounter priorities",
        url: "https://www.icy-veins.com/wow/altar-of-fangs-dungeon-guide",
      },
    ],
  },
  zuljan: {
    checked: [
      "Assign and intercept all four Ritual of the Fang beams. Track the Ritual Venom debuff they apply.",
      "Boneslicer hits a path and applies a 7-second physical bleed. Bloodletting removes venom applications and leaves damaging blood.",
      "The clear can continue during the bleed. Stay at the planned edge while blood is dropping; check stacks before returning.",
      "The tank also mitigates Chop Down. Avoid Axegrinder unless a deliberate, coordinated alternative clear is required; neither attack is animated here.",
    ],
    limits:
      "The chosen P5 target, shared stack, travel time, corridor width and blood footprints are schematic. The scene does not calculate venom stacks or reproduce every pool; four drawn footprints do not mean four total pools.",
    sources: [
      {
        label: "Boneslicer · current spell",
        url: "https://www.wowhead.com/spell=1301413/boneslicer",
      },
      {
        label: "Encounter journal · Bloodletting",
        url: "https://www.wowhead.com/guide/midnight/altar-of-fangs-dungeon-overview-location-rewards",
      },
      {
        label: "Petko · venom clearing",
        url: "https://www.icy-veins.com/wow/altar-of-fangs-dungeon-guide",
      },
    ],
  },
};
