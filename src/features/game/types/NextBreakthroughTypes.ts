export interface NextBreakthroughPanelProps {
  playerId: string;
  cultivationPoint: number;
  onBreakthroughResult: (result: "success" | "failed") => void;
}

export interface NextBreakthroughResponse {
  nextRealm: string;
  nextStage: string;
  isTribulation: boolean;
  breakthroughPoints: number;
  chanceOfSuccess: number;
}