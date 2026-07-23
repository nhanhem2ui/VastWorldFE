// sqlExport.ts
//
// Generates SQL straight from the resolved AssetRegistry, never from
// re-derived logic. This is the fix for the "hard stuck" problem: the old
// generateSql had its own copy of the source -> AssetID mapping
// (`if (tile.source === "fantasy") assetId = 4`), so it was possible for
// what's on screen and what gets written to the DB to silently drift apart
// as new tilesets were added. Now there is exactly one mapping
// (assetManifest.ts), and both rendering and SQL export read from it.

import { type AssetRegistry, registryKey } from './builderAssetLoader';
import { GROUND_TILES, DEFAULT_GROUND_TILE, OBJECT_PLACEMENTS, MAP_WIDTH, MAP_HEIGHT } from './mapData';

function lookupOrThrow(registry: AssetRegistry, assetId: number, frameKey: string | undefined, context: string) {
  const resolved = registry.get(registryKey(assetId, frameKey));
  if (!resolved) {
    throw new Error(
      `[sqlExport] No registry entry for assetId=${assetId} frameKey=${frameKey ?? '(none)'} (${context}). ` +
        `Check that assetId exists in assetManifest.ts and, for spritesheets, that frameKey matches a key in its "frames" map.`
    );
  }
  return resolved;
}

export function generateGroundSql(mapId: number, registry: AssetRegistry): string {
  const lookup = new Map(GROUND_TILES.map((t) => [`${t.x},${t.y}`, t]));
  const rows: string[] = [];

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const tile = lookup.get(`${x},${y}`) ?? { ...DEFAULT_GROUND_TILE, x, y };
      const resolved = lookupOrThrow(registry, tile.assetId, tile.frameKey, `ground tile (${x},${y})`);
      rows.push(`(${mapId},${x},${y},${resolved.assetId},${resolved.spriteFrame ?? 'NULL'})`);
    }
  }

  return [
    `DELETE FROM MapTiles WHERE MapID = ${mapId};`,
    '',
    `INSERT INTO MapTiles (MapID,X,Y,AssetID,SpriteFrame) VALUES`,
    `  ${rows.join(',\n  ')};`,
    'GO',
    '',
  ].join('\n');
}

/**
 * Same idea for decorations/buildings, assuming a MapObjects table shaped
 * like (MapID, X, Y, AssetID, SpriteFrame). Adjust the table/column names
 * to match your actual schema.
 */
export function generateObjectSql(mapId: number, registry: AssetRegistry): string {
  const rows = OBJECT_PLACEMENTS.map((placement) => {
    const resolved = lookupOrThrow(
      registry,
      placement.assetId,
      placement.frameKey,
      `object placement (${placement.x},${placement.y})`
    );
    return `(${mapId},${placement.x},${placement.y},${resolved.assetId},${resolved.spriteFrame ?? 'NULL'})`;
  });

  if (rows.length === 0) return `-- no object placements for map ${mapId}\n`;

  return [
    `DELETE FROM MapObjects WHERE MapID = ${mapId};`,
    '',
    `INSERT INTO MapObjects (MapID,X,Y,AssetID,SpriteFrame) VALUES`,
    `  ${rows.join(',\n  ')};`,
    'GO',
    '',
  ].join('\n');
}

export function generateMapSql(mapId: number, registry: AssetRegistry): string {
  return generateGroundSql(mapId, registry) + '\n' + generateObjectSql(mapId, registry);
}