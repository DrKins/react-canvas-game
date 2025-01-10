import { useEffect, useRef } from "react";
import { intersectsRect, randomIntFromInterval } from "../utils";
import { SpriteSheet } from "../utils/createSpriteSheet";

interface ObjectStats {
  x: number;
  y: number;
  id: number;
}

interface CanvasInformations {
  mapTotalCols: number;
  mapTotalRows: number;
  centerTilePerRow: number;
  centerTilePerCol: number;
  score: number;
}

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasGlobalInformations = useRef<CanvasInformations>({
    mapTotalRows: Math.ceil(window.innerWidth / 64),
    mapTotalCols: Math.ceil(window.innerHeight / 64),
    centerTilePerRow: Math.ceil(window.innerWidth / 64 / 2),
    centerTilePerCol: Math.ceil(window.innerHeight / 64 / 2),
    score: 0,
  });

  const backgroundRef = useRef<number[][] | null>(
    Array.from({ length: canvasGlobalInformations.current.mapTotalCols }, () =>
      Array.from(
        { length: canvasGlobalInformations.current.mapTotalRows },
        (_, i) =>
          i >= canvasGlobalInformations.current.centerTilePerRow - 1 &&
          i <= canvasGlobalInformations.current.centerTilePerRow + 1
            ? 2
            : 1,
      ),
    ),
  );
  const playerRef = useRef<ObjectStats>({
    x: window.innerWidth / 2,
    y: window.innerHeight,
    id: Date.now(),
  });

  const coinRef = useRef<ObjectStats[]>([]);

  let animationId: number | null = null;

  // Background sprite sheet
  const backgroundSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/field.png",
    spriteWidth: 64,
    spriteHeight: 64,
    totalCols: 8,
    totalRows: 8,
    scale: 1,
    spawnInterval: 0,
    currentFrame: 0,
    lastFrame: 64,
    lastFrameTime: 0,
    movementSpeed: 0,
  });

  // Player sprite sheet
  const playerSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/player.png",
    spriteWidth: 32,
    spriteHeight: 32,
    totalCols: 1,
    totalRows: 24,
    scale: 2,
    spawnInterval: 100,
    currentFrame: 18,
    lastFrame: 24,
    lastFrameTime: 0,
    movementSpeed: 32,
  });

  // Coin sprite sheet
  const coinSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/coin.png",
    spriteWidth: 16,
    spriteHeight: 16,
    totalCols: 1,
    totalRows: 8,
    scale: 2,
    spawnInterval: 100,
    currentFrame: 0,
    lastFrame: 8,
    lastFrameTime: 0,
    movementSpeed: 0,
  });

  const updateCoin = (timestamp: number) => {
    coinRef.current.forEach((coin, index) => {
      const isColliding = intersectsRect({
        rect1: {
          x: playerRef.current.x,
          y: playerRef.current.y,
          width:
            playerSpriteSheetInstance.spriteWidth *
            playerSpriteSheetInstance.scale,
          height:
            playerSpriteSheetInstance.spriteHeight *
            playerSpriteSheetInstance.scale,
        },
        rect2: {
          x: coin.x,
          y: coin.y,
          width:
            coinSpriteSheetInstance.spriteWidth * coinSpriteSheetInstance.scale,
          height:
            coinSpriteSheetInstance.spriteHeight *
            coinSpriteSheetInstance.scale,
        },
      });

      if (
        coin.y >
          (canvasRef.current as HTMLCanvasElement).height -
            coinSpriteSheetInstance.spriteHeight * 2 ||
        isColliding
      )
        coinRef.current.splice(index, 1);

      if (isColliding) canvasGlobalInformations.current.score += 1;

      coin.y += 1; // Move the coin downwards
      coinSpriteSheetInstance.updateCurrentFrame(timestamp);
    });
  };

  const updateBackground = (timestamp: number) => {
    //TODO: add custom path generation
  };

  const updatePlayer = (timestamp: number) => {
    if (
      playerRef.current.y >
      (canvasRef.current as HTMLCanvasElement).height -
        playerSpriteSheetInstance.spriteHeight * 6
    ) {
      playerRef.current.y = playerRef.current.y - 0.5;
    }

    playerSpriteSheetInstance.updateCurrentFrame(timestamp);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const backgroundArray = backgroundRef.current as number[][];
    for (let col = 0; col < backgroundArray.length; col++) {
      for (let row = 0; row < backgroundArray[col].length; row++) {
        const tileIndex = backgroundArray[col][row];
        const x = row * backgroundSpriteSheetInstance.spriteWidth;
        const y = col * backgroundSpriteSheetInstance.spriteHeight;

        const spriteX = tileIndex > 0 && tileIndex < 2 ? 64 : 0;
        const spriteY = tileIndex > 1 ? 128 : 0;

        backgroundSpriteSheetInstance.draw({
          ctx,
          x,
          y,
          spriteX,
          spriteY,
        });
      }
    }
  };

  const drawCoin = (ctx: CanvasRenderingContext2D) => {
    coinRef.current.forEach((coin) =>
      coinSpriteSheetInstance.draw({ ctx, x: coin.x, y: coin.y }),
    );
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    playerSpriteSheetInstance.draw({
      ctx,
      x: playerRef.current.x,
      y: playerRef.current.y,
    });
  };

  const update = (timestamp: number) => {
    updatePlayer(timestamp);
    updateCoin(timestamp);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    drawBackground(ctx);
    drawCoin(ctx);
    drawPlayer(ctx);
  };

  const animate = (timestamp: number, ctx: CanvasRenderingContext2D) => {
    update(timestamp);
    draw(ctx);

    animationId = requestAnimationFrame((timestamp) => animate(timestamp, ctx));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!ctx) return;

    animationId = requestAnimationFrame((timestamp) => animate(timestamp, ctx));

    const coinInterval = setInterval(() => {
      const x = 64 * canvasGlobalInformations.current.centerTilePerRow! + 1;
      const y = randomIntFromInterval(0, playerRef.current.y - 64); // Spawn in front of player

      coinRef.current.push({ x, y, id: Date.now() });
    }, 1000);

    return () => {
      cancelAnimationFrame(animationId as number);
      clearInterval(coinInterval);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};
