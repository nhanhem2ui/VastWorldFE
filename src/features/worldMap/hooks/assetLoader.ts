import { Assets, Spritesheet, Texture } from "pixi.js";
import { SPRITESHEET_TRIM } from "../types/constaint";
import type { CachedAsset, AssetTile } from "../types/types";

export const assetCache = new Map<string, CachedAsset>();

export async function loadAsset(asset: AssetTile): Promise<void> {
  if (assetCache.has(asset.assetUrl)) return;
  
  const textureOptions = {
      scaleMode: 'nearest', 
      autoGenerateMipmaps: false,    
      antialias: false
  };

  if (asset.isAnimated) {
    const frameDurations = (asset.frameConfig ?? "").split(",");
    const frames: Texture[] = await Promise.all(
      frameDurations.map((_, i) => 
        Assets.load({
          src: `${asset.assetUrl}${i + 1}.png`,
          data: textureOptions 
        })
      )
    );
    assetCache.set(asset.assetUrl, frames);
    return;
  }

  if (asset.assetType === "SPRITESHEET") {
    const sheet = (await Assets.load({
      src: asset.assetUrl,
      data: {
        textureOptions: textureOptions 
      }
    })) as Spritesheet;
    const textures = Object.values(sheet.textures) as Texture[];
    textures.forEach((t) => {
      if (t.frame) {
        t.frame.x += SPRITESHEET_TRIM;
        t.frame.y += SPRITESHEET_TRIM;
        t.frame.width -= SPRITESHEET_TRIM * 2;
        t.frame.height -= SPRITESHEET_TRIM * 2;
        t.update();
      }
    });
    assetCache.set(asset.assetUrl, textures);
    return;
  }

  const tex = await Assets.load({
    src: asset.assetUrl,
    data: textureOptions
  });
  assetCache.set(asset.assetUrl, tex);
}