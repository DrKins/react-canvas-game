import React, { useEffect, useRef } from "react";
import { generateSpriteSheetInformations } from "../utils/generateSpriteSheetInformations";
import { intersectsRect } from "../utils/intersects";

interface CanvasProps {
  score: number;
  setScore: (score: number) => void;
}
const Canvas: React.FC<CanvasProps> = ({ score, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getRandomSx = (variant: "tree" | "path" | "grass" | "logs") => {
      let options: number[] = [];
      if (variant === "tree") options = [0, 180, 360];

      if (variant === "path") options = [32, 64];

      if (variant === "logs") options = [0, 128];

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
      spritesheet: fieldAssetsSpriteSheet,
      spriteWidth: fieldAssetsWidth,
      spriteHeight: fieldAssetsHeight,
      spawnInterval: fieldAssetsSpawnInterval,
    } = generateSpriteSheetInformations({
      url: "/src/assets/assets.png",
      spriteWidth: 156,
      spriteHeight: 256,
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
        x: Math.random() * (window.innerWidth - maxXTree) + maxXTree / 2,
        y: canvas.height - fieldAssetsHeight * 3,
        sx: getRandomSx("tree"),
        sy: 0,
      },
      {
        x: Math.random() * minXTree,
        y: canvas.height - fieldAssetsHeight * 4,
        sx: getRandomSx("tree"),
        sy: 0,
      },
    ];

    // Function to spawn a new tree
    const spawnTree = () => {
      let randomX =
        assets.length % 2 === 0
          ? Math.random() * (window.innerWidth - maxXTree) + maxXTree
          : Math.random() * minXTree; // Spawn left of minX
      let randomY =
        assets.length === 0
          ? 0
          : assets[assets.length - 1].y - fieldAssetsHeight;
      const randomSx = getRandomSx("tree"); // Get a random `sx` value
      let safeToSpawn = true;
      // let attemptCount = 0;

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
            randomY > playerY
          ) {
            safeToSpawn = false;
            break;
          }
        }
        // attemptCount++;
      }

      if (safeToSpawn) {
        assets.push({
          x: randomX,
          y: randomY,
          sx: randomSx,
          sy: 0,
        });
      }
      // else {
      //   assets.push({
      //     x: newRandomX,
      //     y: -fieldAssetsHeight,
      //     sx: getRandomSx("logs"),
      //     sy: 320,
      //     sw: 110,
      //     sh: 156,
      //   });
      // }
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
      scale: 1.25,
      spawnInterval: 100,
    });

    let playerCurrentFrame = 18; // Current frame of the player animation
    let playerX = 32 * centerTilePerRow - 1; // Player's x position
    let playerY = canvas.height - playerSpriteHeight * 4; // Player's y position
    let lastPlayerFrameTime = 0;
    let playerSpeed = 32; // Speed of the player

    // Enemy sprite sheet
    const {
      spritesheet: enemySpriteSheet,
      spriteWidth: enemySpriteWidth,
      spriteHeight: enemySpriteHeight,
      scale: enemyScale,
      totalFrames: enemyTotalFrames,
    } = generateSpriteSheetInformations({
      url: "/src/assets/enemy.png",
      spriteWidth: 16,
      spriteHeight: 16,
      scale: 1.25,
      totalCols: 1,
      totalRows: 8,
    });
    let enemyCurrentFrame = 0; // Current frame of the enemy animation
    const enemyPositions = [
      {
        x: 32 * (centerTilePerRow - 2),
        y: enemySpriteHeight,
        animationSpeed: 100,
      },
      {
        x: 32 * (centerTilePerRow + 1),
        y: enemySpriteHeight,
        animationSpeed: 100,
      },
    ];
    let lastEnemyFrameTime = 0;
    let lastEnemyAddTime = 0;
    const enemySpeed = 2; // Speed of enemies

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
          ? 32
          : getRandomSx("grass"),
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
            : getRandomSx("grass"),
        );
        tilemap.unshift(newRow);

        // Reset accumulated distance
        accumulatedDistance -= fieldSpriteHeight;
      }

      // Draw enemies
      enemyPositions.forEach((enemy) => {
        if (timestamp - lastEnemyFrameTime > enemy.animationSpeed) {
          enemyCurrentFrame = (enemyCurrentFrame + 1) % enemyTotalFrames;
          lastEnemyFrameTime = timestamp;
        }

        enemy.y += enemySpeed; // Move enemy downward
        if (enemy.y > canvas.height) {
          const index = enemyPositions.indexOf(enemy);
          if (index > -1) {
            enemyPositions.splice(index, 1); // Remove enemy from array
          }
        }
        drawSprite(
          enemySpriteSheet,
          enemyCurrentFrame,
          enemySpriteWidth,
          enemySpriteHeight,
          enemy.x,
          enemy.y,
          enemyScale,
        );
      });

      // Add a new coin every half a second
      if (timestamp - lastEnemyAddTime > 500 && enemyPositions.length < 10) {
        enemyPositions.push({
          x: [
            (centerTilePerRow - 2.5) * 34,
            (centerTilePerRow - 1.5) * 34,
            centerTilePerRow * 32,
            (centerTilePerRow + 0.5) * 34,
          ][Math.floor(Math.random() * 4)],
          y: -enemySpriteHeight * 1.5,
          animationSpeed: 100, // Update animation frame every 100ms
        });
        lastEnemyAddTime = timestamp;
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
      if (playerY > canvas.height - playerSpriteHeight * 8) {
        playerY -= 0.5;
      }

      // Reset player position if offscreen
      if (playerY < -playerSpriteHeight) {
        playerY = canvas.height;
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
        playerX,
        playerY,
        playerScale,
      );

      // Check for collision between enemy and player
      enemyPositions.forEach((enemy) => {
        const isColliding = intersectsRect({
          rect1: {
            x: playerX,
            y: playerY,
            width: playerSpriteWidth * playerScale,
            height: playerSpriteHeight * playerScale,
          },
          rect2: {
            x: enemy.x,
            y: enemy.y,
            width: enemySpriteWidth * enemyScale,
            height: enemySpriteHeight * enemyScale,
          },
        });

        if (isColliding) {
          // Game over
          console.log("Colliding, Game Over!");
          const index = enemyPositions.findIndex(
            (e) => e.x === enemy.x && e.y === enemy.y,
          );
          if (index > -1) {
            enemyPositions.splice(index, 1);
            setScore(score + 1);
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
          if (playerX > (centerTilePerRow - 2) * 32) {
            playerX -= playerSpeed;
          }
          break;
        case "ArrowRight":
          if (playerX < centerTilePerRow * 32) {
            playerX += playerSpeed;
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Start animation after both sprite sheets are loaded
    Promise.all([
      new Promise((resolve) => (playerSpriteSheet.onload = resolve)),
      new Promise((resolve) => (enemySpriteSheet.onload = resolve)),
      new Promise((resolve) => (fieldAssetsSpriteSheet.onload = resolve)),
      new Promise((resolve) => (fieldSpriteSheet.onload = resolve)),
    ]).then(() => {
      requestAnimationFrame(animate);
    });
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Canvas;
