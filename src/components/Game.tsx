import { useEffect, useRef } from "react";
import { SpriteSheet } from "../utils/createSpriteSheet";

interface PlayerStats {
  x: number;
  y: number;
  id: number;
}

interface CanvasInformations {
  mapTotalCols: number;
  mapTotalRows: number;
  centerTilePerRow: number;
  centerTilePerCol: number;
}

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasGlobalInformations = useRef<CanvasInformations>({
    mapTotalCols: window.innerWidth / 64,
    mapTotalRows: window.innerHeight / 64,
    centerTilePerRow: window.innerWidth / 64 / 2,
    centerTilePerCol: window.innerHeight / 64 / 2,
  });
  const backgroundRef = useRef<number[][] | null>(
    Array.from({ length: canvasGlobalInformations.current.mapTotalCols }, () =>
      Array.from(
        { length: canvasGlobalInformations.current.mapTotalRows },
        (_, i) =>
          i >= canvasGlobalInformations.current.centerTilePerRow - 2 &&
          i <= canvasGlobalInformations.current.centerTilePerRow + 2
            ? i >= canvasGlobalInformations.current.centerTilePerRow - 1 &&
              i <= canvasGlobalInformations.current.centerTilePerRow + 1
              ? 0
              : 1
            : 0,
      ),
    ),
  );
  const playerRef = useRef<PlayerStats>({
    x: window.innerWidth / 2,
    y: window.innerHeight,
    id: Date.now(),
  });
  let animationId: number | null = null;
  // Background sprite sheet
  const backgroundSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/field.png",
    spriteWidth: 64,
    spriteHeight: 64,
    totalCols: 8,
    totalRows: 8,
    scale: 1,
    spawnInterval: 100,
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
    scale: 1,
    spawnInterval: 100,
    currentFrame: 18,
    lastFrame: 24,
    lastFrameTime: 0,
    movementSpeed: 32,
  });

  const updateBackground = (timestamp: number) => {};

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
    console.log(backgroundArray);
    for (let row = 0; row < backgroundArray.length; row++) {
      for (let col = 0; col < backgroundArray[row].length; col++) {
        const tileIndex = backgroundArray[row][col];
        const spriteX =
          (tileIndex / canvasGlobalInformations.current.mapTotalCols) *
          backgroundSpriteSheetInstance.spriteWidth;
        const spriteY =
          Math.floor(
            tileIndex % canvasGlobalInformations.current.mapTotalRows,
          ) * backgroundSpriteSheetInstance.spriteHeight;
        const x = col * backgroundSpriteSheetInstance.spriteWidth;
        const y = row * backgroundSpriteSheetInstance.spriteHeight;

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

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    playerSpriteSheetInstance.draw({
      ctx,
      x: playerRef.current.x,
      y: playerRef.current.y,
    });
  };

  const update = (timestamp: number) => {
    updatePlayer(timestamp);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    // Draw background
    drawBackground(ctx);

    // Draw the player
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

    return () => cancelAnimationFrame(animationId as number);
  }, []);

  return <canvas ref={canvasRef} />;
};
