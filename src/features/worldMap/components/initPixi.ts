// initPixi.ts
import { AnimatedSprite, Application, Assets, Container, Sprite, Spritesheet, Texture } from "pixi.js";
import { initDevtools } from '@pixi/devtools';
import 'pixi.js/gif';

type AssetDefinition = {
  texture: Texture;

  width?: number;
  height?: number;

  anchorX?: number;
  anchorY?: number;

  pivotX?: number;
  pivotY?: number;
};

type SourceGroupConfig = {
  defaults?: Partial<Omit<AssetDefinition, 'texture'>>;
  tiles: Record<string | number, { texture: Texture; [key: string]: any }>;
};
// =========================================================================
// 1. Map & Palette Configurations
// =========================================================================

const fantasyTiles_PALETE = {
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
  DESERT: 24
};

  const grassTex = await Assets.load("../src/shared/assets/img/tiles/green_hexagon.png");
  const treeTex = await Assets.load("../src/shared/assets/img/decorations/Autumn_tree3.png"); 
  const lighterGrass = await Assets.load("../src/shared/assets/img/tiles/lighter_green_hexagon.png");
  const fantasySheet = await Assets.load('../src/shared/assets/img/tiles/fantasyhextiles/fantasyhextiles_v3.json') as Spritesheet;
  const bamboo = await Assets.load("../src/shared/assets/img/decorations/bamboo_1.png");
  const fantasyTiles = Object.values(fantasySheet.textures);
  const cultivatorHome = await Assets.load("../src/shared/assets/img/buildings/cultivator-home.png")
  const blackSmith = await Assets.load("../src/shared/assets/img/buildings/smithingBuilding.png")
  const duckFrame1 = await Assets.load("../src/shared/assets/img/decorations/rubberDuck_1.png");
  const duckFrame2 = await Assets.load("../src/shared/assets/img/decorations/rubberDuck_2.png");
  const duckFrame3 = await Assets.load("../src/shared/assets/img/decorations/rubberDuck_3.png");

//eliminate edge bleeding
const trimAmount = 0.4;
  fantasyTiles.forEach(t => {
    if (t.frame) {
      t.frame.x += trimAmount;
      t.frame.y += trimAmount;
      t.frame.width -= (trimAmount * 2);
      t.frame.height -= (trimAmount * 2);
      t.update(); 
    }
  });

const RawRegistryConfigs: Record<string, SourceGroupConfig> = {
  defaultGrass: {
    defaults: {
      width: 60,
      height: 40
    },
    tiles: {
      grass: { texture: grassTex, width: 60, height: 40 },
      lighter: { texture: lighterGrass, width: 60, height: 40}
    }
  },
  
  fantasy: {
    // 1. Define your shared base definition rules here:
    defaults: {
      width: 60,
      height: 60,
      pivotY: 9
    },
    // 2. Individual tile definitions only need unique details (like textures)
    tiles: {
      [fantasyTiles_PALETE.PLAIN]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.PLAIN] 
      },
      [fantasyTiles_PALETE.PLAIN_FOREST]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.PLAIN_FOREST] 
      },
      [fantasyTiles_PALETE.PLAIN_ROCK]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.PLAIN_ROCK] 
      },     
      [fantasyTiles_PALETE.PLAIN_TREE]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.PLAIN_TREE] 
      },
      [fantasyTiles_PALETE.FOREST_ROCK]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.FOREST_ROCK] 
      },
      [fantasyTiles_PALETE.STONE_WALL]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.STONE_WALL] 
      },
      [fantasyTiles_PALETE.WATER_SHALLOW]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.WATER_SHALLOW] 
      },
      [fantasyTiles_PALETE.WATER_DEEP]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.WATER_DEEP] 
      },
      [fantasyTiles_PALETE.SWAMP_TREE]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SWAMP_TREE] 
      },
      [fantasyTiles_PALETE.SWAMP_PUDDLE]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SWAMP_PUDDLE] 
      },
      [fantasyTiles_PALETE.SWAMP]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SWAMP] 
      },
      [fantasyTiles_PALETE.PLAIN_DARK]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.PLAIN_DARK] 
      },
      [fantasyTiles_PALETE.SNOW]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SNOW] 
      },
      [fantasyTiles_PALETE.SNOW_TREE]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SNOW_TREE] 
      },
      [fantasyTiles_PALETE.SNOW_FOREST]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SNOW_FOREST] 
      },
      [fantasyTiles_PALETE.SNOW_ROCK]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SNOW_ROCK] 
      },
      [fantasyTiles_PALETE.FOREST_SNOW_ROCK]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.FOREST_SNOW_ROCK] 
      },
      [fantasyTiles_PALETE.SNOW_WATER]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.SNOW_WATER] 
      },
      [fantasyTiles_PALETE.DESERT]: { 
        texture: fantasyTiles[fantasyTiles_PALETE.DESERT] 
      },
    }
  }
};

// This will hold the flattened, ready-to-use registry for your loop
const AssetRegistry: Record<string, Record<string | number, AssetDefinition>> = {};

// Process and merge defaults with specific definitions
Object.entries(RawRegistryConfigs).forEach(([sourceKey, group]) => {
  AssetRegistry[sourceKey] = {};
  
  Object.entries(group.tiles).forEach(([tileId, tileData]) => {
    AssetRegistry[sourceKey][tileId] = {
      ...group.defaults,
      ...tileData
    } as AssetDefinition;
  });
});

// Map layout data using explicit asset sources and sizing rules
const customGroundTiles = [
  // { x: 0, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 0, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 0, y: 2, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 0, y: 3, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 0, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 0, y: 5, source: 'defaultGrass', id: 'lighter' },
  { x: 0, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  // { x: 0, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  { x: 0, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 0, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 0, y: 10, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },
  { x: 0, y: 11, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },
  { x: 0, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 0, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_FOREST },
  { x: 0, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_FOREST },


  // { x: 1, y: 0, source: 'defaultGrass', id: 'lighter' },
  // { x: 1, y: 1, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 3, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_ROCK },
  { x: 1, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.FOREST_ROCK },
  // { x: 1, y: 5, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  // { x: 1, y: 7, source: 'defaultGrass', id: 'lighter' },
  // { x: 1, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 1, y: 11, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_TREE },
  { x: 1, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_TREE },
  { x: 1, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  { x: 1, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.FOREST_ROCK },


  // { x: 2, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 2, y: 1, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 2, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 3, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN},
  // { x: 2, y: 5, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK},
  // { x: 2, y: 7, source: 'defaultGrass', id: 'lighter'},
  // { x: 2, y: 8, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 9, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 10, source: 'defaultGrass', id: 'lighter'},
  // { x: 2, y: 11, source: 'defaultGrass', id: 'lighter'},
  { x: 2, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK},
  { x: 2, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.FOREST_ROCK},
  // { x: 2, y: 14, source: 'defaultGrass', id: 'lighter'},


  { x: 3, y: 0, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 1, source: 'defaultGrass', id: 'lighter' },
  // { x: 3, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 4, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 5, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 6, source: 'defaultGrass', id: 'lighter' },
  // { x: 3, y: 7, source: 'defaultGrass', id: 'lighter' },
  // { x: 3, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 10, source: 'defaultGrass', id: 'lighter' },
  // { x: 3, y: 11, source: 'defaultGrass', id: 'lighter' },
  // { x: 3, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 3, y: 14, source: 'defaultGrass', id: 'lighter' },


  // { x: 4, y: 0, source: 'defaultGrass', id: 'lighter' },
  // { x: 4, y: 1, source: 'defaultGrass', id: 'lighter' },
  // { x: 4, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 4, source: 'defaultGrass', id: 'lighter' },
  // { x: 4, y: 5, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 4, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_TREE },
  // { x: 4, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 11, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 4, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },


  { x: 5, y: 0, source: 'defaultGrass', id: 'lighter' },
  // { x: 5, y: 1, source: 'defaultGrass', id: 'lighter' },
  // { x: 5, y: 2, source: 'defaultGrass', id: 'lighter' },
  // { x: 5, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 4, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 5, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 5, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 5, y: 8, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  { x: 5, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 10, source: 'defaultGrass', id: 'lighter' },
  // { x: 5, y: 11, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 5, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },


  // { x: 6, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 6, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 6, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 6, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 6, y: 4, source: 'defaultGrass', id: 'lighter' },
  { x: 6, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 6, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 6, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 6, y: 8, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 6, y: 9, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_ROCK },
  // { x: 6, y: 10, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 6, y: 11, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 6, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 6, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 6, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },


  { x: 7, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_FOREST },
  { x: 7, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  // { x: 7, y: 2, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 7, y: 3, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 7, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 7, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 7, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 7, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 7, y: 8, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 7, y: 9, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 7, y: 10, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 7, y: 11, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 7, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_DARK },
  { x: 7, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 7, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },


  { x: 8, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN_FOREST },
  { x: 8, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 8, y: 2, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 8, y: 3, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 8, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 8, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 8, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 8, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 8, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 8, y: 9, source: 'defaultGrass', id: 'lighter' },
  // { x: 8, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 8, y: 11, source: 'defaultGrass', id: 'lighter' },
  { x: 8, y: 12, source: 'defaultGrass', id: 'lighter' },
  // { x: 8, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 8, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },


  { x: 9, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 9, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 9, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 9, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 9, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 9, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.WATER_DEEP },
  { x: 9, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  // { x: 9, y: 8, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 9, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 10, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 11, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 12, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 13, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 9, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },


  { x: 10, y: 0, source: 'defaultGrass', id: 'lighter' },
  // { x: 10, y: 1, source: 'defaultGrass', id: 'lighter' },
  // { x: 10, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 4, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 10, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 10, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.WATER_SHALLOW },
  { x: 10, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 11, source: 'defaultGrass', id: 'lighter' },
  // { x: 10, y: 12, source: 'defaultGrass', id: 'lighter' },
  // { x: 10, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 10, y: 14, source: 'defaultGrass', id: 'lighter' },


  { x: 11, y: 0, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 1, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 3, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 4, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 5, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 6, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 7, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 10, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 11, source: 'defaultGrass', id: 'lighter' },
  // { x: 11, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 11, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },


  { x: 12, y: 0, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 1, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 2, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 3, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 4, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 5, source: 'defaultGrass', id: 'lighter' },
  // { x: 12, y: 6, source: 'defaultGrass', id: 'lighter' },
  // { x: 12, y: 7, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 11, source: 'defaultGrass', id: 'lighter' },
  // { x: 12, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 12, y: 14, source: 'fantasy', id: fantasyTiles_PALETE.DESERT },


  { x: 13, y: 0, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 1, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 2, source: 'defaultGrass', id: 'lighter' },
  // { x: 13, y: 3, source: 'defaultGrass', id: 'lighter' },
  // { x: 13, y: 4, source: 'defaultGrass', id: 'lighter' },
  // { x: 13, y: 5, source: 'defaultGrass', id: 'lighter' },
  // { x: 13, y: 6, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 7, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 8, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 9, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 10, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 11, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 12, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 13, y: 14, source: 'defaultGrass', id: 'lighter' },


  // { x: 14, y: 0, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 1, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 2, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 3, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 4, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 5, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 6, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 7, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 8, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 9, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  // { x: 14, y: 10, source: 'fantasy', id: fantasyTiles_PALETE.PLAIN },
  { x: 14, y: 11, source: 'defaultGrass', id: 'lighter' },
  { x: 14, y: 12, source: 'defaultGrass', id: 'lighter'},
  { x: 14, y: 13, source: 'defaultGrass', id: 'lighter' },
  { x: 14, y: 14, source: 'defaultGrass', id: 'lighter' },
];

const treePositions = [
  { x: 3, y: 0 },
  // { x: 7, y: 5 }
];

const cultivatorHomePosition = [{x: 9, y: 3}];

const bambooPosition = [
  { x: 5, y: 0 },
  {x: 6, y: 4},
  {x: 6, y: 3},
  {x: 7, y: 3},
]

const blackSmithPosition = {x: 4, y: 10};

const rubberDuckPosition = [
    { x: 6, y: 5 },
]
export async function initPixi(containerElement: HTMLDivElement) {
  const app = new Application();

  await app.init({
    background: "#1d1d1d",
    resizeTo: containerElement,
    antialias: false
  });

  initDevtools({ app });

  app.renderer.canvas.style.imageRendering = "pixelated";
  containerElement.appendChild(app.canvas);

  // =========================================================================
  // Editor & Layout Constants
  // =========================================================================
  const HEX_WIDTH = 60;
  const HEX_HEIGHT = 40;

  const HORIZONTAL_SPACING = HEX_WIDTH * 0.77; 
  const VERTICAL_SPACING = HEX_HEIGHT * 0.89;

  const MAP_WIDTH = 15;  
  const MAP_HEIGHT = 15;

  let scrollX = 100;
  let scrollY = 50;

  const groundLayer = new Container();
  const objectLayer = new Container();
  
  app.stage.addChild(groundLayer);
  app.stage.addChild(objectLayer);

  // =========================================================================
  // Map Generation Loop
  // =========================================================================
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      
      let pixelX = x * HORIZONTAL_SPACING;
      let pixelY = y * VERTICAL_SPACING;
      
      if (x % 2 === 1) {
        pixelY += VERTICAL_SPACING / 2;
      }

      pixelX = Math.round((pixelX + Number.EPSILON) * 100) / 100;
      pixelY = Math.round((pixelY + Number.EPSILON) * 100) / 100;


      // 2. Fetch ground configuration rule matching coordinates
      const customTile = customGroundTiles.find(t => t.x === x && t.y === y);
      let asset = AssetRegistry.defaultGrass.grass;

      if (customTile) {
        asset = AssetRegistry[customTile.source]?.[customTile.id] ?? asset;
      }

      // 3. Create single unified instance generator pass
      const groundTile = new Sprite(asset.texture);

      groundTile.anchor.set(
        asset.anchorX ?? 0.5,
        asset.anchorY ?? 0.5
      );

      groundTile.x = pixelX;
      groundTile.y = pixelY;

      groundTile.width = asset.width ?? HEX_WIDTH;
      groundTile.height = asset.height ?? HEX_HEIGHT;

      groundTile.pivot.set(
        asset.pivotX ?? 0,
        asset.pivotY ?? 0
      );

      groundLayer.addChild(groundTile);


      const hasTree = treePositions.some(t => t.x === x && t.y === y);
      if (hasTree) {
        const tree = new Sprite(treeTex);
        tree.anchor.set(0.5, 0.5); 
        tree.x = pixelX;
        tree.y = pixelY; 
        objectLayer.addChild(tree);
      }

      const hasBamboo = bambooPosition.some(t => t.x === x && t.y === y);
      if (hasBamboo) {
        const tree = new Sprite(bamboo);
        tree.anchor.set(0.5, 0.5); 
        tree.x = pixelX;
        tree.y = pixelY;
        objectLayer.addChild(tree);
      }
      
      if(blackSmithPosition !== null && blackSmithPosition.x == x && blackSmithPosition.y === y){
        const tree = new Sprite(blackSmith);
        tree.anchor.set(0.5, 0.5); 
        tree.x = pixelX;
        tree.y = pixelY;
        objectLayer.addChild(tree);
      }

      const hasCultivatorHome = cultivatorHomePosition.some(t => t.x === x && t.y === y);
      if (hasCultivatorHome) {
        const tree = new Sprite(cultivatorHome);
        tree.anchor.set(0.5, 0.5); 
        tree.x = pixelX;
        tree.y = pixelY;
        objectLayer.addChild(tree);
      }

      const hasRubberDuck = rubberDuckPosition.some(b => b.x === x && b.y === y);
if (hasRubberDuck) {
  // Pass an options object to the constructor instead of a direct array
  const duck = new AnimatedSprite({
    textures: [
      { texture: duckFrame1, time: 200 },
      { texture: duckFrame2, time: 200 },
      { texture: duckFrame3, time: 1000 },
    ]
  });
  
  duck.anchor.set(0.5, 0.5);
  duck.x = pixelX;
  duck.y = pixelY;
  duck.width = 32 / 2;
  duck.height = 32 / 2;

  duck.play();

  objectLayer.addChild(duck);
}
    }
  }

  // Depth Sorting Execution
  function sortGameObjects() {
    objectLayer.children.sort((a, b) => a.y - b.y);
  }
  sortGameObjects();

  function applyCamera() {
    groundLayer.x = objectLayer.x = scrollX;
    groundLayer.y = objectLayer.y = scrollY;
  }
  applyCamera();

  // Interactivity & Panning System
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  app.stage.on("pointerdown", (e) => {
    isDragging = true;
    dragStart = { x: e.global.x, y: e.global.y };
  });

  app.stage.on("pointermove", (e) => {
    if (!isDragging) return;

    const deltaX = e.global.x - dragStart.x;
    const deltaY = e.global.y - dragStart.y;

    const totalMapWidth = MAP_WIDTH * HORIZONTAL_SPACING + (HEX_WIDTH * 2);
    const totalMapHeight = MAP_HEIGHT * VERTICAL_SPACING + MAP_HEIGHT;

    const padding = 300; 
    const minX = app.screen.width - totalMapWidth - padding;
    const maxX = padding;

    const minY = app.screen.height - totalMapHeight - padding;
    const maxY = padding;

    let targetX = scrollX + deltaX;
    let targetY = scrollY + deltaY;

    scrollX = totalMapWidth < app.screen.width ? scrollX : Math.max(minX, Math.min(maxX, targetX));
    scrollY = totalMapHeight < app.screen.height ? scrollY : Math.max(minY, Math.min(maxY, targetY));

    dragStart = { x: e.global.x, y: e.global.y };
    applyCamera();
  });

  app.stage.on("pointerup", () => isDragging = false);
  app.stage.on("pointerupoutside", () => isDragging = false);

  function generateSql(mapId: number) {
  const customLookup = new Map(
    customGroundTiles.map(t => [`${t.x},${t.y}`, t])
  );

  const sql: string[] = [];

  sql.push(`DELETE FROM MapTiles WHERE MapID = ${mapId};`);
  sql.push("");

  let first = true;

  for (let x = 0; x < MAP_WIDTH; x++) {
    for (let y = 0; y < MAP_HEIGHT; y++) {

      const tile = customLookup.get(`${x},${y}`);

      let assetId: number = 5;
      let spriteFrame: number | null = null;

      if (tile) {
        if (tile.source === "fantasy") {
          assetId = 4;
          spriteFrame = Number(tile.id);
        } else if (tile.source === "defaultGrass") {
          if (tile.id === "lighter") {
            assetId = 7;
          }
        }
      }
      if(first == true){
      sql.push(
        `INSERT INTO MapTiles (MapID,X,Y,AssetID,SpriteFrame) VALUES (${mapId},${x},${y},${assetId ?? "NULL"},${spriteFrame ?? "NULL"})`
      );
      first = false;
    }
    else{
        sql.push(
        `,(${mapId},${x},${y},${assetId ?? "NULL"},${spriteFrame ?? "NULL"})`
      );
    }
    }
  }
  sql.push("GO", "");
  
  return sql.join("\n");
}

return {
  app,
  generateSql
};
}