/** Tactics preview. Diagram coordinates and playback tempo are illustrative, not game measurements. */
export type TacticRole = "dps" | "healer" | "tank";
export type TacticLesson = {
  id: string;
  seasonId: string;
  seasonName: string;
  dungeon: string;
  boss: string;
  mechanic: string;
  image: string;
  checked: string;
  source: { label: string; url: string };
  note: string;
  steps: readonly {
    label: string;
    title: string;
    text: string;
    action: string;
    phase: string;
  }[];
  roles: Record<
    TacticRole,
    { label: string; icon: string; title: string; text: string }
  >;
  choices: readonly {
    id: string;
    x: number;
    y: number;
    label: string;
    correct: boolean;
    feedback: string;
  }[];
};
export const tacticsPreview: TacticLesson = {
  id: "ruby-chillstorm-v1",
  seasonId: "midnight-s2",
  seasonName: "Midnight Season 2",
  dungeon: "Ruby Life Pools",
  boss: "Melidrussa Chillworn",
  mechanic: "Chillstorm",
  image: "/images/dungeons/ruby-life-pools.jpg",
  checked: "2026-10-25",
  source: {
    label: "Method · Tactyks’ dungeon guide",
    url: "https://www.method.gg/guides/dungeons/ruby-life-pools",
  },
  note: "A positioning study, not a full encounter simulation. Distances, arena shape and playback tempo are illustrative. This scene shows one possible target, not a fixed assignment.",
  steps: [
    {
      label: "Read the mark",
      title: "One player gets the storm.",
      text: "Identify the marked player before deciding where to move. In this example, the ranged DPS is targeted.",
      action: "Find the gold ring around the targeted player.",
      phase: "TARGET SELECTED",
    },
    {
      label: "Create space",
      title: "Take the storm away.",
      text: "The targeted player moves away from teammates. Leave the group room to continue the fight.",
      action: "Follow the dashed path to the open side.",
      phase: "POSITION THE TARGET",
    },
    {
      label: "Leave the storm",
      title: "Keep clear of the pull.",
      text: "Stay out of the storm and resist its inward pull. Use healing or defensive tools for the damage.",
      action: "The storm stays behind. The player moves back out.",
      phase: "STORM ACTIVE",
    },
    {
      label: "Recover",
      title: "Regroup without crossing danger.",
      text: "After the danger ends, return to a useful position and prepare for the next mechanic.",
      action: "Review your role reminder, then try the decision yourself.",
      phase: "RESET YOUR POSITION",
    },
  ],
  roles: {
    dps: {
      label: "DPS",
      icon: "D",
      title: "Space first. Damage second.",
      text: "If marked, separate before resuming damage. Keep a defensive available for the storm.",
    },
    healer: {
      label: "Healer",
      icon: "+",
      title: "Watch the target and the group.",
      text: "Prepare healing for the storm damage. Keep the marked player within a workable healing position.",
    },
    tank: {
      label: "Tank",
      icon: "T",
      title: "Keep the fight controlled.",
      text: "Leave room for the marked player to separate. Avoid dragging the group toward the storm.",
    },
  },
  choices: [
    {
      id: "open",
      x: 77,
      y: 65,
      label: "Open side, away from teammates",
      correct: true,
      feedback:
        "Good positioning: the storm is separated from the party. This is a teaching example; adapt the direction to the space available in your run.",
    },
    {
      id: "party",
      x: 41,
      y: 66,
      label: "Stay with the party",
      correct: false,
      feedback:
        "This puts the storm beside teammates. Look for space away from the group, then try again.",
    },
    {
      id: "tank",
      x: 50,
      y: 37,
      label: "Move toward the tank",
      correct: false,
      feedback:
        "The tank is already occupying this area. Choose the open side to avoid bringing the storm into the group’s position.",
    },
  ],
} as const;
