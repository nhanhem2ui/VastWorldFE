import { Application, Assets, Container } from "pixi.js";
import { initDevtools } from "@pixi/devtools";
import { getAuthToken } from "@/shared/hooks/authSession";
import type { ServiceResult } from "@/types/ServiceResult";
import { loadAsset } from "../hooks/assetLoader";
import { createSprite, createPlayerMarker, createDestinationRing } from "../hooks/displayObject";
import { hexToPixel, findNearestTile } from "../hooks/hexGeometry";
import { bfsPath, smoothstep } from "../hooks/pathfinding";
import { TRAVEL_MS_PER_TILE, HORIZONTAL_SPACING, HEX_WIDTH, VERTICAL_SPACING, PAN_PADDING, DRAG_THRESHOLD_SQ } from "../types/constaint";
import type {
  MapComponentOptions,
  MapComponentHandle,
  GetPlayerLocationResponse,
  GetMapResponse,
  InteractableOfMap,
} from "../types/types";

export async function mapComponent(
  containerElement: HTMLDivElement,
  playerId: string,
  options: MapComponentOptions = {}
): Promise<MapComponentHandle> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const token = getAuthToken();

  // 1. Fetch player position
  const posRes = await fetch(`${baseUrl}/api/map/playerPosition/${playerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!posRes.ok) throw new Error(`Failed to load player position (${posRes.status})`);

  const posResponse: ServiceResult<GetPlayerLocationResponse> = await posRes.json();

  if (!posResponse.success || !posResponse.data) {
    throw new Error(posResponse.message ?? "Failed to load player position");
  }

  const playerPos = posResponse.data;

  // 2. Fetch map data
  const mapRes = await fetch(`${baseUrl}/api/map/${playerPos.mapId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!mapRes.ok)
    throw new Error(`Failed to load map ${playerPos.mapId} (${mapRes.status})`);

  const mapResponse: ServiceResult<GetMapResponse> = await mapRes.json();

  if (!mapResponse.success || !mapResponse.data) {
    throw new Error(mapResponse.message ?? "Failed to load map");
  }

  const mapData = mapResponse.data;
  const mapTiles = mapData.mapTiles ?? [];
  const mapDecorations = mapData.mapDecorations ?? [];
  const mapInteractables = mapData.mapInteractable ?? [];

  // 3. Build pathfinding structures
  const validTileSet = new Set<string>(mapTiles.map((t) => `${t.x},${t.y}`));
  const tilePositionMap = new Map<string, { x: number; y: number }>(
    mapTiles.map((t) => [`${t.x},${t.y}`, { x: t.x, y: t.y }])
  );

  // 3b. Build interactable lookup, keyed by "x,y"
  const interactableMap = new Map<string, InteractableOfMap>(
      mapInteractables.map((i) => [`${i.x},${i.y}`, i])
    );

  // 4. Load all assets in parallel
  const allAssets = [...mapTiles, ...mapDecorations].map((t) => t.asset);
  const uniqueAssets = [...new Map(allAssets.map((a) => [a.assetUrl, a])).values()];
  await Promise.all(uniqueAssets.map(loadAsset));

  // 5. Boot PixiJS
  const app = new Application();
  await app.init({
    background: "#1d1d1d",
    resizeTo: containerElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: false,
  });

  initDevtools({ app });
  app.renderer.canvas.style.imageRendering = "pixelated";
  containerElement.appendChild(app.canvas);

  const groundLayer = new Container();
  const objectLayer = new Container();
  const markerLayer = new Container();
  
  app.stage.addChild(groundLayer);
  app.stage.addChild(objectLayer);
  app.stage.addChild(markerLayer);

  let scrollX = 100;
  let scrollY = 50;

  // 6. Render ground tiles
  for (const tile of mapTiles) {
    const { px, py } = hexToPixel(tile.x, tile.y);
    const sprite = createSprite(tile);
    sprite.x = px;
    sprite.y = py;
    groundLayer.addChild(sprite);
  }

  // 7. Render decoration objects (depth-sorted)
  for (const tile of mapDecorations) {
    const { px, py } = hexToPixel(tile.x, tile.y);
    const sprite = createSprite(tile);
    sprite.x = px;
    sprite.y = py;
    objectLayer.addChild(sprite);
  }
  objectLayer.children.sort((a, b) => a.y - b.y);

  // 8. Player marker + destination ring
  const { px: markerPx, py: markerPy } = hexToPixel(playerPos.x, playerPos.y);
  const icon = await Assets.load("../src/shared/assets/img/char/round.png");
  icon.source.scaleMode = "nearest";
  icon.source.autoGenerateMipmaps = false;
  const marker = createPlayerMarker(icon);
  marker.x = markerPx;
  marker.y = markerPy;
  marker.pivot.set(0, 5);
  markerLayer.addChild(marker);

  const destMarker = createDestinationRing();
  destMarker.visible = false;
  markerLayer.addChild(destMarker);

  // 9. Travel state
  let currentHex = { x: playerPos.x, y: playerPos.y };
  let isTraveling = false;
  let isRequesting = false;
  let travelPath: Array<{ x: number; y: number }> = [];
  let travelStepIndex = 0;
  let travelStepProgress = 0;

  // tile player is currently standing on.
  let activeInteractable: InteractableOfMap | null = null;

  // Check the player's starting tile immediately on load.
  refreshInteractable(currentHex, interactableMap);

  // 10. Ticker loop
  let pulse = 0;
  let destPulse = 0;

  app.ticker.add((ticker) => {
    pulse += ticker.deltaTime * 0.04;
    marker.scale.set(1 + Math.sin(pulse) * 0.07);

    if (destMarker.visible) {
      destPulse += ticker.deltaTime * 0.07;
      destMarker.alpha = 0.4 + Math.abs(Math.sin(destPulse)) * 0.6;
    }

    if (!isTraveling || travelPath.length < 2) return;

    travelStepProgress += ticker.deltaMS / TRAVEL_MS_PER_TILE;

    while (travelStepProgress >= 1 && travelStepIndex < travelPath.length - 1) {
      travelStepProgress -= 1;
      travelStepIndex++;
      currentHex = { ...travelPath[travelStepIndex] };
    }

    if (travelStepIndex >= travelPath.length - 1) {
      isTraveling = false;
      destMarker.visible = false;
      const dest = travelPath[travelPath.length - 1];
      currentHex = { ...dest };
      const { px, py } = hexToPixel(dest.x, dest.y);
      marker.x = px;
      marker.y = py;
      refreshInteractable(currentHex, interactableMap);
      options.onTravelEnd?.();
      return;
    }

    const from = travelPath[travelStepIndex];
    const to = travelPath[travelStepIndex + 1];
    const { px: fx, py: fy } = hexToPixel(from.x, from.y);
    const { px: tx, py: ty } = hexToPixel(to.x, to.y);
    const t = smoothstep(travelStepProgress);
    marker.x = fx + (tx - fx) * t;
    marker.y = fy + (ty - fy) * t;
  });

  // 11. Camera setup
  const totalMapWidth = mapData.mapWidth * HORIZONTAL_SPACING + HEX_WIDTH * 2;
  const totalMapHeight = mapData.mapHeight * VERTICAL_SPACING + mapData.mapHeight;

  function applyCamera() {
    groundLayer.x = objectLayer.x = markerLayer.x = scrollX;
    groundLayer.y = objectLayer.y = markerLayer.y = scrollY;
  }
  applyCamera();

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  // 12. Pointer interactions
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let totalDragDistSq = 0;

  app.stage.on("pointerdown", (e) => {
    isDragging = true;
    totalDragDistSq = 0;
    dragStart = { x: e.global.x, y: e.global.y };
  });

  app.stage.on("pointermove", (e) => {
    if (!isDragging) return;

    const dx = e.global.x - dragStart.x;
    const dy = e.global.y - dragStart.y;
    totalDragDistSq += dx * dx + dy * dy;

    const minX = app.screen.width - totalMapWidth - PAN_PADDING;
    const maxX = PAN_PADDING;
    const minY = app.screen.height - totalMapHeight - PAN_PADDING;
    const maxY = PAN_PADDING;

    scrollX = totalMapWidth < app.screen.width ? scrollX : Math.max(minX, Math.min(maxX, scrollX + dx));
    scrollY = totalMapHeight < app.screen.height ? scrollY : Math.max(minY, Math.min(maxY, scrollY + dy));

    dragStart = { x: e.global.x, y: e.global.y };
    applyCamera();
  });

  app.stage.on("pointerup", (e) => {
    if (isDragging && totalDragDistSq < DRAG_THRESHOLD_SQ) {
      const worldX = e.global.x - scrollX;
      const worldY = e.global.y - scrollY;
      const tile = findNearestTile(worldX, worldY, tilePositionMap);
      if (tile) void travelToHex(tile);
    }
    isDragging = false;
  });

  app.stage.on("pointerupoutside", () => (isDragging = false));


  async function travelToHex(target: { x: number; y: number }) {
    if (isTraveling || isRequesting) return;
    if (target.x === currentHex.x && target.y === currentHex.y) return;

    const { px: dPx, py: dPy } = hexToPixel(target.x, target.y);
    destMarker.x = dPx;
    destMarker.y = dPy;
    destMarker.visible = true;
    destMarker.alpha = 1;

    isRequesting = true;
    options.onTravelStart?.();

    try {
      const res = await fetch(`${baseUrl}/api/map/travel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playerId,
          x: target.x,
          y: target.y,
          mapId: playerPos.mapId,
        }),
      });

      const result: ServiceResult<null> = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message ?? `Travel failed (${res.status})`);
      }

      const path = bfsPath(currentHex, target, validTileSet);
      if (!path || path.length < 2) {
        currentHex = { ...target };
        marker.x = dPx;
        marker.y = dPy;
        destMarker.visible = false;
        refreshInteractable(currentHex, interactableMap);
        options.onTravelEnd?.();
        return;
      }

      travelPath = path;
      travelStepIndex = 0;
      travelStepProgress = 0;
      isTraveling = true;
      // Leaving the current tile — clear any active interactable right away
      // so the "Enter X" button doesn't linger while the marker is mid-walk.
      if (activeInteractable) {
        activeInteractable = null;
        options.onInteractableChange?.(null);
      }
    } catch (err) {
      destMarker.visible = false;
      const msg = err instanceof Error ? err.message : "Travel failed.";
      options.onTravelError?.(msg);
    } finally {
      isRequesting = false;
    }
  }

  function refreshInteractable(hex: { x: number; y: number; }, map: Map<string, InteractableOfMap>) {
    const interactable = map.get(`${hex.x},${hex.y}`) ?? null;
    // Only fire the callback when the tile's interactable actually changes,
    // to avoid spamming React state updates every ticker frame.
    const isTheSameTile =
      (interactable?.type ?? null) === (activeInteractable?.type ?? null) ||
      interactable?.x === activeInteractable?.x &&
      interactable?.y === activeInteractable?.y;
      
    if (!isTheSameTile) {
      activeInteractable = interactable;
      options.onInteractableChange?.(interactable);
    }
  }

  return {
    app,
    enterInteractable: () => activeInteractable,
  };
}