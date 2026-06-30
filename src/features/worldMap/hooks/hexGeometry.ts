import { HORIZONTAL_SPACING, VERTICAL_SPACING, HEX_WIDTH } from "../types/constaint";

export function hexToPixel(x: number, y: number): { px: number; py: number } {
  let px = x * HORIZONTAL_SPACING;
  let py = y * VERTICAL_SPACING;
  if (x % 2 === 1) py += VERTICAL_SPACING / 2;
  return {
    px: Math.round((px + Number.EPSILON) * 100) / 100,
    py: Math.round((py + Number.EPSILON) * 100) / 100,
  };
}

/**
 * x % 2 === 0                          x % 2 !== 0
 *             (x, y-1)                             (x,y-1)
      (x-1,y-1)         (x+1,y-1)           (x-1,y)         (x+1,y)
                (x,y)                                (x,y)
      (x-1,y)           (x+1,y)            (x-1,y+1)        (x+1,y+1)
               (x,y+1)                              (x,y+1)
 */
export function hexNeighbors(x: number, y: number): Array<{ x: number; y: number }> {
  if (x % 2 === 0) {
    return [
      { x: x - 1, y: y - 1 }, { x: x - 1, y: y },
      { x: x,     y: y - 1 }, { x: x,     y: y + 1 },
      { x: x + 1, y: y - 1 }, { x: x + 1, y: y },
    ];
  }
  return [
    { x: x - 1, y: y },     { x: x - 1, y: y + 1 },
    { x: x,     y: y - 1 }, { x: x,     y: y + 1 },
    { x: x + 1, y: y },     { x: x + 1, y: y + 1 },
  ];
}

export function findNearestTile(
  worldX: number,
  worldY: number,
  tileMap: Map<string, { x: number; y: number }>
): { x: number; y: number } | null {
  const approxCol = Math.round(worldX / HORIZONTAL_SPACING);
  let best: { x: number; y: number } | null = null;
  let bestDist = HEX_WIDTH;

  for (let dc = -2; dc <= 2; dc++) {
    const col = approxCol + dc;
    if (col < 0) continue;
    const yOffset = col % 2 === 1 ? VERTICAL_SPACING / 2 : 0;
    const approxRow = Math.round((worldY - yOffset) / VERTICAL_SPACING);

    for (let dr = -2; dr <= 2; dr++) {
      const row = approxRow + dr;
      const tile = tileMap.get(`${col},${row}`);
      if (!tile) continue;
      const { px, py } = hexToPixel(col, row);

      const dist = Math.hypot(worldX - px, worldY - py);

      if (dist < bestDist) {
        bestDist = dist;
        best = tile;
      }
    }
  }
  return best;
}