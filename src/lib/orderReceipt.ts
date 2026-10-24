export type OrderReceipt = {
  orderId: string;
  createdAt: string;
  total: number;

  customer: {
    battleTag: string;
    discord: string;
    character: string;
    realm: string;
    comment: string;
  };

  service: {
    runGoal: "standard" | "crest";
    keyLevel: number;
    runs: number;
    mode: string;
    region: string;
    playerClass: string;
    role: string;
    armor: string;
    traders: number;
    dungeons: string[];

    crestType?: string;
    crestsPerRun?: number | null;
    estimatedCrests?: number | null;
  };

  schedule: {
    preferredTime: string;
    tbilisiTime: string;
  };
};

/** Immutable server-confirmed snapshot, returned only after successful delivery. */
export type DelveOrderReceipt = {
  serviceType: "delves";
  orderId: string;
  createdAt: string;
  total: number | null;
  quote: boolean;
  customer: OrderReceipt["customer"];
  schedule: OrderReceipt["schedule"];
  service: {
    kind: "runs" | "nemesis" | "labyrinth";
    name: string;
    tier: number | null;
    runs: number;
    mode: string;
    region: string;
    playerClass: string;
    delveId: string;
    destination: string;
    format: "regular" | "bountiful" | null;
    cofferKeys: number | null;
    tierUnlocked: boolean;
  };
};
