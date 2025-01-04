import React, { useEffect, useRef } from "react";
import {
  generateSpriteSheetInformations,
  intersectsRect,
  randomIntFromInterval,
} from "../utils";

interface CanvasProps {
  setScore: (score: number) => void;
  endGame: () => void;
}
const Canvas: React.FC<CanvasProps> = ({ setScore, endGame }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  class Player {
    public x: number;
    public y: number;
    public id: number;

    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
      this.id = Date.now();
    }

    public updateY(y: number) {
      this.y = y;
    }

    public updateX(x: number) {
      this.x = x;
    }
  }

  let newPlayerInstance: Player | null = null;
  const newPlayer = ((): Player => {
    if (newPlayerInstance) return newPlayerInstance;
    newPlayerInstance = new Player(800 / 2, screen.height / 2);
    return newPlayerInstance;
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getRandomArrayValue = (
      variant: "tree" | "path" | "grass" | "logs" | "boxes",
    ) => {
      let options: number[] = [];
      if (variant === "tree") options = [0, 128 + 12];

      if (variant === "path") options = [32, 64];

      if (variant === "logs") options = [0, 128];

      if (variant === "boxes") options = [0];

      if (variant === "grass") options = fieldGrassTiles;

      return options[Math.floor(Math.random() * options.length)];
    };

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const viewportWidth = Math.max(containerWidth, 800);
    const viewportHeight = Math.max(containerHeight, 800);
    canvas.width = viewportWidth; // Limit width for visibility
    canvas.height = viewportHeight; // Limit height for tiles

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Field sprite sheet
    const {
      spritesheet: fieldSpriteSheet,
      spriteWidth: fieldSpriteWidth,
      spriteHeight: fieldSpriteHeight,
      totalCols: fieldTotalCols,
    } = generateSpriteSheetInformations({
      url: "/src/assets/field.png",
      spriteWidth: 32,
      spriteHeight: 32,
      totalCols: 8,
    });

    const fieldGrassTiles = [0, 0, 0, 20, 30, 0, 0, 0];
    const tilesPerRow = viewportWidth / fieldSpriteWidth; // 25 tiles
    const tilesPerCol = viewportHeight / fieldSpriteWidth; // Example 18.75 (~19 tiles)
    const centerTilePerRow = Math.floor(tilesPerRow / 2);

    const minXTree = 32 * (centerTilePerRow - 6);
    const maxXTree = 32 * (centerTilePerRow + 6);

    let lastTimestamp = 0;
    let accumulatedDistance = 0;

    const {
      spritesheet: pathObsticleSpriteSheet,
      spriteWidth: pathObsticleWidth,
      spriteHeight: pathObsticleHeight,
    } = generateSpriteSheetInformations({
      url: "/src/assets/props.png",
      spriteWidth: 32,
      spriteHeight: 32,
      totalCols: 8,
    });

    const obstacles: {
      x: number;
      y: number;
      sy: number;
      sw?: number;
      sh?: number;
    }[] = [];

    const {
      spritesheet: fieldAssetsSpriteSheet,
      spriteWidth: fieldAssetsWidth,
      spriteHeight: fieldAssetsHeight,
      spawnInterval: fieldAssetsSpawnInterval,
    } = generateSpriteSheetInformations({
      url: "/src/assets/assets.png",
      spriteWidth: 128 + 12,
      spriteHeight: 160,
      spawnInterval: 50,
    });

    // helpers and background assets
    let lastFieldAssetsSpawnTime = 0;
    const assets: {
      x: number;
      y: number;
      sx: number;
      sy: number;
      sw?: number;
      sh?: number;
    }[] = [
      {
        x: Math.random() * (window.innerWidth - maxXTree) - maxXTree / 2,
        y: canvas.height - fieldAssetsHeight * 3,
        sx: getRandomArrayValue("tree"),
        sy: 0,
      },
      {
        x: Math.random() * minXTree,
        y: canvas.height - fieldAssetsHeight * 4,
        sx: getRandomArrayValue("tree"),
        sy: 0,
      },
    ];

    // Function to spawn a new tree
    const spawnTree = () => {
      let randomX =
        assets.length % 2 === 0
          ? randomIntFromInterval(maxXTree, canvas.width - fieldAssetsWidth / 2)
          : Math.random() * minXTree; // Spawn left of minX
      let randomY = -fieldAssetsHeight;
      const randomSx = getRandomArrayValue("tree"); // Get a random `sx` value
      let safeToSpawn = true;

      while (!safeToSpawn) {
        randomX = Math.random() * minXTree;

        safeToSpawn = true;
        for (const tree of assets) {
          if (
            intersectsRect({
              rect1: {
                x: randomX,
                y: randomY,
                width: fieldAssetsWidth / 3,
                height: fieldAssetsHeight / 3,
              },
              rect2: {
                x: tree.x,
                y: tree.y,
                width: fieldAssetsWidth / 3,
                height: fieldAssetsHeight / 3,
              },
            }) &&
            randomY > newPlayer.y
          ) {
            safeToSpawn = false;
            break;
          }
        }
      }

      safeToSpawn &&
        assets.unshift({
          x: randomX,
          y: randomY,
          sx: randomSx,
          sy: 0,
        });
    };

    // Player sprite sheet
    const {
      spritesheet: playerSpriteSheet,
      spriteWidth: playerSpriteWidth,
      spriteHeight: playerSpriteHeight,
      totalFrames: playerTotalFrames,
      scale: playerScale,
      spawnInterval: playerFrameDelay,
    } = generateSpriteSheetInformations({
      url: "/src/assets/player.png",
      spriteWidth: 32,
      spriteHeight: 32,
      totalCols: 1,
      totalRows: 24,
      scale: 1,
      spawnInterval: 100,
    });

    let playerCurrentFrame = 18; // Current frame of the player animation
    let lastPlayerFrameTime = 0;
    let playerSpeed = 32; // Speed of the player

    // coin sprite sheet
    const {
      spritesheet: coinSpriteSheet,
      spriteWidth: coinSpriteWidth,
      spriteHeight: coinSpriteHeight,
      scale: coinScale,
      totalFrames: coinTotalFrames,
    } = generateSpriteSheetInformations({
      url: "/src/assets/coin.png",
      spriteWidth: 16,
      spriteHeight: 16,
      scale: 1.25,
      totalCols: 1,
      totalRows: 8,
    });
    let coinCurrentFrame = 0; // Current frame of the coin animation
    const coinPosition: { x: number; y: number; animationSpeed: number }[] = [];
    let lastCoinFrameTime = 0;
    let lastcoinAddTime = 0;
    const coinSpeed = 1.64; // Speed of enemies

    // Draw a sprite
    const drawSprite = (
      image: HTMLImageElement,
      frameIndex: number,
      spriteWidth: number,
      spriteHeight: number,
      x: number,
      y: number,
      scale: number,
    ) => {
      const sourceX = frameIndex * spriteWidth; // Calculate source x
      ctx.drawImage(
        image,
        sourceX,
        0,
        spriteWidth,
        spriteHeight,
        x,
        y,
        spriteWidth * scale,
        spriteHeight * scale,
      );
    };

    const tilemap = Array.from({ length: tilesPerCol }, () =>
      Array.from({ length: tilesPerRow }, (_, i) =>
        i >= centerTilePerRow - 2 && i <= centerTilePerRow + 2
          ? i >= centerTilePerRow - 1 && i <= centerTilePerRow + 1
            ? 32
            : Array.from({ length: 31 }, (_, i) => i + 32)[
                Math.floor(Math.random() * 31)
              ]
          : getRandomArrayValue("grass"),
      ),
    );

    // Animation loop
    const animate = (timestamp: number) => {
      if (!ctx) return;

      // Time delta for smooth animation of map
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Control the speed of map (adjust this value to slow it down)
      const speed = 98; // pixels per second
      const distanceToMove = (deltaTime / 1000) * speed;

      // Accumulate the distance of map
      accumulatedDistance += distanceToMove;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw the map
      for (let row = 0; row < tilemap.length; row++) {
        for (let col = 0; col < tilemap[row].length; col++) {
          const tileIndex = tilemap[row][col];
          if (tileIndex === 0) continue;
          const spriteX = (tileIndex % fieldTotalCols) * fieldSpriteWidth;
          const spriteY =
            Math.floor(tileIndex / fieldTotalCols) * fieldSpriteHeight;
          const x = col * fieldSpriteWidth;
          const y = row * fieldSpriteHeight + accumulatedDistance; // Offset by accumulated distance

          ctx.drawImage(
            fieldSpriteSheet,
            spriteX,
            spriteY,
            fieldSpriteWidth,
            fieldSpriteHeight,
            x,
            y,
            fieldSpriteWidth,
            fieldSpriteHeight,
          );
        }
      }

      // Check if a row is completely out of view
      if (accumulatedDistance >= fieldSpriteHeight) {
        // Remove the bottom row
        tilemap.pop();

        // Prepend a new row at the top
        const newRow = Array.from({ length: tilesPerRow }, (_, i) =>
          i >= centerTilePerRow - 2 && i <= centerTilePerRow + 2
            ? i >= centerTilePerRow - 1 && i <= centerTilePerRow + 1
              ? 32
              : Array.from({ length: 31 }, (_, i) => i + 32)[
                  Math.floor(Math.random() * 31)
                ]
            : getRandomArrayValue("grass"),
        );
        tilemap.unshift(newRow);

        // Reset accumulated distance
        accumulatedDistance -= fieldSpriteHeight;
      }

      // Draw coins
      coinPosition.forEach((coin) => {
        if (timestamp - lastCoinFrameTime > coin.animationSpeed) {
          coinCurrentFrame = (coinCurrentFrame + 1) % coinTotalFrames;
          lastCoinFrameTime = timestamp;
        }

        coin.y += coinSpeed; // Move coin downward
        if (coin.y > canvas.height) {
          const index = coinPosition.indexOf(coin);
          if (index > -1) {
            coinPosition.splice(index, 1); // Remove coin from array
          }
        }
        drawSprite(
          coinSpriteSheet,
          coinCurrentFrame,
          coinSpriteWidth,
          coinSpriteHeight,
          coin.x,
          coin.y,
          coinScale,
        );
      });

      obstacles.forEach((obstacle) => {
        obstacle.y += coinSpeed; // Move coin downward
        if (obstacle.y > canvas.height + 128) {
          const index = obstacles.indexOf(obstacle);
          if (index > -1) {
            obstacles.splice(index, 1); // Remove coin from array
          }
        }

        ctx.drawImage(
          pathObsticleSpriteSheet,
          128 + 32,
          32 - 12,
          pathObsticleWidth,
          pathObsticleHeight + 12,
          obstacle.x,
          obstacle.y,
          pathObsticleWidth,
          pathObsticleHeight + 12,
        );
      });

      console.log("player:", newPlayer.y, newPlayer.id);

      // Add a new coin and new obstacles every 2 seconds
      if (timestamp - lastcoinAddTime > 800 && coinPosition.length < 10) {
        const newCoin = {
          x:
            // Make sure the new coin is not colliding with obstacles
            (() => {
              let newX = [
                (centerTilePerRow - 1) * 32,
                (centerTilePerRow + 0.25) * 32,
                (centerTilePerRow + 1.5) * 32,
              ][Math.floor(Math.random() * 3)];
              let isColliding = true;
              while (isColliding) {
                isColliding = false;
                for (const obstacle of obstacles) {
                  if (
                    newX > obstacle.x &&
                    newX < obstacle.x + pathObsticleWidth
                  ) {
                    isColliding = true;
                    newX = [
                      (centerTilePerRow - 1) * 32,
                      (centerTilePerRow + 0.25) * 32,
                      (centerTilePerRow + 1.5) * 32,
                    ][Math.floor(Math.random() * 3)];
                    break;
                  }
                }
              }
              return newX;
            })(),
          y: -coinSpriteHeight * 1.5,
          animationSpeed: 100, // Update animation frame every 100ms
        };

        coinPosition.push(newCoin);

        const Xoptions = [
          (centerTilePerRow - 1) * 32,
          centerTilePerRow * 32,
          (centerTilePerRow + 1) * 32,
        ];

        const currentObstacleX: number[] = [];

        for (let i = 0; i < 2; i++) {
          let isValidObstacle = false;
          while (!isValidObstacle) {
            let xOption = Xoptions[Math.floor(Math.random() * Xoptions.length)];
            if (!currentObstacleX.includes(xOption)) {
              currentObstacleX.push(xOption);
              isValidObstacle = true;
            }
          }

          obstacles.push({
            x: currentObstacleX[i],
            y: -coinSpriteHeight * 1.5 - 100,
            sy: getRandomArrayValue("boxes"),
          });
        }
        lastcoinAddTime = timestamp;
      }

      // Update and draw assets
      assets.forEach((asset, index) => {
        asset.y += 1.65; // Move tree downward

        // Only draw assets that fall within the restricted range
        if (asset.x < minXTree || asset.x > maxXTree) {
          ctx.drawImage(
            fieldAssetsSpriteSheet,
            asset.sx,
            asset.sy,
            asset.sw || fieldAssetsWidth,
            asset.sh || fieldAssetsHeight,
            asset.x,
            asset.y,
            asset.sw || fieldAssetsWidth,
            asset.sh || fieldAssetsHeight,
          );
        }

        // Remove tree if it goes offscreen
        if (asset.y > canvas.height + 256) {
          assets.splice(index, 1);
        }
      });

      // Spawn a new tree at intervals
      if (timestamp - lastFieldAssetsSpawnTime > fieldAssetsSpawnInterval) {
        spawnTree();
        lastFieldAssetsSpawnTime = timestamp;
      }

      // Update player position
      if (newPlayer.y > canvas.height - playerSpriteHeight * 8) {
        newPlayer.updateY(newPlayer.y - 0.5);
      }

      // Reset player position if offscreen
      if (
        newPlayer.x < -playerSpriteWidth ||
        newPlayer.x > canvas.width ||
        newPlayer.y < -playerSpriteHeight ||
        newPlayer.y > canvas.height
      ) {
        endGame();
      }
      if (timestamp - lastPlayerFrameTime > playerFrameDelay) {
        playerCurrentFrame = Math.max(
          (playerCurrentFrame + 1) % playerTotalFrames,
          18,
        );
        lastPlayerFrameTime = timestamp;
      }

      // Draw player
      drawSprite(
        playerSpriteSheet,
        playerCurrentFrame,
        playerSpriteWidth,
        playerSpriteHeight,
        newPlayer.x,
        newPlayer.y,
        playerScale,
      );

      // Check for collision between coin and player
      coinPosition.forEach((coin) => {
        const isColliding = intersectsRect({
          rect1: {
            x: newPlayer.x,
            y: newPlayer.y,
            width: playerSpriteWidth * playerScale,
            height: playerSpriteHeight * playerScale,
          },
          rect2: {
            x: coin.x,
            y: coin.y,
            width: coinSpriteWidth * coinScale,
            height: coinSpriteHeight * coinScale,
          },
        });

        if (isColliding) {
          setScore(1);

          // Game over
          const index = coinPosition.findIndex(
            (e) => e.x === coin.x && e.y === coin.y,
          );
          if (index > -1) {
            coinPosition.splice(index, 1);
          }
        }
      });

      // Check for collision between obstacle and player
      obstacles.forEach((obstacle) => {
        const isColliding = intersectsRect({
          rect1: {
            x: newPlayer.x + (playerSpriteWidth - playerSpriteWidth / 2) / 2,
            y: newPlayer.y,
            width: playerSpriteWidth / 2,
            height: playerSpriteHeight * playerScale,
          },
          rect2: {
            x: obstacle.x,
            y: obstacle.y,
            width: pathObsticleWidth,
            height: pathObsticleWidth,
          },
        });

        // Game over
        if (isColliding) {
          newPlayer.updateY(newPlayer.y);
        } else {
          if (newPlayer.y > canvas.height / 2) {
            newPlayer.updateY(newPlayer.y - 0.5);
          } else {
            newPlayer.updateY(canvas.height / 2);
          }
        }
      });

      // Request the next animation frame
      requestAnimationFrame(animate);
    };

    // Handle user input
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          if (newPlayer.x > (centerTilePerRow - 1) * 32) {
            newPlayer.updateX(newPlayer.x - playerSpeed);
          }
          break;
        case "ArrowRight":
          if (newPlayer.x < (centerTilePerRow + 1) * 32) {
            newPlayer.updateX(newPlayer.x + playerSpeed);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Start animation after both sprite sheets are loaded
    Promise.all([
      new Promise((resolve) => (playerSpriteSheet.onload = resolve)),
      new Promise((resolve) => (coinSpriteSheet.onload = resolve)),
      new Promise((resolve) => (fieldAssetsSpriteSheet.onload = resolve)),
      new Promise((resolve) => (fieldSpriteSheet.onload = resolve)),
      new Promise((resolve) => (pathObsticleSpriteSheet.onload = resolve)),
    ]).then(() => {
      requestAnimationFrame(animate);
    });
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Canvas;
