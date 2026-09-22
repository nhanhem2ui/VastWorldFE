export interface GetPlayerMeditationByIdResponse {
  startTime: string; // LocalDateTime string
  endTime: string;
  cultivationPerMinute: number;
  totalCultivationReward: number;
  isClaimed: boolean;
}

export interface MeditationPanelProps {
  playerId: string;
  cultivationSpeed: number;
}