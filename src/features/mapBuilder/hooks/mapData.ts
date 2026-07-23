// mapData.ts
//
// Editor-authored map content. Every entry references an assetId (+ an
// optional frameKey for spritesheet-backed assets) instead of a
// loader-specific "source" string like "fantasy" / "defaultGrass". That
// means placing a tile from a brand new spritesheet you just added to
// assetManifest.ts requires zero changes here beyond the new entry itself.

export type GroundTile = {
  x: number;
  y: number;
  assetId: number;
  /** Required for spritesheet assets, omit for single-image assets. */
  frameKey?: string;
};

export type ObjectPlacement = {
  x: number;
  y: number;
  assetId: number;
  frameKey?: string;
};

export const MAP_WIDTH = 14;
export const MAP_HEIGHT = 12;

/** Any (x, y) not listed here falls back to this                                                                                                                                                                                     . */
export const DEFAULT_GROUND_TILE: Omit<GroundTile, 'x' | 'y'> = { assetId: 5 };

export const GROUND_TILES: GroundTile[] = [
  { x: 0, y: 0, assetId: 12, frameKey: 'MIST_1' },
  { x: 0, y: 1, assetId: 12, frameKey: 'MIST_2' },
  { x: 0, y: 2, assetId: 12, frameKey: 'MIST_1' },
  { x: 0, y: 3, assetId: 12, frameKey: 'MIST_3' },
  { x: 0, y: 4, assetId: 12, frameKey: 'ROCK' },
  { x: 0, y: 5, assetId: 12, frameKey: 'MUD_1' },
  { x: 0, y: 6, assetId: 12, frameKey: 'MIST_1' },
  { x: 0, y: 7, assetId: 12, frameKey: 'MIST_2' },
  { x: 0, y: 8, assetId: 12, frameKey: 'MIST_3' },
  { x: 0, y: 9, assetId: 12, frameKey: 'MIST_5' },
  { x: 0, y: 10, assetId: 12, frameKey: 'MIST_2' },
  { x: 0, y: 11, assetId: 12, frameKey: 'MIST_1' },


  { x: 1, y: 0, assetId: 12, frameKey: 'MIST_2' },
  { x: 1, y: 1, assetId: 12, frameKey: 'MUD_1' },
  { x: 1, y: 2, assetId: 12, frameKey: 'PEBBLE_2' },
  { x: 1, y: 3, assetId: 12, frameKey: 'PEBBLE_3' },
  { x: 1, y: 4, assetId: 12, frameKey: 'PEBBLE_2' },
  { x: 1, y: 5, assetId: 12, frameKey: 'ROCK' },
  { x: 1, y: 6, assetId: 12, frameKey: 'PEBBLE_1' },
  { x: 1, y: 7, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 1, y: 8, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 1, y: 9, assetId: 12, frameKey: 'GRASS' },
  { x: 1, y: 10, assetId: 12, frameKey: 'GRASS' },
  { x: 1, y: 11, assetId: 12, frameKey: 'MIST_4' },


  { x: 2, y: 0, assetId: 12, frameKey: 'MIST_3' },
  { x: 2, y: 1, assetId: 12, frameKey: 'MUD_2' },
  { x: 2, y: 2, assetId: 12, frameKey: 'PEBBLE_3' },
  { x: 2, y: 3, assetId: 12, frameKey: 'PEBBLE_1' },
  { x: 2, y: 4, assetId: 12, frameKey: 'PEBBLE_2' },
  { x: 2, y: 5, assetId: 12, frameKey: 'ROCK' },
  { x: 2, y: 6, assetId: 12, frameKey: 'GRASS' },
  { x: 2, y: 7, assetId: 12, frameKey: 'GRASS_LANE' },
  { x: 2, y: 8, assetId: 12, frameKey: 'GRASS_SIDE' },
  { x: 2, y: 9, assetId: 12, frameKey: 'GRASS' },
  { x: 2, y: 10, assetId: 12, frameKey: 'GRASS' },
  { x: 2, y: 11, assetId: 12, frameKey: 'MIST_2' },


  { x: 3, y: 0, assetId: 12, frameKey: 'MIST_5' },
  { x: 3, y: 1, assetId: 12, frameKey: 'BROKEN_1' },
  { x: 3, y: 2, assetId: 12, frameKey: 'BROKEN_2' },
  { x: 3, y: 3, assetId: 12, frameKey: 'BROKEN_1' },
  { x: 3, y: 4, assetId: 12, frameKey: 'SLAB_3' },
  { x: 3, y: 5, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 3, y: 6, assetId: 12, frameKey: 'GRASS_ROCKLANE' },
  { x: 3, y: 7, assetId: 4, frameKey: 'WATER_DEEP' },
  { x: 3, y: 8, assetId: 4, frameKey: 'WATER_DEEP' },
  { x: 3, y: 9, assetId: 12, frameKey: 'GRASS_SIDE' },
  { x: 3, y: 10, assetId: 12, frameKey: 'MIST_4' },
  { x: 3, y: 11, assetId: 12, frameKey: 'MIST_1' },


  { x: 4, y: 0, assetId: 12, frameKey: 'MIST_1' },
  { x: 4, y: 1, assetId: 12, frameKey: 'MIST_4' },
  { x: 4, y: 2, assetId: 12, frameKey: 'SLAB_3' },
  { x: 4, y: 3, assetId: 12, frameKey: 'SLAB_2' },
  { x: 4, y: 4, assetId: 12, frameKey: 'SLAB_10' },
  { x: 4, y: 5, assetId: 12, frameKey: 'SLAB_9' },
  { x: 4, y: 6, assetId: 12, frameKey: 'BROKEN_1' },
  { x: 4, y: 7, assetId: 12, frameKey: 'PEBBLE_1' },
  { x: 4, y: 8, assetId: 4, frameKey: 'WATER_DEEP' },
  { x: 4, y: 9, assetId: 12, frameKey: 'GRASS_ROCKLANE' },
  { x: 4, y: 10, assetId: 12, frameKey: 'GRASS' },
  { x: 4, y: 11, assetId: 12, frameKey: 'MIST_1' },


  { x: 5, y: 0, assetId: 12, frameKey: 'MIST_2' },
  { x: 5, y: 1, assetId: 12, frameKey: 'EYE_1' },
  { x: 5, y: 2, assetId: 12, frameKey: 'SLAB_4' },
  { x: 5, y: 3, assetId: 12, frameKey: 'SLAB_11' },
  { x: 5, y: 4, assetId: 12, frameKey: 'PEBBLE_1' },
  { x: 5, y: 5, assetId: 12, frameKey: 'PEBBLE_2' },
  { x: 5, y: 6, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 5, y: 7, assetId: 12, frameKey: 'PEBBLE_1' },
  { x: 5, y: 8, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 5, y: 9, assetId: 12, frameKey: 'GRASS' },
  { x: 5, y: 10, assetId: 12, frameKey: 'GRASS' },
  { x: 5, y: 11, assetId: 12, frameKey: 'MIST_3' },


  { x: 6, y: 0, assetId: 12, frameKey: 'MIST_3' },
  { x: 6, y: 1, assetId: 12, frameKey: 'SLAB_1' },
  { x: 6, y: 2, assetId: 12, frameKey: 'BROKEN_2' },
  { x: 6, y: 3, assetId: 12, frameKey: 'SLAB_4' },
  { x: 6, y: 4, assetId: 12, frameKey: 'SLAB_2' },
  { x: 6, y: 5, assetId: 12, frameKey: 'SLAB_7' },
  { x: 6, y: 6, assetId: 12, frameKey: 'SLAB_9' },
  { x: 6, y: 7, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 6, y: 8, assetId: 12, frameKey: 'GRASS_4LANE' },
  { x: 6, y: 9, assetId: 12, frameKey: 'GRASS' },
  { x: 6, y: 10, assetId: 12, frameKey: 'ROCK' },
  { x: 6, y: 11, assetId: 12, frameKey: 'ROCK' },


  { x: 7, y: 0, assetId: 12, frameKey: 'MIST_2' },
  { x: 7, y: 1, assetId: 12, frameKey: 'SLAB_3' },
  { x: 7, y: 2, assetId: 12, frameKey: 'SLAB_3' },
  { x: 7, y: 3, assetId: 12, frameKey: 'SLAB_7' },
  { x: 7, y: 4, assetId: 12, frameKey: 'SLAB_6' },
  { x: 7, y: 5, assetId: 12, frameKey: 'BROKEN_2' },
  { x: 7, y: 6, assetId: 12, frameKey: 'SLAB_7' },
  { x: 7, y: 7, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 7, y: 8, assetId: 12, frameKey: 'BROKEN_2' },
  { x: 7, y: 9, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 7, y: 10, assetId: 12, frameKey: 'ROCK' },
  { x: 7, y: 11, assetId: 12, frameKey: 'ROCK' },


  { x: 8, y: 0, assetId: 12, frameKey: 'MIST_4' },
  { x: 8, y: 1, assetId: 12, frameKey: 'MIST_5' },
  { x: 8, y: 2, assetId: 12, frameKey: 'SLAB_10' },
  { x: 8, y: 3, assetId: 12, frameKey: 'SLAB_11' },
  { x: 8, y: 4, assetId: 12, frameKey: 'SLAB_8' },
  { x: 8, y: 5, assetId: 12, frameKey: 'SLAB_5' },
  { x: 8, y: 6, assetId: 12, frameKey: 'SLAB_5' },
  { x: 8, y: 7, assetId: 12, frameKey: 'SLAB_10' },
  { x: 8, y: 8, assetId: 12, frameKey: 'SLAB_1' },
  { x: 8, y: 9, assetId: 12, frameKey: 'SLAB_2' },
  { x: 8, y: 10, assetId: 12, frameKey: 'BROKEN_2' },
  { x: 8, y: 11, assetId: 12, frameKey: 'ROCK' },


  { x: 9, y: 0, assetId: 12, frameKey: 'MIST_1' },
  { x: 9, y: 1, assetId: 12, frameKey: 'MIST_2' },
  { x: 9, y: 2, assetId: 12, frameKey: 'SLAB_9' },
  { x: 9, y: 3, assetId: 12, frameKey: 'EYE_2' },
  { x: 9, y: 4, assetId: 12, frameKey: 'SLAB_1' },
  { x: 9, y: 5, assetId: 12, frameKey: 'SLAB_3' },
  { x: 9, y: 6, assetId: 12, frameKey: 'SLAB_6' },
  { x: 9, y: 7, assetId: 12, frameKey: 'SLAB_8' },
  { x: 9, y: 8, assetId: 12, frameKey: 'SLAB_4' },
  { x: 9, y: 9, assetId: 12, frameKey: 'SLAB_6' },
  { x: 9, y: 10, assetId: 12, frameKey: 'SLAB_9' },
  { x: 9, y: 11, assetId: 12, frameKey: 'SLAB_10' },


  { x: 10, y: 0, assetId: 12, frameKey: 'MIST_3' },
  { x: 10, y: 1, assetId: 12, frameKey: 'MIST_4' },
  { x: 10, y: 2, assetId: 12, frameKey: 'MIST_5' },
  { x: 10, y: 3, assetId: 12, frameKey: 'SLAB_1' },
  { x: 10, y: 4, assetId: 12, frameKey: 'SLAB_3' },
  { x: 10, y: 5, assetId: 12, frameKey: 'SLAB_11' },
  { x: 10, y: 6, assetId: 12, frameKey: 'SLAB_10' },
  { x: 10, y: 7, assetId: 12, frameKey: 'BROKEN_1' },
  { x: 10, y: 8, assetId: 12, frameKey: 'SLAB_7' },
  { x: 10, y: 9, assetId: 12, frameKey: 'SLAB_3' },
  { x: 10, y: 10, assetId: 12, frameKey: 'SLAB_1' },
  { x: 10, y: 11, assetId: 12, frameKey: 'SLAB_4' },


  { x: 11, y: 0, assetId: 12, frameKey: 'MIST_1' },
  { x: 11, y: 1, assetId: 12, frameKey: 'MIST_2' },
  { x: 11, y: 2, assetId: 12, frameKey: 'SLAB_2' },
  { x: 11, y: 3, assetId: 12, frameKey: 'SLAB_4' },
  { x: 11, y: 4, assetId: 12, frameKey: 'SLAB_6' },
  { x: 11, y: 5, assetId: 12, frameKey: 'SLAB_7' },
  { x: 11, y: 6, assetId: 12, frameKey: 'BROKEN_1' },
  { x: 11, y: 7, assetId: 12, frameKey: 'SLAB_10' },
  { x: 11, y: 8, assetId: 12, frameKey: 'SLAB_11' },
  { x: 11, y: 9, assetId: 12, frameKey: 'SLAB_8' },
  { x: 11, y: 10, assetId: 12, frameKey: 'SLAB_1' },
  { x: 11, y: 11, assetId: 12, frameKey: 'SLAB_7' },


  { x: 12, y: 0, assetId: 12, frameKey: 'MIST_4' },
  { x: 12, y: 1, assetId: 12, frameKey: 'MIST_3' },
  { x: 12, y: 2, assetId: 12, frameKey: 'MIST_2' },
  { x: 12, y: 3, assetId: 12, frameKey: 'SLAB_1' },
  { x: 12, y: 4, assetId: 12, frameKey: 'SLAB_11' },
  { x: 12, y: 5, assetId: 12, frameKey: 'SLAB_10' },
  { x: 12, y: 6, assetId: 12, frameKey: 'SLAB_8' },
  { x: 12, y: 7, assetId: 12, frameKey: 'SLAB_7' },
  { x: 12, y: 8, assetId: 12, frameKey: 'SLAB_6' },
  { x: 12, y: 9, assetId: 12, frameKey: 'SLAB_4' },
  { x: 12, y: 10, assetId: 12, frameKey: 'SLAB_2' },
  { x: 12, y: 11, assetId: 12, frameKey: 'SLAB_1' },


  { x: 13, y: 0, assetId: 12, frameKey: 'MIST_2' },
  { x: 13, y: 1, assetId: 12, frameKey: 'MIST_4' },
  { x: 13, y: 2, assetId: 12, frameKey: 'MIST_3' },
  { x: 13, y: 3, assetId: 12, frameKey: 'MIST_5' },
  { x: 13, y: 4, assetId: 12, frameKey: 'MIST_2' },
  { x: 13, y: 5, assetId: 12, frameKey: 'MIST_1' },
  { x: 13, y: 6, assetId: 12, frameKey: 'MIST_3' },
  { x: 13, y: 7, assetId: 12, frameKey: 'MIST_4' },
  { x: 13, y: 8, assetId: 12, frameKey: 'MIST_5' },
  { x: 13, y: 9, assetId: 12, frameKey: 'MIST_2' },
  { x: 13, y: 10, assetId: 12, frameKey: 'GRASS_ROCK' },
  { x: 13, y: 11, assetId: 12, frameKey: 'GRASS_ROCK' },
];

export const OBJECT_PLACEMENTS: ObjectPlacement[] = [
  // { x: 3, y: 0, assetId: 10 }, // autumn tree
  // { x: 5, y: 0, assetId: 11 }, // bamboo
  // { x: 6, y: 3, assetId: 11 },
  // { x: 6, y: 4, assetId: 11 },
  // { x: 7, y: 3, assetId: 11 },
  // { x: 4, y: 10, assetId: 21 }, // blacksmith
  // { x: 9, y: 3, assetId: 20 }, // cultivator home
  // { x: 6, y: 5, assetId: 30 }, // rubber duck (animated)
];