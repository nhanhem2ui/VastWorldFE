import type { Texture } from "pixi.js";

export type GetPlayerLocationResponse = {
  mapId: number;
  x: number;
  y: number;
};

export type AssetType = "SPRITESHEET" | "IMAGE" | "AUDIO";

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

export type GetMapResponse = {
  mapName: string;
  mapWidth: number;
  mapHeight: number;
  mapTiles: TileOfMaps[];
  mapDecorations: TileOfMaps[];
};

export type CachedAsset = Texture | Texture[];

export type MapComponentOptions = {
  onTravelStart?: () => void;
  onTravelEnd?: () => void;
  onTravelError?: (message: string) => void;
};