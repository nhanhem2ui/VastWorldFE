// builderAssetLoader.ts
//
// Generic loader that walks ASSET_MANIFEST and produces one flat registry.
// This is the ONLY place that calls Assets.load. Both the renderer and the
// SQL exporter read from the registry this produces, so they can never
// disagree about which AssetID/SpriteFrame a given tile is.

import { Assets, Spritesheet, Texture } from 'pixi.js';
import { ASSET_MANIFEST, type AssetDef, type FrameDefaults } from './assetManifest';

export type ResolvedAsset = FrameDefaults & {
  assetId: number;
  /** null for 'single' and 'animated' assets — nothing to store per-frame in SQL. */
  spriteFrame: number | null;
  texture?: Texture;
  /** only set for 'animated' assets */
  animationFrames?: { texture: Texture; timeMs: number }[];
};

// key = `${assetId}:${frameKey}` for spritesheet frames, `${assetId}` otherwise
export type AssetRegistry = Map<string, ResolvedAsset>;

let loadPromise: Promise<AssetRegistry> | null = null;

export function registryKey(assetId: number, frameKey?: string): string {
  return frameKey ? `${assetId}:${frameKey}` : `${assetId}`;
}

async function resolveSingle(
  def: Extract<AssetDef, { kind: 'single' }>
): Promise<[string, ResolvedAsset][]> {
  const texture = (await Assets.load(def.path)) as Texture;
  return [[registryKey(def.assetId), { assetId: def.assetId, spriteFrame: null, texture, ...def.defaults }]];
}

async function resolveSpritesheet(
  def: Extract<AssetDef, { kind: 'spritesheet' }>
): Promise<[string, ResolvedAsset][]> {
  const sheet = (await Assets.load(def.path)) as Spritesheet;
  const trim = def.trim ?? 0;

  if (trim > 0) {
    for (const t of Object.values(sheet.textures)) {
      if (t.frame) {
        t.frame.x += trim;
        t.frame.y += trim;
        t.frame.width -= trim * 2;
        t.frame.height -= trim * 2;
        t.update();
      }
    }
  }

  const frameTextures = Object.values(sheet.textures);

  return Object.entries(def.frames).map(([frameKey, frame]) => {
    const texture = frameTextures[frame.frameIndex];
    if (!texture) {
      throw new Error(
        `[assetLoader] "${def.displayName}": no texture at frameIndex ${frame.frameIndex} for frameKey "${frameKey}". ` +
          `Sheet only has ${frameTextures.length} frames.`
      );
    }
    return [
      registryKey(def.assetId, frameKey),
      {
        assetId: def.assetId,
        spriteFrame: frame.frameIndex,
        texture,
        ...def.defaults,
        ...frame,
      },
    ] as [string, ResolvedAsset];
  });
}

async function resolveAnimated(
  def: Extract<AssetDef, { kind: 'animated' }>
): Promise<[string, ResolvedAsset][]> {
  const animationFrames = await Promise.all(
    def.frames.map(async (f) => ({ texture: (await Assets.load(f.path)) as Texture, timeMs: f.timeMs }))
  );
  return [[registryKey(def.assetId), { assetId: def.assetId, spriteFrame: null, animationFrames, ...def.defaults }]];
}

async function loadAll(): Promise<AssetRegistry> {
  const entries = await Promise.all(
    ASSET_MANIFEST.map((def) => {
      if (def.kind === 'single') return resolveSingle(def);
      if (def.kind === 'spritesheet') return resolveSpritesheet(def);
      return resolveAnimated(def);
    })
  );
  return new Map(entries.flat());
}

/**
 * Loads every asset in ASSET_MANIFEST exactly once (cached across calls,
 * so re-mounting the map component doesn't re-fetch everything) and
 * returns the flat registry.
 */
export function loadAssetRegistry(): Promise<AssetRegistry> {
  if (!loadPromise) loadPromise = loadAll();
  return loadPromise;
}

/** Escape hatch for hot-reload / tests where you want to force a fresh load. */
export function resetAssetRegistryCache(): void {
  loadPromise = null;
}