import {
    Application,
    Assets,
    Container,
    NineSliceSprite,
    Sprite,
    Text,
    TextStyle,
    Texture,
} from "pixi.js";

interface TextBoxOptions {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    leftWidth?: number;
    topHeight?: number;
    rightWidth?: number;
    bottomHeight?: number;
}

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
    textureUrl: string,
    textString: string,
    textColor: string,
    options: TextBoxOptions = {}
): Promise<Container> {

    const {
        width = 300,
        height = 60,
        x = 0,
        y = 0,
        leftWidth = 15,
        topHeight = 15,
        rightWidth = 15,
        bottomHeight = 15,
    } = options;

    if (!textColor.startsWith("#")) {
        textColor = "#" + textColor;
    }

    const texture = await loadTexture(textureUrl);

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
        fill: textColor,
        fontWeight: "bold",
        wordWrap: true,
        wordWrapWidth: width - leftWidth - rightWidth,
    });

    const text = new Text({
        text: textString,
        style,
    });

    text.x = leftWidth;

    const innerHeight = height - topHeight - bottomHeight;
    text.y = topHeight + (innerHeight - text.height) / 2;

    container.addChild(background);
    container.addChild(text);

    return container;
}

export async function regionPixi(containerElement: HTMLDivElement) {

    const app = new Application();

    await app.init({
        background: "#1d1d1d",
        resizeTo: containerElement,
        antialias: false,
    });

    containerElement.appendChild(app.canvas);

    const backgroundLayer = new Container();
    const decorationLayer = new Container();

    app.stage.addChild(backgroundLayer);
    app.stage.addChild(decorationLayer);

    //---------------------------------------
    // Background
    //---------------------------------------

    const backgroundTexture = await loadTexture(
        "/src/shared/assets/img/places/Region1.png"
    );

    const bgSprite = new Sprite(backgroundTexture);

    bgSprite.position.set(0, 0);
    bgSprite.width = 800;
    bgSprite.height = 600;
    backgroundLayer.addChild(bgSprite);

    //---------------------------------------
    // UI Boxes
    //---------------------------------------

    const thonThuyTruc = await createNineSliceTextBox(
        "/src/shared/assets/img/banners/db_h_green.png",
        "Thôn Thúy Trúc",
        "#FFFDD0",
        {
            width: 250,
            height: 50,
            x: 10,
            y: 500,
            topHeight: 35,
            rightWidth: 45,
            bottomHeight: 27,
            leftWidth: 27,
        }
    );

    decorationLayer.addChild(thonThuyTruc);

    const hongTranThanh = await createNineSliceTextBox(
        "/src/shared/assets/img/banners/db_h_red.png",
        "Hồng Trấn Thành",
        "#45270c",
        {
            width: 250,
            height: 75,
            x: 10,
            y: 160,
            topHeight: 35,
            rightWidth: 45,
            bottomHeight: 27,
            leftWidth: 27,
        }
    );

    decorationLayer.addChild(hongTranThanh);

    const yenvuucoc = await createNineSliceTextBox(
        "/src/shared/assets/img/banners/db_h_white.png",
        "Yên Vụ U Cốc",
        "#FFFFFF",
        {
            width: 250,
            height: 50,
            x: 530,
            y: 530,
            topHeight: 35,
            rightWidth: 45,
            bottomHeight: 27,
            leftWidth: 27,
        }
    )

    decorationLayer.addChild(yenvuucoc);

    const kinhloilinh = await createNineSliceTextBox(
        "/src/shared/assets/img/banners/db_h_purple.png",
        "Kinh Lôi Lĩnh",
        "#FFFFFF",
        {
            width: 250,
            height: 70,
            x: 530,
            y: 240,
            topHeight: 30,
            rightWidth: 45,
            bottomHeight: 16,
            leftWidth: 27,
        }
    )

    decorationLayer.addChild(kinhloilinh);

    const regionLabel = await createNineSliceTextBox(
        "/src/shared/assets/img/banners/db_chcheng_ltng.png",
        "Thanh Vân Châu",
        "#FFFFFF",
        {
            width: 250,
            height: 100,
            x: 250,
            y: 0,
            topHeight: 31,
            rightWidth: 51,
            bottomHeight: 29,
            leftWidth: 95,
        }
    )

    decorationLayer.addChild(regionLabel);

    return app;
}