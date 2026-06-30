import { hexNeighbors } from "./hexGeometry";

export function bfsPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  validTiles: Set<string>
): Array<{ x: number; y: number }> | null {

  const key = (x: number, y: number) => `${x},${y}`;
  
  const startKey = key(start.x, start.y);
  const endKey = key(end.x, end.y);

  if (startKey === endKey) return [{ ...start }];
  if (!validTiles.has(endKey)) return null;

  const queue: Array<{ x: number; y: number }> = [start];
  const prev = new Map<string, string | null>([[startKey, null]]);

  outer: while (queue.length > 0) {

    const cur = queue.shift()!;
    const curKey = key(cur.x, cur.y);

    if (curKey === endKey) break outer;

    for (const n of hexNeighbors(cur.x, cur.y)) {

      const nKey = key(n.x, n.y);
      
      if (!prev.has(nKey) && validTiles.has(nKey)) {
        prev.set(nKey, curKey);
        queue.push(n);
      }
    }
  }

  if (!prev.has(endKey)) return null;

  const path: Array<{ x: number; y: number }> = [];
  let cur: string | null = endKey;

  while (cur !== null) {
    const [x, y] = cur.split(",").map(Number);
    path.unshift({ x, y });
    cur = prev.get(cur) ?? null;
  }
  
  return path;
}

export function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}