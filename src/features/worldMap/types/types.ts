import type { Texture } from "pixi.js";

export type GetPlayerLocationResponse = {
  mapId: number;
  x: number;
  y: number;
};

export type AssetType = "SPRITESHEET" | "IMAGE" | "AUDIO";

export type MapInteractableTypes = "HOME" | "BLACKSMITH";

export type AssetTile = {
  isAnimated: boolean;
  assetUrl: string;
  frameConfig: string | null;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  assetType: AssetType;
};

export type TileOfMaps = {
  x: number;
  y: number;
  spriteFrame: number;
  asset: AssetTile;
};

export type InteractableOfMap = {
  x: number;
  y: number;
  type: MapInteractableTypes;
};

export type GetMapResponse = {
  mapName: string;
  mapWidth: number;
  mapHeight: number;
  mapTiles: TileOfMaps[];
  mapDecorations: TileOfMaps[];
  mapInteractable: InteractableOfMap[];
};

export type CachedAsset = Texture | Texture[];

export type MapComponentOptions = {
  onTravelStart?: () => void;
  onTravelEnd?: () => void;
  onTravelError?: (message: string) => void;
  /**
   * Fired whenever the player's current tile changes.
   * Receives the InteractableOfMap on that tile, or null if there isn't one.
   */
  onInteractableChange?: (interactable: InteractableOfMap | null) => void;
};

/**
 * Return type of mapComponent(). Exposes the Pixi Application plus an
 * imperative action to trigger entering whatever interactable the player
 * is currently standing on (no-op if there isn't one).
 */
export type MapComponentHandle = {
  app: import("pixi.js").Application;
  enterInteractable: () => InteractableOfMap | null;
};


//REGION
export type GetPlayerRegionResponse = {
  mapId: number;
  regionId: number;
};

export type DecorationsOfRegion = {
  mapId: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  topHeight: number;
  rightWidth: number;
  bottomHeight: number;
  leftWidth: number;
  backgroundTexture: string;
  textColor: string;
};

export type GetRegionResponse = {
  name: string;
  width: number;
  height: number;
  backgroundImage: string;
  regionDecorations: DecorationsOfRegion[];
};

export type RegionComponentOptions = {
  /** Fired when a decoration text box is clicked. Behavior TBD. */
  onDecorationClick?: (decoration: DecorationsOfRegion) => void;
  onError?: (message: string) => void;
};

export type RegionComponentHandle = {
  app: import("pixi.js").Application;
};
