import { AnimatedSprite, Container, Graphics, Sprite, Texture } from "pixi.js";
import { assetCache } from "./assetLoader";
import type { TileOfMaps } from "../types/types";

export function createSprite(tile: TileOfMaps): Sprite | AnimatedSprite {
  const { asset } = tile;
  const cached = assetCache.get(asset.assetUrl)!;

  let obj: Sprite | AnimatedSprite;

  if (asset.isAnimated) {
    const frames = cached as Texture[];
    const durations = (asset.frameConfig ?? "").split(",").map(Number);
    obj = new AnimatedSprite({
      textures: frames.map((tex, i) => ({
        texture: tex,
        time: durations[i] ?? 200,
      })),
    });
    (obj as AnimatedSprite).play();
  } else if (asset.assetType === "SPRITESHEET") {
    obj = new Sprite((cached as Texture[])[tile.spriteFrame]);
  } else {
    obj = new Sprite(cached as Texture);
  }

  obj.anchor.set(0.5, 0.5);
  obj.width = asset.width;
  obj.height = asset.height;
  obj.pivot.set(tile.asset.offsetX, tile.asset.offsetY);
  return obj;
}

export function createPlayerMarker(imageTexture?: Texture): Container {
  const container = new Container();
  const g = new Graphics();
  
  const gold = 0xd4a843;
  const white = 0xffffff;
  const shadow = 0x000000;
  
  // 1. Draw the pin background
  g.ellipse(0, 12, 12, 4).fill({ color: shadow, alpha: 0.4 });
  g.moveTo(-10, -5).lineTo(10, -5).lineTo(0, 12).closePath().fill({ color: gold });
  g.circle(0, -17, 15).fill({ color: gold });
  g.circle(0, -17, 12).stroke({ color: white, width: 2.5 });
  
  container.addChild(g);

  // 2. Add the image if provided, otherwise fallback to the white dot
  if (imageTexture) {
    const avatar = new Sprite(imageTexture);
    avatar.anchor.set(0.5);
    avatar.x = 0;
    avatar.y = -17;
    // Size the image to fit beautifully inside the 12px radius (24px diameter) circle
    avatar.width = 20; 
    avatar.height = 20;

    // Create a circular mask so the image doesn't bleed out of the pin head
    const mask = new Graphics();
    mask.circle(0, -17, 10.5).fill({ color: 0xffffff }); // slightly smaller than 12 to respect borders
    
    avatar.mask = mask;
    
    container.addChild(mask);
    container.addChild(avatar);
  } else {
    // Fallback: Default white dot if no image is passed
    g.circle(0, -17, 5).fill({ color: white });
  }

  return container;
}

export function createDestinationRing(): Graphics {
  const g = new Graphics();
  const gold = 0xd4a843;
  const white = 0xffffff;

  g.ellipse(0, 4, 9, 3).fill({ color: 0x000000, alpha: 0.3 });
  g.circle(0, 0, 13).stroke({ color: gold, width: 2 });
  g.circle(0, 0, 7).stroke({ color: white, width: 1.5, alpha: 0.7 });
  g.circle(0, 0, 3).fill({ color: gold });

  return g;
}