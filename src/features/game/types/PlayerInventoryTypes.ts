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

export const EQUIPMENT_SLOT_TYPES = [
    "HELMET",
    "CHESTPLATE",
    "LEGGINGS",
    "BOOTS",
    "WEAPON",
    "ACCESSORY",
]

export interface GetPlayerInventoryResponse {
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  stats: StatsOfItem | null;
  itemType: string;
  quantity: number;
  combatOnly: boolean;
}

export interface GetEquipmentsResponse {
  id: string;
  itemId: string;
  itemImageUrl: string;
  itemName: string;
  statsOfItem: StatsOfItem;
  equipmentSlotType: string;
}

// Fired whenever the player's equipped items change (e.g. after using/equipping
// an item from the inventory), so any panel showing equipment can refetch.
export const EQUIPMENT_CHANGED_EVENT = "vastworld:equipment-changed";
export type PlayerInventorySlot = GetPlayerInventoryResponse | null;