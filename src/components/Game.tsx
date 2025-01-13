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
  lastTreeTimestamp: number;
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

export const Game: React.FC<{
  setGameState: () => void;
  setScore: () => void;
}> = ({ setGameState, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canvasGlobalInformations = useRef<CanvasInformations>({
    mapTotalRows: Math.ceil(window.innerWidth / 32),
    mapTotalCols: Math.ceil(window.innerHeight / 32),
    centerTilePerRow: Math.ceil(window.innerWidth / 32 / 2),
    centerTilePerCol: Math.ceil(window.innerHeight / 32 / 2),
    score: 0,
    lastMapTimestamp: 0,
    lastTreeTimestamp: 0,
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
              ? 33
              : i === canvasGlobalInformations.current.centerTilePerRow + 2
              ? 160
              : 162
            : 161,
      ),
    ),
  );

  const treesRef = useRef<
    ObjectStats[] | { x: number; y: number; id: number; spriteX: number }[]
  >(
    Array.from({ length: 100 }, (_, i) => ({
      x:
        Math.random() > 0.5
          ? randomIntFromInterval(
              0,
              (canvasGlobalInformations.current.centerTilePerRow - 6) * 32,
            )
          : randomIntFromInterval(
              (canvasGlobalInformations.current.centerTilePerRow + 5) * 32,
              (canvasGlobalInformations.current.mapTotalRows - 1) * 32,
            ),
      y: -50 * i,
      id: i,
      spriteX: Math.random() > 0.5 ? 0 : 64,
    })),
  );

  const boxesRef = useRef<ObjectStats[]>(
    Array.from({ length: 5 }, (_, i) => ({
      x:
        Math.random() < 0.33
          ? 32 * (canvasGlobalInformations.current.centerTilePerRow - 1)
          : Math.random() < 0.66
          ? 32 * (canvasGlobalInformations.current.centerTilePerRow + 1)
          : 32 * canvasGlobalInformations.current.centerTilePerRow,
      y: -100 * i,
      id: i,
    })),
  );

  const playerRef = useRef<
    ObjectStats | { x: number | null; y: number; id: number; speed: number }
  >({
    x: null,
    y: window.innerHeight,
    id: Date.now(),
    speed: 1,
  });

  const coinRef = useRef<ObjectStats[]>([]);

  let animationId: number | null = null;

  // Background sprite sheet
  const backgroundSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/terrain.png",
    spriteWidth: 32,
    spriteHeight: 32,
    totalCols: 4,
    totalRows: 10,
    scale: 1,
    spawnInterval: 0,
    currentFrame: 0,
    lastFrame: 256,
    lastFrameTime: 0,
    movementSpeed: 0,
  });

  const treesSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/assets.png",
    spriteWidth: 64,
    spriteHeight: 96,
    totalCols: 3,
    totalRows: 3,
  });

  const boxesSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/props.png",
    spriteWidth: 32,
    spriteHeight: 48,
    totalCols: 5,
    totalRows: 3,
    scale: 1,
    spawnInterval: 100,
    currentFrame: 0,
    lastFrame: 8,
    lastFrameTime: 0,
    movementSpeed: 0,
  });

  // Player sprite sheet
  const playerSpriteSheetInstance = new SpriteSheet({
    url: "/src/assets/player.png",
    spriteWidth: 32,
    spriteHeight: 34,
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
          x:
            (playerRef.current.x as number) +
            (playerSpriteSheetInstance.spriteWidth -
              playerSpriteSheetInstance.spriteWidth / 2) /
              2,
          y: playerRef.current.y,
          width:
            (playerSpriteSheetInstance.spriteWidth / 2) *
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

      if (isColliding) {
        setScore();
        canvasGlobalInformations.current.score += 1;
      }

      coin.y += 2;
      coinSpriteSheetInstance.updateCurrentFrame(timestamp);
    });
  };

  const updateBoxes = () => {
    boxesRef.current?.forEach((box) => {
      if (box.y > (canvasRef.current as HTMLCanvasElement).height) {
        box.y = -100;
        box.x =
          Math.random() < 0.33
            ? 32 * (canvasGlobalInformations.current.centerTilePerRow - 1)
            : Math.random() < 0.66
            ? 32 * (canvasGlobalInformations.current.centerTilePerRow + 1)
            : 32 * canvasGlobalInformations.current.centerTilePerRow;
      }
      box.y += 2;
    });
  };

  const updateTrees = () => {
    treesRef.current?.forEach((tree) => {
      if (tree.y > (canvasRef.current as HTMLCanvasElement).height) {
        tree.y = -100;
        tree.x =
          Math.random() > 0.5
            ? randomIntFromInterval(
                32,
                (canvasGlobalInformations.current.centerTilePerRow - 3) * 32,
              )
            : randomIntFromInterval(
                (canvasGlobalInformations.current.centerTilePerRow + 3) * 32,
                (canvasGlobalInformations.current.mapTotalRows - 3) * 32,
              );
      }
      tree.y += 2;
    });
  };

  const updatePlayer = (timestamp: number) => {
    if (
      playerRef.current.y >
      (canvasRef.current as HTMLCanvasElement).height +
        playerSpriteSheetInstance.spriteHeight
    )
      setGameState();

    const playerOffset = 4;
    if (playerRef.current.x === null)
      playerRef.current.x =
        backgroundSpriteSheetInstance.spriteWidth *
          canvasGlobalInformations.current.centerTilePerRow -
        playerOffset;

    if (
      playerRef.current.y >
      (canvasRef.current as HTMLCanvasElement).height / 2
    ) {
      playerRef.current.y = playerRef.current.y - 1;
    }

    boxesRef.current.forEach((box) => {
      const isColliding = intersectsRect({
        rect1: {
          x:
            (playerRef.current.x as number) +
            (playerSpriteSheetInstance.spriteWidth -
              playerSpriteSheetInstance.spriteWidth / 2) /
              2,
          y: playerRef.current.y,
          width:
            (playerSpriteSheetInstance.spriteWidth / 2) *
            playerSpriteSheetInstance.scale,
          height:
            playerSpriteSheetInstance.spriteHeight *
            playerSpriteSheetInstance.scale,
        },
        rect2: {
          x: box.x,
          y: box.y,
          width:
            boxesSpriteSheetInstance.spriteWidth *
            boxesSpriteSheetInstance.scale,
          height:
            boxesSpriteSheetInstance.spriteHeight *
            boxesSpriteSheetInstance.scale,
        },
      });

      if (isColliding) playerRef.current.y = playerRef.current.y + playerOffset;
    });

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
          const wouldCollideLeft = boxesRef.current.some((box) => {
            return intersectsRect({
              rect1: {
                x:
                  (playerRef.current.x as number) -
                  playerSpriteSheetInstance.spriteWidth +
                  (playerSpriteSheetInstance.spriteWidth -
                    playerSpriteSheetInstance.spriteWidth / 2) /
                    2,
                y: playerRef.current.y,
                width:
                  (playerSpriteSheetInstance.spriteWidth / 2) *
                  playerSpriteSheetInstance.scale,
                height:
                  playerSpriteSheetInstance.spriteHeight *
                  playerSpriteSheetInstance.scale,
              },
              rect2: {
                x: box.x,
                y: box.y,
                width:
                  boxesSpriteSheetInstance.spriteWidth *
                  boxesSpriteSheetInstance.scale,
                height:
                  boxesSpriteSheetInstance.spriteHeight *
                  boxesSpriteSheetInstance.scale,
              },
            });
          });

          if (!wouldCollideLeft) {
            playerRef.current.x =
              (playerRef.current.x as number) -
              playerSpriteSheetInstance.spriteWidth;
          }
        }
        break;
      case "ArrowRight":
        if (
          (playerRef.current.x as number) <
          backgroundSpriteSheetInstance.spriteWidth *
            canvasGlobalInformations.current.centerTilePerRow!
        ) {
          const wouldCollideRight = boxesRef.current.some((box) => {
            return intersectsRect({
              rect1: {
                x:
                  (playerRef.current.x as number) +
                  playerSpriteSheetInstance.spriteWidth -
                  (playerSpriteSheetInstance.spriteWidth -
                    playerSpriteSheetInstance.spriteWidth / 2) /
                    2,
                y: playerRef.current.y,
                width:
                  (playerSpriteSheetInstance.spriteWidth / 2) *
                  playerSpriteSheetInstance.scale,
                height:
                  playerSpriteSheetInstance.spriteHeight *
                  playerSpriteSheetInstance.scale,
              },
              rect2: {
                x: box.x,
                y: box.y,
                width:
                  boxesSpriteSheetInstance.spriteWidth *
                  boxesSpriteSheetInstance.scale,
                height:
                  boxesSpriteSheetInstance.spriteHeight *
                  boxesSpriteSheetInstance.scale,
              },
            });
          });

          if (!wouldCollideRight) {
            playerRef.current.x =
              (playerRef.current.x as number) +
              playerSpriteSheetInstance.spriteWidth;
          }
          break;
        }
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
    ctx.font = "36px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText(
      `Score: ${canvasGlobalInformations.current.score}`,
      cordinate,
      cordinate * 3,
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

  const drawTree = async (ctx: CanvasRenderingContext2D) => {
    const trees = treesRef.current as {
      x: number;
      y: number;
      id: number;
      spriteX: number;
    }[];
    for (let i = trees.length - 1; i >= 0; i--) {
      const tree = trees[i];
      await treesSpriteSheetInstance.draw({
        ctx,
        x: tree.x,
        y: tree.y,
        spriteX: tree.spriteX,
      });
    }
  };
  const drawBoxes = async (ctx: CanvasRenderingContext2D) => {
    const boxes: ObjectStats[] = boxesRef.current;
    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      await boxesSpriteSheetInstance.draw({
        ctx,
        x: box.x,
        y: box.y,
        spriteX: 160,
        spriteY: 18,
      });
    }
  };

  const update = (timestamp: number) => {
    updatePlayer(timestamp);
    updateCoin(timestamp);
    updateTrees();
    updateBoxes();
  };

  const draw = async (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    await drawBackground(ctx);
    await drawTree(ctx);
    await drawCoin(ctx);
    await drawBoxes(ctx);
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
      const lastCoin = coinRef.current[coinRef.current.length - 1];
      const y = lastCoin ? lastCoin.y - 100 : 0;

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
