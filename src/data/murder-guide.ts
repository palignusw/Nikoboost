export type MurderBossId =
  "kystia-manaheart" | "zaen-bladesorrow" | "xathuux" | "lithiel-cinderfury";
export type MurderRole = "tank" | "healer" | "damage";
export type MurderCue = {
  id: string;
  start: number;
  end: number;
  title: string;
  action: string;
  done: string;
  role: Record<MurderRole, string>;
  window?: number;
  source?: string;
};
export type MurderLesson = {
  id: MurderBossId;
  name: string;
  subtitle: string;
  duration: number;
  focus: string;
  cues: MurderCue[];
  failureTime: number;
  mistake: string;
  question: string;
  choices: string[];
  correct: number;
};
export const murderSources = {
  method: "https://www.method.gg/guides/dungeons/murder-row",
  petko: "https://www.icy-veins.com/wow/murder-row-dungeon-guide",
  journal:
    "https://www.wowhead.com/guide/midnight/murder-row-dungeon-overview-location-rewards",
  axe: "https://www.wowhead.com/spell=1214637/axe-toss",
  barrels:
    "https://news.blizzard.com/en-us/article/24307310/hotfixes-october-23-2026",
  imps: "https://news.blizzard.com/en-us/article/24296142/hotfixes-october-6-2026",
};
const roles = (tank: string, healer: string, damage: string) => ({
  tank,
  healer,
  damage,
});
const cue = (
  id: string,
  start: number,
  end: number,
  title: string,
  action: string,
  done: string,
  role: Record<MurderRole, string>,
  window?: number,
  source?: string,
): MurderCue => ({ id, start, end, title, action, done, role, window, source });
export const murderLessons: MurderLesson[] = [
  {
    id: "kystia-manaheart",
    name: "Kystia Manaheart",
    subtitle: "Change target before you spend your damage.",
    duration: 38,
    focus:
      "P3 is the highlighted learner. Five images are shown; their placement is illustrative.",
    failureTime: 16.5,
    mistake: "One image keeps channeling Felstorm.",
    question: "Kystia is shielded and Nibbles is hostile. Your priority?",
    choices: [
      "Spend everything into the shield",
      "Focus Nibbles; save burst for the opening",
      "Ignore both until images spawn",
    ],
    correct: 1,
    cues: [
      cue(
        "focus",
        0,
        5,
        "Felshield · attack Nibbles",
        "Keep the pair together and focus the wyrm.",
        "Nibbles reaches 20% health.",
        roles(
          "Hold both close; aim Nibbles away.",
          "Watch Corroding Spittle for a magic dispel.",
          "Switch your main damage to Nibbles.",
        ),
      ),
      cue(
        "spray",
        5,
        10,
        "Fel Spray · leave the turning cone",
        "Track the direction of the spray and move around its side.",
        "The spray ends.",
        roles(
          "Keep the spray away from allies.",
          "Keep healing while avoiding its path.",
          "Move sideways; do not chase through the cone.",
        ),
      ),
      cue(
        "nova",
        10,
        14,
        "Fel Nova · leave the arrival point",
        "Kystia appears beside a player. Move away from her.",
        "The nova resolves.",
        roles(
          "Move out before rebuilding the stack.",
          "Leave the nova and keep the group stable.",
          "Stop casting if needed to escape.",
        ),
      ),
      cue(
        "images",
        14,
        18,
        "Mirror Images · stop every channel",
        "Assign interrupts or crowd control across the images.",
        "No image is channeling.",
        roles(
          "Use spare stops on an unassigned image.",
          "Dispel Spittle; prepare for overlapping damage.",
          "Stop your assigned image; check the others.",
        ),
      ),
      cue(
        "burst",
        18,
        38,
        "Destabilized · burst and heal",
        "Nibbles assists the party. Spend damage into the vulnerability.",
        "The 20-second effect expires.",
        roles(
          "Help damage while Kystia is stunned.",
          "Cover sustained party damage.",
          "Use offensive cooldowns in this opening.",
        ),
        20,
        murderSources.journal,
      ),
    ],
  },
  {
    id: "zaen-bladesorrow",
    name: "Zaen Bladesorrow",
    subtitle: "Destroy the dangerous freight. Preserve your cover.",
    duration: 24,
    focus:
      "Five separate covers illustrate one per player, not a fixed delivery count. Green sectors are schematic safe zones.",
    failureTime: 14.5,
    mistake: "P3 is behind a barrel but outside its close safe zone.",
    question:
      "A barrel is between you and Zaen, but you are far behind it. Safe?",
    choices: [
      "Yes, any distance behind it works",
      "Share the tank’s barrel",
      "No: move close into your own barrel’s safe zone",
    ],
    correct: 2,
    cues: [
      cue(
        "bomb",
        0,
        6,
        "Fire Bomb · use the marked freight",
        "The marked player isolates the bomb beside fel-infused freight. Keep other cover out of the blast.",
        "The bomb detonates.",
        roles(
          "Keep allies clear of the bomb.",
          "Support the marked player.",
          "If marked, move beside the selected freight.",
        ),
      ),
      cue(
        "freight",
        6,
        11,
        "Freight primed · move away",
        "Leave the triggered freight before it explodes.",
        "The freight explosion finishes.",
        roles(
          "Keep usable cover available.",
          "Prepare for Killing Spree party damage.",
          "Leave the blast; avoid incoming deliveries.",
        ),
      ),
      cue(
        "cover",
        11,
        14,
        "Murder in a Row · find your own cover",
        "Choose a separate barrel and stand close behind it, inside the indicated safe area.",
        "Zaen fires.",
        roles(
          "You need your own cover too.",
          "Do not share another player’s barrel.",
          "Close the distance to your barrel.",
        ),
      ),
      cue(
        "shot",
        14,
        19,
        "Shot resolved · leave the primed barrels",
        "After the shot, move away from the struck barrels.",
        "Their delayed explosions resolve.",
        roles(
          "Leave cover after the shot.",
          "Help a player with a missed-shot bleed.",
          "Do not wait beside an exploding barrel.",
        ),
      ),
      cue(
        "recover",
        19,
        24,
        "Reposition · prepare the next cycle",
        "Find clean ground while the next delivery develops.",
        "A new live cue requires a response.",
        roles(
          "Prepare mitigation for Envenom.",
          "Handle Heartstop Poison and group damage.",
          "Watch where fresh freight lands.",
        ),
      ),
    ],
  },
  {
    id: "xathuux",
    name: "Xathuux the Annihilator",
    subtitle: "Bring the axe in. Keep the floor usable.",
    duration: 26,
    focus:
      "The cone points away from the group. P3 carries the illustrated Axe Toss mark.",
    failureTime: 10.5,
    mistake: "The axe lands far from the boss and keeps pulsing.",
    question: "Axe Toss marks you. Where should the axe land?",
    choices: [
      "Beside the boss, outside its frontal",
      "At the far side of the room",
      "In front of the tank",
    ],
    correct: 0,
    cues: [
      cue(
        "frontal",
        0,
        4,
        "Legion Strike · face away",
        "The tank points the cone outwards. Allies stay at the sides or back.",
        "The frontal resolves.",
        roles(
          "Use mitigation and hold the facing.",
          "Expect the tank’s healing reduction.",
          "Stay out of the tank’s cone.",
        ),
      ),
      cue(
        "axe",
        4,
        9,
        "Axe Toss · bring the mark to melee",
        "Place the axe beside the boss so the group can switch efficiently.",
        "The mark expires and the axe lands.",
        roles(
          "Make room beside the boss.",
          "Prepare for the impact and pulsing damage.",
          "Move the mark beside the boss, not into the frontal.",
        ),
        5,
        murderSources.axe,
      ),
      cue(
        "kill",
        9,
        13,
        "Legion Axe · switch and destroy",
        "Prioritise the axe to stop Fel Lightning.",
        "The axe is destroyed.",
        roles(
          "Keep boss and axe within cleave reach.",
          "Cover damage while the axe survives.",
          "Switch damage to the axe.",
        ),
      ),
      cue(
        "crush",
        13,
        17,
        "Infernal Crush · spread and defend",
        "Leave space between players before the heavy impact.",
        "The hit resolves.",
        roles(
          "Use a defensive for the overlap.",
          "Plan a group healing cooldown.",
          "Do not overlap another player.",
        ),
      ),
      cue(
        "rage",
        17,
        26,
        "Demonic Rage · kite along the edge",
        "The tank advances along the perimeter as Burning Steps pools form.",
        "The rage ends and the group has clean floor.",
        roles(
          "Move steadily; preserve the rest of the room.",
          "Follow on clean ground.",
          "Avoid old pools while damaging the boss.",
        ),
      ),
    ],
  },
  {
    id: "lithiel-cinderfury",
    name: "Lithiel Cinderfury",
    subtitle: "Clear the summons. Cross at the right moment.",
    duration: 24,
    focus:
      "Four non-tank impact markers follow the updated targeting. Imp symbols represent groups, not a total spawn count.",
    failureTime: 19,
    mistake: "P3 walks into the wave instead of using the gateway.",
    question:
      "The wave is expanding and the gate exit is on its safe side. What now?",
    choices: [
      "Run through the ring",
      "Use the gateway while its endpoints are clear",
      "Wait for the Infernal to reach the entrance",
    ],
    correct: 1,
    cues: [
      cue(
        "control",
        0,
        4,
        "Chaos Bolt · interrupt; keep the Infernal away",
        "Maintain a kick rotation. The tank keeps the pursuing Infernal away from the group.",
        "The cast is stopped and the chase lane is clear.",
        roles(
          "Kite the unkillable Infernal.",
          "Watch a missed Chaos Bolt target.",
          "Take your turn in the interrupt rotation.",
        ),
      ),
      cue(
        "fingers",
        4,
        8,
        "Fingers of Gul’dan · give the impacts room",
        "Non-tanks leave space around each marked impact.",
        "The impacts resolve; imps appear.",
        roles(
          "Keep your chase lane separate.",
          "Move your marker without clipping allies.",
          "Spread your impact, then prepare stops.",
        ),
      ),
      cue(
        "adds",
        8,
        12,
        "Summons · clear before the wave",
        "Control the imps and kill the Vilefiend and other killable summons.",
        "The wave cannot empower surviving killable adds.",
        roles(
          "Pick up the Vilefiend; keep kiting the Infernal.",
          "Support the tank through add pressure.",
          "Stop imp casts and finish the killable adds.",
        ),
      ),
      cue(
        "gates",
        12,
        16,
        "Demonic Gateway · prepare, do not rush",
        "Move near the entrance. Check the exit and keep the Infernal away from both ends.",
        "Malefic Wave finishes casting and the exit is safe.",
        roles(
          "Do not drag the Infernal onto a gate.",
          "Check both endpoints before travelling.",
          "Wait for the actual wave cue.",
        ),
      ),
      cue(
        "wave",
        16,
        22,
        "Malefic Wave · use the gateway",
        "When its exit is safely behind the expanding ring, use the gate.",
        "You arrive on the safe side.",
        roles(
          "Use the gate without blocking the group’s route.",
          "Help anyone who was clipped.",
          "Use the gate; do not walk through the wave.",
        ),
      ),
      cue(
        "resume",
        22,
        24,
        "Regroup · resume the interrupt rotation",
        "Keep tracking the Infernal and the next cast.",
        "A new live mechanic starts.",
        roles(
          "Re-establish a safe kite route.",
          "Stabilise the group.",
          "Resume Chaos Bolt interrupts.",
        ),
      ),
    ],
  },
];
export const getMurderLesson = (id: string) =>
  murderLessons.find((b) => b.id === id);
