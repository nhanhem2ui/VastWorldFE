export type QuestObjectiveType =
  | "LEVEL_UP"
  | "KILL_MONSTER"
  | "REACH_MAP"
  | "REACH_COORDINATE"
  | "COLLECT_ITEM";

export interface ObjectiveOfQuest {
  objectiveType: QuestObjectiveType;
  description: string;
  requiredCount: number | null;
  monsterId: number | null;
  itemId: string | null;
  targetRealm: string | null;
  targetRealmStage: string | null;
  targetMap: number | null;
  targetX: number | null;
  targetY: number | null;
}

export interface AvailableQuest {
  id: number;
  name: string;
  requiredRealm: string;
  questObjectives: ObjectiveOfQuest[];
}
export interface ClaimedQuest {
  id: number;
  name: string;
  progress: number;
  requiredCount: number;
}

export interface ObjectiveProgress {
  questType: QuestObjectiveType;
  description: string;
  isCompleted: boolean;
  
  // KillMonster / CollectItem
  monsterId?: number | null;
  itemId?: string | null;
  requiredCount?: number | null;
  currentCount?: number | null;

  // ReachMap / ReachCoordinate
  mapId?: number | null;
  currentMapId?: number | null;
  targetX?: number | null;
  targetY?: number | null;
  currentX?: number | null;
  currentY?: number | null;

  // LevelUp
  targetRealm?: string | null;
  currentRealm?: string | null;
  targetRealmStage?: string | null;
  currentRealmStage?: string | null;
}

export interface AcceptedQuest {
  id: number;
  name: string;
  requiredRealm: string;
  objectiveAndProgressOfQuests: ObjectiveProgress[];
}

export const OBJECTIVE_ICON: Record<QuestObjectiveType, string> = {
  LEVEL_UP: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13.2929 8.70711L8 3.41421L2.70711 8.7071L1.29289 7.29289L8 0.585785L14.7071 7.29289L13.2929 8.70711Z" fill="#ffffff"></path> <path d="M13.2929 15.2071L8 9.91421L2.70711 15.2071L1.29289 13.7929L8 7.08578L14.7071 13.7929L13.2929 15.2071Z" fill="#ffffff"></path> </g></svg>`,
  KILL_MONSTER: `<svg viewBox="0 0 512 512" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#991a1a" d="M146.326 6.15l87.813 128.725-60.87-39.916 34.925 62.864L38.56 48.06h-.003c40.207 71.33 82.046 134.913 129.23 191.764L303.94 103.67c-45.164-37.052-96.674-69.324-157.614-97.52zm347.145 9.496L372.983 61.713l-214.59 214.09 13.213 13.215L383.367 77.75l78.078-29.85-29.402 78.56-211.746 211.25 13.213 13.214 214.61-214.106 45.35-121.172zM407.177 89.13l-259.95 259.95c-11.956-17.32-11.687-40.444.25-57.764l-31.26-31.255c-28.637 34.832-28.588 85.102.167 119.864L52.336 443.97c-2.528-.95-5.184-1.43-7.842-1.43-5.74 0-11.476 2.216-15.908 6.647-8.864 8.865-8.866 22.953 0 31.82 8.864 8.863 22.954 8.863 31.818 0 6.512-6.513 8.234-15.844 5.178-23.853l64.057-64.056c34.788 28.437 85.12 28.65 119.817.203l-31.262-31.26c-17.28 11.84-40.352 11.907-57.68.18l259.876-259.874-13.214-13.215zm-2.196 117.01L268.186 342.937c55.29 48.057 118.235 90.138 192.464 127.216L398.783 351.41l102.78 68.85-117.75-164.645 86.816 42.908c-20.895-33.04-42.523-63.772-65.65-92.382z"></path></g></svg>`,
  REACH_MAP: `<svg viewBox="0 0 24 24" fill="none" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 6H12.01M9 20L3 17V4L5 5M9 20L15 17M9 20V14M15 17L21 20V7L19 6M15 17V14M15 6.2C15 7.96731 13.5 9.4 12 11C10.5 9.4 9 7.96731 9 6.2C9 4.43269 10.3431 3 12 3C13.6569 3 15 4.43269 15 6.2Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`,
  REACH_COORDINATE: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.7 15C4.03377 15.6353 3 16.5205 3 17.4997C3 19.4329 7.02944 21 12 21C16.9706 21 21 19.4329 21 17.4997C21 16.5205 19.9662 15.6353 18.3 15M12 9H12.01M18 9C18 13.0637 13.5 15 12 18C10.5 15 6 13.0637 6 9C6 5.68629 8.68629 3 12 3C15.3137 3 18 5.68629 18 9ZM13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9Z" stroke="#808080" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`,
  COLLECT_ITEM: `<svg fill="#798486" height="16px" width="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" stroke="#798486"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M411.815,115.043c0-16.356-8.629-30.694-21.582-38.717c3.483-14.83-0.55-31.067-12.113-42.632 c-11.563-11.563-27.8-15.596-42.631-12.113C327.466,8.629,313.127,0,296.772,0s-30.694,8.629-38.718,21.582 c-14.83-3.484-31.066,0.55-42.63,12.113c-11.565,11.565-15.596,27.8-12.113,42.632c-12.953,8.023-21.582,22.361-21.582,38.717 c0,16.356,8.629,30.694,21.582,38.717c-3.483,14.83,0.55,31.067,12.113,42.632c8.887,8.887,20.536,13.33,32.181,13.33 c3.508,0,7.016-0.411,10.448-1.217c5.131,8.282,12.851,14.782,22.022,18.403v56.631h-104.08c-41.869,0-75.81,33.941-75.81,75.81 v76.839c0,41.869,33.942,75.81,75.81,75.81h167.442c16.012,0,29.422-13.105,29.116-29.115 c-0.297-15.515-12.967-28.001-28.553-28.001h7.854c16.012,0,29.422-13.105,29.116-29.115 c-0.296-15.515-12.966-28.001-28.552-28.001h7.854c16.013,0,29.422-13.105,29.116-29.115 c-0.297-15.515-12.967-28.001-28.553-28.001h7.854c16.013,0,29.422-13.105,29.116-29.115 c-0.297-15.515-12.967-28.001-28.553-28.001h-55.787v-56.631c9.171-3.621,16.892-10.121,22.022-18.403 c3.434,0.806,6.94,1.217,10.448,1.217c11.647,0,23.296-4.444,32.183-13.33c11.563-11.563,15.596-27.801,12.113-42.632 C403.186,145.737,411.815,131.399,411.815,115.043z M296.772,160.636c-25.179,0-45.592-20.412-45.592-45.592 c0-25.18,20.412-45.593,45.592-45.593c25.18,0,45.592,20.412,45.592,45.593C342.363,140.223,321.951,160.636,296.772,160.636z"></path> </g> </g> </g></svg>`,
};