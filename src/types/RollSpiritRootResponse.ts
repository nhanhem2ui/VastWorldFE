import type { PlayerSpiritRootResponse } from "./PlayerSpiritRootResponse";

export interface RollSpiritRootResponse {
  playerId: string;
  remainingRollNum: number;
  isVariantRoll: boolean;
  spiritRoots: PlayerSpiritRootResponse[];
}