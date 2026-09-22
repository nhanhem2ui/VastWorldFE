import {
    Application,
    Assets,
    Container,
    Graphics,
    NineSliceSprite,
    Sprite,
    Text,
    TextStyle,
    Texture,
    Ticker,
} from "pixi.js";
import type {
    DecorationsOfRegion,
    GetPlayerRegionResponse,
    GetRegionResponse,
    RegionComponentHandle,
    RegionComponentOptions,
} from "../types/types";
import type { ServiceResult } from "@/types/ServiceResult";
import { getAuthToken } from "@/shared/hooks/authSession";

const textureCache = new Map<string, Texture>();

async function loadTexture(url: string): Promise<Texture> {
    const cached = textureCache.get(url);
    if (cached) return cached;

    const texture = await Assets.load<Texture>({
        src: url,
        data: {
            scaleMode: "nearest",
            autoGenerateMipmaps: false,
            antialias: false,
        },
    });

    textureCache.set(url, texture);
    return texture;
}

async function createNineSliceTextBox(
    decoration: DecorationsOfRegion,
    onClick?: (decoration: DecorationsOfRegion) => void
): Promise<Container> {
    const {
        label,
        x,
        y,
        width,
        height,
        topHeight,
        rightWidth,
        bottomHeight,
        leftWidth,
        backgroundTexture,
        textColor,
    } = decoration;

    const texture = await loadTexture(backgroundTexture);

    const container = new Container();
    container.position.set(x, y);

    const background = new NineSliceSprite({
        texture,
        width,
        height,
        leftWidth,
        topHeight,
        rightWidth,
        bottomHeight,
    });

    const style = new TextStyle({
        fontFamily: "fangsong",
        fontSize: 20,
        fill: textColor.startsWith("#") ? textColor : `#${textColor}`,
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: width - leftWidth - rightWidth,
    });

    const text = new Text({ text: label, style });
    text.x = leftWidth;

    const innerHeight = height - topHeight - bottomHeight;
    text.y = topHeight + (innerHeight - text.height) / 2;

    container.addChild(background);
    container.addChild(text);

    // Clickable — click handler wiring only, action is not implemented yet.
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointertap", () => onClick?.(decoration));

    return container;
}

function createPlayerMarker(decoration: DecorationsOfRegion): Container {
    const marker = new Container();

    // Anchor position above target
    marker.position.set(
        decoration.x + decoration.width / 2,
        decoration.y - 12
    );

    // 1. Ground Drop Shadow
    const shadow = new Graphics()
        .ellipse(0, 0, 14, 5)
        .fill({ color: 0x000000, alpha: 0.25 });

    // 2. Pulse Ring (Moved down near ground level)
    const ring = new Graphics()
        .ellipse(0, 0, 14, 6)
        .stroke({ width: 2.5, color: 0xffd54f });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    ring.y = 0;

    // 3. Elongated Map Pin
    const pin = new Graphics();
    pin.y = -36; // Raised slightly to accommodate longer body
    
    // Elongated teardrop pointing down to (0, 22) relative to pin origin
    pin.beginPath()
       .arc(0, -10, 11, Math.PI * 0.82, Math.PI * 0.18, false)
       .lineTo(0, 15) 
       .closePath()
       .fill({ color: 0xffb300 })
       .stroke({ width: 2, color: 0xffe082 });

    // 4. Pin Core Gem
    const core = new Graphics()
        .circle(0, 0, 4.5)
        .fill({ color: 0xffffff });
    core.y = -46; // Center inside the raised pin head

    // Assembly
    marker.addChild(shadow);
    marker.addChild(ring);
    marker.addChild(pin);
    marker.addChild(core);

    marker.zIndex = 1000;

    // Animation variables
    const startY = marker.y;
    let time = Math.random() * Math.PI * 2;

    const animate = () => {
        time += 0.02;

        // Smooth floating motion
        const floatOffset = Math.sin(time) * 5;
        marker.y = startY + floatOffset;

        // Shadow scales inverse to float height
        const shadowScale = 1 - (floatOffset / 15);
        shadow.scale.set(shadowScale, shadowScale);
        shadow.alpha = 0.25 * shadowScale;

        // Pulse ring expanding at ground level
        const pulse = (Math.sin(time* 2) + 1) / 2;
        ring.scale.set(1 + pulse * 0.8);
        ring.alpha = 1 - pulse;

        // Gentle core pulse
        core.scale.set(0.9 + Math.sin(time * 3) * 0.15);
    };

    // Attach animation loop
    Ticker.shared.add(animate);

    // Clean up memory on destroy
    marker.on('destroyed', () => {
        Ticker.shared.remove(animate);
    });

    return marker;
}

export async function regionComponent(
    containerElement: HTMLDivElement,
    playerId: string,
    options: RegionComponentOptions = {}
): Promise<RegionComponentHandle> {
    const { onDecorationClick, onError } = options;

    const app = new Application();

    await app.init({
        background: "#1d1d1d",
        resizeTo: containerElement,
        antialias: false,
    });

    containerElement.appendChild(app.canvas);

    const backgroundLayer = new Container();
    const decorationLayer = new Container();
    const markerLayer = new Container();

    app.stage.addChild(backgroundLayer);
    app.stage.addChild(decorationLayer);
    app.stage.addChild(markerLayer);

    try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = getAuthToken();

        const playeRegionRes = await fetch(`${baseUrl}/api/region/player/${playerId}`,{
            method: "GET",
            headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
            }
        });
          const playerRegionResponse: ServiceResult<GetPlayerRegionResponse> = await playeRegionRes.json();
        
          if (!playerRegionResponse.success || !playerRegionResponse.data) {
            throw new Error(playerRegionResponse.message ?? "Failed to load player region");
          }
        
          const playerRegion = playerRegionResponse.data;


        const regionRes = await fetch(`${baseUrl}/api/region/${playerRegion.regionId}`,{
            method: "GET",
            headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
            }
        });
        
        const regionResponse : ServiceResult<GetRegionResponse> = await regionRes.json();

        if (!regionResponse.success || !regionResponse.data) {
            throw new Error(regionResponse.message ?? "Failed to load player region");
        }

        const region = regionResponse.data;

        const backgroundTexture = await loadTexture(region.backgroundImage);
        const bgSprite = new Sprite(backgroundTexture);
        bgSprite.position.set(0, 0);
        bgSprite.width = region.width;
        bgSprite.height = region.height;
        backgroundLayer.addChild(bgSprite);

        for (const decoration of region.regionDecorations) {
            const box = await createNineSliceTextBox(decoration, onDecorationClick);
            decorationLayer.addChild(box);

            if (decoration.mapId === playerRegion.mapId) {
                markerLayer.addChild(createPlayerMarker(decoration));
            }
        }
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Failed to load region.";
        onError?.(message);
        console.error("[Region] load error:", err);
    }

    return { app };
}