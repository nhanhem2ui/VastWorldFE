// initPixi.ts
//
// Now a thin orchestrator: load assets, render tiles/objects from mapData,
// handle camera panning. Asset loading lives in assetLoader.ts, map content
// in mapData.ts, SQL export in sqlExport.ts.

import { AnimatedSprite, Application, Container, Sprite } from 'pixi.js';
import { initDevtools } from '@pixi/devtools';
import 'pixi.js/gif';

import { loadAssetRegistry, registryKey, type ResolvedAsset } from '../hooks/builderAssetLoader';
import { GROUND_TILES, DEFAULT_GROUND_TILE, OBJECT_PLACEMENTS, MAP_WIDTH, MAP_HEIGHT } from '../hooks/mapData';
import { generateGroundSql, generateObjectSql, generateMapSql } from '../hooks/sqlExport';

const HEX_WIDTH = 60;
const HEX_HEIGHT = 40;
const HORIZONTAL_SPACING = HEX_WIDTH * 0.77;
const VERTICAL_SPACING = HEX_HEIGHT * 0.89;

function hexToPixel(x: number, y: number) {
  const rawX = x * HORIZONTAL_SPACING;
  const rawY = y * VERTICAL_SPACING + (x % 2 === 1 ? VERTICAL_SPACING / 2 : 0);
  return {
    x: Math.round((rawX + Number.EPSILON) * 100) / 100,
    y: Math.round((rawY + Number.EPSILON) * 100) / 100,
  };
}

function applyLayout(sprite: Sprite | AnimatedSprite, asset: ResolvedAsset) {
  sprite.anchor.set(asset.anchorX ?? 0.5, asset.anchorY ?? 0.5);
  if (asset.width != null) sprite.width = asset.width;
  if (asset.height != null) sprite.height = asset.height;
  sprite.pivot.set(asset.pivotX ?? 0, asset.pivotY ?? 0);
}

function makeSprite(asset: ResolvedAsset): Sprite | AnimatedSprite {
  if (asset.animationFrames) {
    const sprite = new AnimatedSprite({
      textures: asset.animationFrames.map((f) => ({ texture: f.texture, time: f.timeMs })),
    });
    sprite.play();
    applyLayout(sprite, asset);
    return sprite;
  }
  if (!asset.texture) {
    throw new Error(`[initPixi] resolved asset (assetId=${asset.assetId}) has neither a texture nor animationFrames`);
  }
  const sprite = new Sprite(asset.texture);
  applyLayout(sprite, asset);
  return sprite;
}

export async function initPixi(containerElement: HTMLDivElement) {
  const registry = await loadAssetRegistry();

  const app = new Application();
  await app.init({ background: '#1d1d1d', resizeTo: containerElement, antialias: false });

  initDevtools({ app });
  app.renderer.canvas.style.imageRendering = 'pixelated';
  containerElement.appendChild(app.canvas);

  let scrollX = 100;
  let scrollY = 50;

  const groundLayer = new Container();
  const objectLayer = new Container();
  app.stage.addChild(groundLayer);
  app.stage.addChild(objectLayer);

  // ---- ground layer -------------------------------------------------------
  const groundLookup = new Map(GROUND_TILES.map((t) => [`${t.x},${t.y}`, t]));

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = groundLookup.get(`${x},${y}`) ?? { x, y, ...DEFAULT_GROUND_TILE };
      const asset = registry.get(registryKey(tile.assetId, tile.frameKey));
      if (!asset) {
        console.warn(`[initPixi] missing asset for ground tile (${x},${y})`, tile);
        continue;
      }
      const { x: pixelX, y: pixelY } = hexToPixel(x, y);
      const sprite = makeSprite(asset);
      sprite.x = pixelX;
      sprite.y = pixelY;
      groundLayer.addChild(sprite);
    }
  }

  // ---- object layer (decorations, buildings, npcs, etc.) ------------------
  for (const placement of OBJECT_PLACEMENTS) {
    const asset = registry.get(registryKey(placement.assetId, placement.frameKey));
    if (!asset) {
      console.warn('[initPixi] missing asset for object placement', placement);
      continue;
    }
    const { x: pixelX, y: pixelY } = hexToPixel(placement.x, placement.y);
    const sprite = makeSprite(asset);
    sprite.x = pixelX;
    sprite.y = pixelY;
    objectLayer.addChild(sprite);
  }

  objectLayer.children.sort((a, b) => a.y - b.y);

  function applyCamera() {
    groundLayer.x = objectLayer.x = scrollX;
    groundLayer.y = objectLayer.y = scrollY;
  }
  applyCamera();

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  app.stage.on('pointerdown', (e) => {
    isDragging = true;
    dragStart = { x: e.global.x, y: e.global.y };
  });

  app.stage.on('pointermove', (e) => {
    if (!isDragging) return;

    const deltaX = e.global.x - dragStart.x;
    const deltaY = e.global.y - dragStart.y;

    const totalMapWidth = MAP_WIDTH * HORIZONTAL_SPACING + HEX_WIDTH * 2;
    const totalMapHeight = MAP_HEIGHT * VERTICAL_SPACING + MAP_HEIGHT;

    const padding = 300;
    const minX = app.screen.width - totalMapWidth - padding;
    const maxX = padding;
    const minY = app.screen.height - totalMapHeight - padding;
    const maxY = padding;

    const targetX = scrollX + deltaX;
    const targetY = scrollY + deltaY;

    scrollX = totalMapWidth < app.screen.width ? scrollX : Math.max(minX, Math.min(maxX, targetX));
    scrollY = totalMapHeight < app.screen.height ? scrollY : Math.max(minY, Math.min(maxY, targetY));

    dragStart = { x: e.global.x, y: e.global.y };
    applyCamera();
  });

  app.stage.on('pointerup', () => (isDragging = false));
  app.stage.on('pointerupoutside', () => (isDragging = false));

  return {
    app,
    generateGroundSql: (mapId: number) => generateGroundSql(mapId, registry),
    generateObjectSql: (mapId: number) => generateObjectSql(mapId, registry),
    generateSql: (mapId: number) => generateMapSql(mapId, registry), // ground + objects combined
  };
}