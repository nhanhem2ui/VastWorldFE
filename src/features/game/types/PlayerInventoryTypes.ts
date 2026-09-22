interface StatsOfItem {
  hp: number | null;
  attack: number | null;
  defense: number | null;
  critRate: number | null;
  critDamage: number | null;
  speed: number | null;
  lifeSteal: number | null;
  cultivationSpeed: number | null;
}

export interface GetPlayerInventoryResponse {
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  stats: StatsOfItem | null;
  itemType: string;
  quantity: number;
}

export type PlayerInventorySlot = GetPlayerInventoryResponse | null;