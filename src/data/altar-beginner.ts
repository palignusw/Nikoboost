import type { AltarBossId } from "./altar-study";
export type LearnerRole = "damage" | "tank" | "healer";
export type BeginnerMechanic = {
  id: string;
  name: string;
  response:
    "SOAK" | "DODGE" | "SPREAD" | "INTERRUPT" | "MOVE" | "DEFEND" | "DAMAGE";
  see: string;
  action: string;
  done: string;
  avoid: string;
  role: Record<LearnerRole, string>;
  source: string;
};
const spell = (id: number) => `https://www.wowhead.com/spell=${id}`;
const journal =
  "https://www.wowhead.com/guide/midnight/altar-of-fangs-dungeon-overview-location-rewards";
export const beginnerMechanics: Record<
  AltarBossId,
  readonly BeginnerMechanic[]
> = {
  ravi: [
    {
      id: "piles",
      name: "Fresh Meat → Ssscavenging",
      response: "MOVE",
      see: "Ravenous Stomp drops meat onto bone piles; the boss is approaching zero energy.",
      action:
        "Find a pile without fresh meat. The tank makes it the nearest pile before the boss starts eating.",
      done: "The boss feeds at the chosen empty pile. Start breaking its shield.",
      avoid:
        "Do not choose a pile once and assume it stays safe after later Stomps.",
      role: {
        tank: "Reposition early. Keep meat-filled piles farther away.",
        healer: "Prepare healing for the eating phase.",
        damage: "Keep useful damage available for the incoming shield.",
      },
      source: spell(1298226),
    },
    {
      id: "chunks",
      name: "Messy Eater + absorb shield",
      response: "SOAK",
      see: "The boss is eating behind a shield and meat-impact circles appear.",
      action:
        "Step into an uncovered meat-impact circle before the chunk lands. Keep attacking the shield.",
      done: "Your chunk lands while covered. Keep watching for more impacts until the shield breaks.",
      avoid:
        "Soaking prevents extra group damage; your attacks break the shield. These are two separate jobs.",
      role: {
        tank: "Hold the feeding position and contribute shield damage.",
        healer:
          "Heal through the channel and cover an accessible impact when needed.",
        damage: "Cover uncovered impacts while damaging the shield.",
      },
      source: spell(1306345),
    },
    {
      id: "stomp",
      name: "Ravenous Stomp",
      response: "DODGE",
      see: "Ravenous Stomp casts, followed by falling-rock ground markers.",
      action:
        "Leave the falling-rock markers. After they land, check which piles received meat.",
      done: "The impacts have resolved and you are outside the dangerous ground.",
      avoid:
        "The group-wide hit and avoidable rock impacts are separate; moving does not remove the group hit.",
      role: {
        tank: "Check the piles and prepare the next feeding position.",
        healer: "Have the group healthy before the Stomp lands.",
        damage: "Move out of rock markers before returning to damage.",
      },
      source: spell(1307894),
    },
    {
      id: "shots",
      name: "Triple Shot",
      response: "SPREAD",
      see: "You or nearby players have Triple Shot.",
      action:
        "Leave space between players so the damage around a target does not hit allies.",
      done: "The effect on you has ended. Until then, keep your space.",
      avoid:
        "Do not run your effect through the group to reach another mechanic.",
      role: {
        tank: "Give affected players room without feeding the wrong pile.",
        healer: "Watch affected players, especially during other group damage.",
        damage: "Keep your own area away from allies while attacking.",
      },
      source: spell(1297876),
    },
    {
      id: "waves",
      name: "Regurgitate",
      response: "DODGE",
      see: "Rav’i aims Regurgitate and sends acid waves toward a player.",
      action:
        "Move sideways out of the wave paths and stay out for the whole sequence.",
      done: "All waves have passed. If hit, ask for a disease dispel.",
      avoid:
        "Do not wait for a kick to save you; moving out is the default response.",
      role: {
        tank: "Dodge without leading the boss toward fresh meat.",
        healer: "Disease-dispel a hit player if your class can.",
        damage: "Sidestep the paths; getting hit also reduces your damage.",
      },
      source: spell(1296058),
    },
    {
      id: "hydra",
      name: "Hydrastrike",
      response: "DEFEND",
      see: "The boss uses Hydrastrike on its current target.",
      action: "The tank uses active mitigation for the physical hits.",
      done: "The attack sequence has resolved and the tank is stable.",
      avoid:
        "This is not a group soak. Other players keep handling their own mechanics.",
      role: {
        tank: "Have mitigation active before the hits.",
        healer: "Watch the tank during the hits.",
        damage: "Keep handling your mechanics and shield damage.",
      },
      source: spell(1298683),
    },
  ],
  "writhing-coil": [
    {
      id: "kicks",
      name: "Toxic Barrage → Toxic Atrophy",
      response: "INTERRUPT",
      see: "Toxic Barrage starts a sequence of three Toxic Atrophy casts.",
      action:
        "Use the agreed first, second and third interrupts. A backup covers a missed assignment.",
      done: "All three casts in the sequence have been stopped.",
      avoid:
        "Do not spend two interrupts on the same cast; one interrupt does not finish the sequence.",
      role: {
        tank: "Take your assigned cast or stay ready as backup.",
        healer: "Use an assigned interrupt only if your class has one.",
        damage:
          "Interrupt your assigned cast, then leave the next for its owner.",
      },
      source: spell(1310357),
    },
    {
      id: "links",
      name: "Death Rattle + Vine Grip",
      response: "MOVE",
      see: "Death Rattle starts and vines attach players to the boss.",
      action:
        "Everyone attached moves away from the boss to break their own vine. Use movement abilities if needed.",
      done: "All attached players have pulled far enough and the boss splits. Your own break alone is not the end.",
      avoid:
        "Do not return toward the group while your vine is still attached.",
      role: {
        tank: "Move outward too; do not stand still to hold the boss.",
        healer: "Move while covering the increasing group damage.",
        damage: "Prioritise breaking your vine over finishing a cast.",
      },
      source: spell(1300328),
    },
    {
      id: "split",
      name: "Uncoil: five adds",
      response: "DAMAGE",
      see: "The boss separates into five Uncoiled Writhes; adds fixate players.",
      action:
        "Bring them into a shared damage area, control approaching adds and interrupt their Toxic Atrophy casts.",
      done: "The split phase ends and the boss reforms. Damage to the adds carries over.",
      avoid:
        "Do not let a fixated add reach you just to keep it stacked; use control and keep space.",
      role: {
        tank: "Help group the adds; taunts are not the whole fixate plan.",
        healer: "Keep the party stable while moving and helping with control.",
        damage: "Damage the grouped adds and keep interrupt coverage.",
      },
      source: journal,
    },
    {
      id: "charge",
      name: "Burrowing Charge → Venom Jet",
      response: "DODGE",
      see: "Vindictive Onslaught aims a charge line, followed by a frontal spray.",
      action:
        "Leave the charge path. Then move out of the follow-up Venom Jet cone as well.",
      done: "Both attacks have resolved and you are outside their areas.",
      avoid: "Do not stop watching after dodging only the charge.",
      role: {
        tank: "Keep the aimed attacks away from allies when possible.",
        healer: "Move first; continue healing from clear ground.",
        damage: "Sidestep the line and then the cone, even if it costs a cast.",
      },
      source: spell(1300083),
    },
    {
      id: "rot",
      name: "Synchronized Venom",
      response: "DEFEND",
      see: "The party receives the Synchronized Venom damage-over-time effect.",
      action:
        "The healer sustains the party; use an appropriate personal defensive for dangerous overlaps.",
      done: "The debuff ends. Keep following other movement mechanics while it ticks.",
      avoid:
        "Do not treat sustained damage as permission to stand in avoidable attacks.",
      role: {
        tank: "Keep mitigation available for tank hits during the effect.",
        healer: "Plan sustained healing rather than only a single burst.",
        damage:
          "Use a defensive when health or overlapping mechanics demand it.",
      },
      source: journal,
    },
    {
      id: "tail",
      name: "Tail Scythe",
      response: "DEFEND",
      see: "The boss attacks the tank with Tail Scythe.",
      action: "The tank has active mitigation ready for the physical hit.",
      done: "The hit has resolved and tank health is stable.",
      avoid: "Other players do not move into the attack to help soak it.",
      role: {
        tank: "Prepare mitigation for the hit.",
        healer: "Watch the tank around the hit.",
        damage: "Continue your assigned interrupts and positioning.",
      },
      source: spell(1298949),
    },
    {
      id: "reform",
      name: "Assimilation + ground hazards",
      response: "MOVE",
      see: "The adds begin converging and dangerous ground effects appear.",
      action: "Move clear of the convergence and visible hazard areas.",
      done: "The boss has reformed and your position is clear.",
      avoid:
        "Use the game’s actual telegraphs, not an assumed five-ray pattern or a timer from this scene.",
      role: {
        tank: "Pick the boss back up from clear ground.",
        healer: "Move clear and stabilise the party.",
        damage: "Stop chasing adds through dangerous ground.",
      },
      source: spell(1305390),
    },
  ],
  zuljan: [
    {
      id: "beams",
      name: "Ritual of the Fang",
      response: "SOAK",
      see: "Snake heads direct four beams toward Zul’jan.",
      action:
        "Assigned players stand between each head and the boss, blocking all four beams for the channel.",
      done: "The channel ends. Check Ritual Venom next; soaking is not the whole mechanic.",
      avoid:
        "Do not leave your beam early or move to somebody else’s already covered lane.",
      role: {
        tank: "Keep the boss positioned and respect the agreed beam assignments.",
        healer: "Plan healing for beam damage; cover your lane if assigned.",
        damage:
          "Enter your assigned beam before it reaches the boss and hold it.",
      },
      source: spell(1300876),
    },
    {
      id: "clear",
      name: "Ritual Venom → Boneslicer",
      response: "SOAK",
      see: "You have Ritual Venom after beams and the agreed Boneslicer clear is approaching.",
      action:
        "Join the agreed line near the edge. Take the planned Boneslicer with healing ready; it hits players in its path.",
      done: "The hit and bleed have cleared your venom. Confirm the debuff is gone before returning.",
      avoid:
        "Do not let venom expire, chase random axes, or assume the first hit instantly removes every stack.",
      role: {
        tank: "Coordinate clear space without moving the boss through blood.",
        healer: "Prepare for the clear hit and subsequent bleed.",
        damage: "Join the clear line on time; keep blood away from the middle.",
      },
      source: spell(1301413),
    },
    {
      id: "blood",
      name: "Bloodletting pools",
      response: "MOVE",
      see: "Blood appears as Ritual Venom applications are removed.",
      action:
        "Step out of fresh blood into clear ground near the edge while the clear continues.",
      done: "Venom is gone and you are outside the remaining pools.",
      avoid:
        "Do not stand in blood, and do not drag ongoing blood drops through the centre or beam lanes.",
      role: {
        tank: "Keep the next boss position clear of pools.",
        healer: "Keep clear of pools while healing the bleed.",
        damage:
          "Move off each fresh pool; check the venom debuff before resetting.",
      },
      source: spell(1301230),
    },
    {
      id: "axes",
      name: "Axegrinder",
      response: "DODGE",
      see: "Spinning axes travel and bounce through the arena.",
      action:
        "Move out of their paths and continue watching where they bounce.",
      done: "You have a clear position and no approaching axe path crosses it.",
      avoid:
        "This guide uses a planned Boneslicer clear; do not improvise an axe soak as a beginner.",
      role: {
        tank: "Move to clear ground without disrupting the next beam plan.",
        healer: "Heal from a clear position; keep watching moving axes.",
        damage: "Watch the axes while attacking instead of chasing them.",
      },
      source: journal,
    },
    {
      id: "chop",
      name: "Chop Down",
      response: "DEFEND",
      see: "Zul’jan prepares Chop Down on the tank.",
      action: "The tank mitigates the two physical strikes.",
      done: "Both strikes have resolved and the tank is stable.",
      avoid:
        "If the tank has venom, its removal can also leave blood. Do not ignore the ground beneath you.",
      role: {
        tank: "Use mitigation before the strikes and watch any blood left behind.",
        healer: "Support the tank through both hits.",
        damage: "Keep handling your own beams, venom and axes.",
      },
      source: spell(1301353),
    },
  ],
};
/** Maps the authored scene to an observable mechanic; never implies a full rotation. */
export function getBeginnerPrompt(boss: AltarBossId, cueId: string) {
  if (["recover", "reset"].includes(cueId)) return null;
  const id =
    boss === "ravi"
      ? cueId === "stomp"
        ? "stomp"
        : ["read", "position"].includes(cueId)
          ? "piles"
          : "chunks"
      : boss === "writhing-coil"
        ? /^(kick|stop|kicks)/.test(cueId)
          ? "kicks"
          : cueId === "tethers"
            ? "links"
            : ["reform", "reset"].includes(cueId)
              ? "reform"
              : "split"
        : cueId.startsWith("ritual-")
          ? "beams"
          : ["blood", "clean"].includes(cueId)
            ? "blood"
            : "clear";
  return beginnerMechanics[boss].find((m) => m.id === id)!;
}
