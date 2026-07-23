// assetManifest.ts
//
// Single source of truth for every renderable asset: where it loads from,
// how PIXI should size/anchor it, and which AssetID/SpriteFrame the backend
// SQL exporter should write. Adding a new tileset, sprite, or animation is
// ONE new entry in ASSET_MANIFEST below — nothing else in the pipeline
// needs to change.

export type FrameDefaults = {
  width?: number;
  height?: number;
  anchorX?: number;
  anchorY?: number;
  pivotX?: number;
  pivotY?: number;
};

export type FrameDef = FrameDefaults & {
  /** Index within the spritesheet's texture array. Becomes SpriteFrame in SQL. */
  frameIndex: number;
};

type BaseAssetDef = {
  /** Matches AssetID in MapTiles / MapObjects. Must be unique across the manifest. */
  assetId: number;
  /** Editor-facing label only, not persisted anywhere. */
  displayName: string;
  /** Fallback values for any frame that doesn't override them. */
  defaults?: FrameDefaults;
};

export type SingleAssetDef = BaseAssetDef & {
  kind: 'single';
  path: string;
};

export type SpritesheetAssetDef = BaseAssetDef & {
  kind: 'spritesheet';
  /** Path to the .json atlas. */
  path: string;
  /** Trims N px from every frame edge to kill edge bleeding on hex tiles. */
  trim?: number;
  /** frameKey (referenced from mapData.ts) -> frame lookup + optional per-frame overrides. */
  frames: Record<string, FrameDef>;
};

export type AnimatedAssetDef = BaseAssetDef & {
  kind: 'animated';
  frames: { path: string; timeMs: number }[];
};

export type AssetDef = SingleAssetDef | SpritesheetAssetDef | AnimatedAssetDef;

// ---------------------------------------------------------------------------
// Helper: turn a simple name -> index palette (like the old
// fantasyTiles_PALETE) into a full frame map, with optional per-name
// overrides, so you don't have to hand-write every frame entry.
// ---------------------------------------------------------------------------
export function paletteToFrames(
  palette: Record<string, number>,
  overrides: Record<string, FrameDefaults> = {}
): Record<string, FrameDef> {
  return Object.fromEntries(
    Object.entries(palette).map(([name, frameIndex]) => [
      name,
      { frameIndex, ...(overrides[name] ?? {}) },
    ])
  );
}

const fantasyPalette = {
  PLAIN: 0,
  PLAIN_TREE: 1,
  PLAIN_FOREST: 2,
  PLAIN_ROCK: 3,
  FOREST_ROCK: 4,
  STONE_WALL: 5,
  WATER_SHALLOW: 6,
  WATER_DEEP: 7,
  SWAMP_TREE: 12,
  SWAMP_PUDDLE: 13,
  SWAMP: 14,
  PLAIN_DARK: 15,
  SNOW: 16,
  SNOW_TREE: 17,
  SNOW_FOREST: 18,
  SNOW_ROCK: 19,
  FOREST_SNOW_ROCK: 20,
  SNOW_WATER: 21,
  DESERT: 24,
} as const;

const mistCavePalette = {
  SLAB_1: 0,
  SLAB_2: 1,
  SLAB_3: 2,
  SLAB_4: 3,
  EYE_1: 4,
  SLAB_5: 5,
  MUD_1: 6,
  MUD_2: 7,
  MUD_3: 8,
  PEBBLE_1: 9,
  GRASS_LANE: 10,
  GRASS: 11,
  ROCK: 12,
  GRASS_SIDE: 13,
  GRASS_ROCK: 14,
  GRASS_ROCKLANE: 15,
  GRASS_4LANE: 16, 
  EYE_2: 17,
  SLAB_6: 18,
  EYE_3: 19,
  EYE_4: 20,
  MIST_1: 21,
  MIST_2: 22,
  MIST_3: 24,
  MIST_4: 25,
  MIST_5: 26,
  PEBBLE_2: 27,
  PEBBLE_3: 28,
  SLAB_7: 29,
  SLAB_8: 30,
  BROKEN_1: 31,
  BROKEN_2: 32,
  SLAB_9: 33,
  SLAB_10: 34,
  SLAB_11: 35
  
} as const

// ---------------------------------------------------------------------------
// THE MANIFEST
//
// To add a brand new spritesheet (say a "snowhextiles_v1.json" pack):
//
//   {
//     assetId: 5,                 // pick the next free DB AssetID
//     kind: 'spritesheet',
//     displayName: 'snow_hex_tiles',
//     path: '../src/shared/assets/img/tiles/snowhextiles/snowhextiles_v1.json',
//     trim: 0.4,
//     defaults: { width: 60, height: 60, pivotY: 9 },
//     frames: paletteToFrames({ ICE: 0, SNOW_DRIFT: 1, ... }),
//   },
//
// That's it — the loader, the renderer, and the SQL exporter all pick it up
// automatically because they all read from this array.
// ---------------------------------------------------------------------------
export const ASSET_MANIFEST: AssetDef[] = [
  { 
    assetId: 5,
    kind: 'single',
    displayName: 'grass',
    path: '../src/shared/assets/img/tiles/green_hexagon.png',
    defaults: { width: 60, height: 40 },
  },
  {
    assetId: 7,
    kind: 'single',
    displayName: 'lighter_grass',
    path: '../src/shared/assets/img/tiles/lighter_green_hexagon.png',
    defaults: { width: 60, height: 40 },
  },
  {
    assetId: 4,
    kind: 'spritesheet',
    displayName: 'fantasy_hex_tiles',
    path: '../src/shared/assets/img/tiles/fantasyhextiles/fantasyhextiles_v3.json',
    trim: 0.4,
    defaults: { width: 60, height: 60, pivotY: 9 },
    frames: paletteToFrames(fantasyPalette),
  },
  {
    assetId: 6,
    kind: 'single',
    displayName: 'autumn_tree',
    path: '../src/shared/assets/img/decorations/Autumn_tree3.png',
    defaults: { anchorX: 0.5, anchorY: 0.5 },
  },
  {
    assetId: 8,
    kind: 'single',
    displayName: 'bamboo',
    path: '../src/shared/assets/img/decorations/bamboo_1.png',
    defaults: { anchorX: 0.5, anchorY: 0.5 },
  },
  {
    assetId: 9,
    kind: 'single',
    displayName: 'cultivator_home',
    path: '../src/shared/assets/img/buildings/cultivator-home.png',
    defaults: { anchorX: 0.5, anchorY: 0.5 },
  },
  {
    assetId: 11,
    kind: 'single',
    displayName: 'blacksmith',
    path: '../src/shared/assets/img/buildings/smithingBuilding.png',
    defaults: { anchorX: 0.5, anchorY: 0.5 },
  },
  {
    assetId: 10,
    kind: 'animated',
    displayName: 'rubber_duck',
    defaults: { anchorX: 0.5, anchorY: 0.5, width: 16, height: 16 },
    frames: [
      { path: '../src/shared/assets/img/decorations/rubberDuck_1.png', timeMs: 200 },
      { path: '../src/shared/assets/img/decorations/rubberDuck_2.png', timeMs: 200 },
      { path: '../src/shared/assets/img/decorations/rubberDuck_3.png', timeMs: 1000 },
    ],
  },
  {
    assetId: 12,
    kind: 'spritesheet',
    displayName: 'mistcave',
    defaults: {anchorX: 0.5, anchorY: 0.5, width: 60, height: 40},
    path: '../src/shared/assets/img/tiles/mistcave/spritesheet.json',
    trim: 0.4,
    frames: paletteToFrames(mistCavePalette)
  }
];