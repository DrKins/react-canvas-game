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
  lastMapTimestamp: number;
}

interface generateCoinX {
  playerSpriteSheetInstance: SpriteSheet;
  backgroundSpriteSheetInstance: SpriteSheet;
  canvasGlobalInformations: React.MutableRefObject<CanvasInformations>;
}

function getSpriteCoordinates(
  tileIndex: number,
  spritesheetWidth: number,
  spriteSize: number,
) {
  const spriteX = (tileIndex % spritesheetWidth) * spriteSize;
  const spriteY = Math.floor(tileIndex / spritesheetWidth) * spriteSize;
  return { spriteX, spriteY };
}

function generateCoinX({
  playerSpriteSheetInstance,
  backgroundSpriteSheetInstance,
  canvasGlobalInformations,
}: generateCoinX): number {
  const playerOffset = 4;
  return Math.random() < 0.33
    ? backgroundSpriteSheetInstance.spriteWidth *
        canvasGlobalInformations.current.centerTilePerRow! -
        playerSpriteSheetInstance.spriteWidth +
        playerOffset
    : Math.random() < 0.66
    ? backgroundSpriteSheetInstance.spriteWidth *
        canvasGlobalInformations.current.centerTilePerRow! +
      playerSpriteSheetInstance.spriteWidth +
      playerOffset
    : backgroundSpriteSheetInstance.spriteWidth *
        canvasGlobalInformations.current.centerTilePerRow! +
      playerOffset;
}

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasGlobalInformations = useRef<CanvasInformations>({
    mapTotalRows: Math.ceil(window.innerWidth / 32),
    mapTotalCols: Math.ceil(window.innerHeight / 32),
    centerTilePerRow: Math.ceil(window.innerWidth / 32 / 2),
    centerTilePerCol: Math.ceil(window.innerHeight / 32 / 2),
    score: 0,
    lastMapTimestamp: 0,
  });

  const backgroundRef = useRef<number[][] | null>(
    Array.from({ length: canvasGlobalInformations.current.mapTotalCols }, () =>
      Array.from(
        { length: canvasGlobalInformations.current.mapTotalRows },
        (_, i) =>
          i >= canvasGlobalInformations.current.centerTilePerRow - 2 && //this targets outer rows so it is edge of path
          i <= canvasGlobalInformations.current.centerTilePerRow + 2
            ? i >= canvasGlobalInformations.current.centerTilePerRow - 1 && //This targets the middle three row
              i <= canvasGlobalInformations.current.centerTilePerRow + 1
              ? 128
              : randomIntFromInterval(132, 135)
            : 96,
      ),
    ),
  );
  const playerRef = useRef<
    ObjectStats | { x: number | null; y: number; id: number }
  >({
    x: null,
    y: window.innerHeight,
    id: Date.now(),
  });

  const coinRef = useRef<ObjectStats[]>([]);

  let animationId: number | null = null;

  // Background sprite sheet
  const backgroundSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/field.png",
    spriteWidth: 32,
    spriteHeight: 32,
    totalCols: 16,
    totalRows: 16,
    scale: 1,
    spawnInterval: 0,
    currentFrame: 0,
    lastFrame: 256,
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
    scale: 1.25,
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
    scale: 1.5,
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
          x: playerRef.current.x as number,
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

      coin.y += 4; // Move the coin downwards
      coinSpriteSheetInstance.updateCurrentFrame(timestamp);
    });
  };

  const updateBackground = async (timestamp: number) => {
    if (timestamp - canvasGlobalInformations.current.lastMapTimestamp > 95) {
      canvasGlobalInformations.current.lastMapTimestamp = timestamp;
      const newRow = Array.from(
        { length: canvasGlobalInformations.current.mapTotalRows },
        (_, i) =>
          i >= canvasGlobalInformations.current.centerTilePerRow - 2 && //this targets outer rows so it is edge of path
          i <= canvasGlobalInformations.current.centerTilePerRow + 2
            ? i >= canvasGlobalInformations.current.centerTilePerRow - 1 && //This targets the middle three row
              i <= canvasGlobalInformations.current.centerTilePerRow + 1
              ? 128
              : randomIntFromInterval(132, 135)
            : 96,
      );
      backgroundRef.current?.unshift(newRow);
      backgroundRef.current?.pop();
    }
  };

  const updatePlayer = (timestamp: number) => {
    const playerOffset = 4;
    if (playerRef.current.x === null)
      playerRef.current.x =
        backgroundSpriteSheetInstance.spriteWidth *
          canvasGlobalInformations.current.centerTilePerRow -
        playerOffset;

    if (
      playerRef.current.y >
      (canvasRef.current as HTMLCanvasElement).height -
        playerSpriteSheetInstance.spriteHeight * 6
    ) {
      playerRef.current.y = playerRef.current.y - 0.5;
    }

    playerSpriteSheetInstance.updateCurrentFrame(timestamp);
  };

  const updatePlayerPosition = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        if (
          (playerRef.current.x as number) >
          backgroundSpriteSheetInstance.spriteWidth *
            canvasGlobalInformations.current.centerTilePerRow! -
            playerSpriteSheetInstance.spriteWidth
        ) {
          playerRef.current.x =
            (playerRef.current.x as number) -
            playerSpriteSheetInstance.spriteWidth;
        }
        break;
      case "ArrowRight":
        if (
          (playerRef.current.x as number) <
          backgroundSpriteSheetInstance.spriteWidth *
            canvasGlobalInformations.current.centerTilePerRow!
        ) {
          playerRef.current.x =
            (playerRef.current.x as number) +
            playerSpriteSheetInstance.spriteWidth;
        }
        break;
    }
  };

  const drawBackground = async (ctx: CanvasRenderingContext2D) => {
    const backgroundArray = backgroundRef.current as number[][];
    for (let col = 0; col < backgroundArray.length; col++) {
      for (let row = 0; row < backgroundArray[col].length; row++) {
        const tileIndex = backgroundArray[col][row];
        const x = row * backgroundSpriteSheetInstance.spriteWidth;
        const y = col * backgroundSpriteSheetInstance.spriteHeight;

        const { spriteX, spriteY } = getSpriteCoordinates(
          tileIndex,
          backgroundSpriteSheetInstance.spriteWidth,
          backgroundSpriteSheetInstance.spriteHeight,
        );

        await backgroundSpriteSheetInstance.draw({
          ctx,
          x,
          y,
          spriteX,
          spriteY,
        });
      }
    }
  };

  const drawScore = (ctx: CanvasRenderingContext2D) => {
    const cordinate = 16;
    ctx.font = "18px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(
      `Score: ${canvasGlobalInformations.current.score}`,
      cordinate,
      cordinate * 2,
    );
  };

  const drawCoin = async (ctx: CanvasRenderingContext2D) => {
    coinRef.current.forEach(
      async (coin) =>
        await coinSpriteSheetInstance.draw({ ctx, x: coin.x, y: coin.y }),
    );
  };

  const drawPlayer = async (ctx: CanvasRenderingContext2D) => {
    await playerSpriteSheetInstance.draw({
      ctx,
      x: playerRef.current.x as number,
      y: playerRef.current.y,
    });
  };

  const update = (timestamp: number) => {
    updatePlayer(timestamp);
    updateCoin(timestamp);
    updateBackground(timestamp);
  };

  const draw = async (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    await drawBackground(ctx);
    await drawCoin(ctx);
    await drawPlayer(ctx);
    drawScore(ctx);
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

    window.addEventListener("keydown", updatePlayerPosition);

    const coinInterval = setInterval(() => {
      const x = generateCoinX({
        playerSpriteSheetInstance,
        backgroundSpriteSheetInstance,
        canvasGlobalInformations,
      });
      const y = -coinSpriteSheetInstance.spriteHeight;

      if (coinRef.current.length < 10)
        coinRef.current.push({ x, y, id: Date.now() });
    }, 750);

    return () => {
      cancelAnimationFrame(animationId as number);
      removeEventListener("keydown", updatePlayerPosition);
      clearInterval(coinInterval);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};
