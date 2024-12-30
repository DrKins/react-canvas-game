import React, { useEffect, useRef } from "react";
import { intersectsRect } from "../utils/intersects";

interface CanvasWithSeparateSpritesProps {
  score: number;
  setScore: () => void;
}
const CanvasWithSeparateSprites: React.FC<CanvasWithSeparateSpritesProps> = ({
  setScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    const viewportWidth = Math.max(containerWidth, 800);
    const viewportHeight = Math.max(containerHeight, 800);
    canvas.width = viewportWidth; // Limit width for visibility
    canvas.height = viewportHeight; // Limit height for tiles

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // background field sprite sheet
    const fieldAssetsSpriteSheet = new Image();
    fieldAssetsSpriteSheet.src = "/src/assets/assets.png";

    const fieldWallsSpriteSheet = new Image();
    fieldWallsSpriteSheet.src = "/src/assets/walls.png";

    const fieldSpriteSheet = new Image();
    fieldSpriteSheet.src = "/src/assets/field.png";

    const fieldSpriteWidth = 32; // Width of a single player sprite
    const fieldSpriteHeight = 32; // Height of a single player sprite
    const fieldTotalCols = 8;

    const tilesPerRow = viewportWidth / fieldSpriteWidth; // 25 tiles
    const tilesPerCol = viewportHeight / fieldSpriteWidth; // Example 18.75 (~19 tiles)
    const centerTilePerRow = Math.floor(tilesPerRow / 2);

    const tilemap = Array.from({ length: tilesPerCol }, () =>
      Array.from({ length: tilesPerRow }, (_, i) =>
        i >= centerTilePerRow - 2 && i <= centerTilePerRow + 2 ? 32 : 37,
      ),
    );

    // Player sprite sheet
    const playerSpriteSheet = new Image();
    playerSpriteSheet.src = "/src/assets/player.png";

    const playerSpriteWidth = 32; // Width of a single player sprite
    const playerSpriteHeight = 32; // Height of a single player sprite
    const playerTotalFrames = 24; // Total frames in the player sprite sheet
    let playerCurrentFrame = 18; // Current frame of the player animation
    let playerX = 32 * centerTilePerRow - 1; // Player's x position
    let playerY = canvas.height - playerSpriteHeight * 4; // Player's y position
    const playerScale = 1.5; // Scale factor for the player
    const playerFrameDelay = 100; // Frame delay in milliseconds
    let lastPlayerFrameTime = 0;
    let playerSpeed = 38; // Speed of the player

    // Enemy sprite sheet
    const enemySpriteSheet = new Image();
    enemySpriteSheet.src = "/src/assets/enemy.png";

    const enemySpriteWidth = 64; // Width of a single enemy sprite
    const enemySpriteHeight = 64; // Height of a single enemy sprite
    const enemyTotalFrames = 8; // Total frames in the enemy sprite sheet
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
    const enemyScale = 1; // Scale factor for enemies
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
        0, // Source y (assuming a single row of sprites)
        spriteWidth,
        spriteHeight,
        x,
        y,
        spriteWidth * scale,
        spriteHeight * scale,
      );
    };

    // Animation loop
    const animate = (timestamp: number) => {
      if (!ctx) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //draw background map of game
      for (let row = 0; row < tilemap.length; row++) {
        for (let col = 0; col < tilemap[row].length; col++) {
          const tileIndex = tilemap[row][col];
          const spriteX = (tileIndex % fieldTotalCols) * fieldSpriteWidth;
          const spriteY =
            Math.floor(tileIndex / fieldTotalCols) * fieldSpriteHeight;
          const x = col * fieldSpriteWidth;
          const y = row * fieldSpriteHeight;

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

          if (col === centerTilePerRow - 2) {
            const spriteX = 32 * 9;
            const spriteY = 32 * 1;
            ctx.drawImage(
              fieldWallsSpriteSheet,
              spriteX,
              spriteY,
              fieldSpriteWidth,
              fieldSpriteHeight,
              col * 32,
              row * fieldSpriteHeight,
              fieldSpriteWidth,
              fieldSpriteHeight,
            );
          }

          if (col === centerTilePerRow + 2) {
            const spriteX = 32 * 10;
            const spriteY = 32 * 3;
            ctx.drawImage(
              fieldWallsSpriteSheet,
              spriteX,
              spriteY,
              fieldSpriteWidth,
              fieldSpriteHeight,
              col * 32,
              row * fieldSpriteHeight,
              fieldSpriteWidth,
              fieldSpriteHeight,
            );
          }
        }
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

      // Add a new enemy every second
      if (timestamp - lastEnemyAddTime > 500 && enemyPositions.length < 10) {
        enemyPositions.push({
          x: [
            (centerTilePerRow - 2) * 34,
            (centerTilePerRow - 1) * 34,
            centerTilePerRow * 32,
            (centerTilePerRow - 1) * 34,
          ][Math.floor(Math.random() * 4)],
          y: -enemySpriteHeight * 1.5,
          animationSpeed: 100, // Update animation frame every 100ms
        });
        lastEnemyAddTime = timestamp;
      }

      //draw left tree
      ctx.drawImage(
        fieldAssetsSpriteSheet,
        0,
        0,
        156,
        256,
        32 * (centerTilePerRow - 6),
        100,
        156,
        256,
      );
      //draw right tree
      ctx.drawImage(
        fieldAssetsSpriteSheet,
        0,
        0,
        156,
        256,
        32 * (centerTilePerRow + 3),
        300,
        156,
        256,
      );

      // Update player frame
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
            width: playerSpriteWidth,
            height: playerSpriteHeight,
          },
          rect2: {
            x: enemy.x,
            y: enemy.y,
            width: enemySpriteWidth,
            height: enemySpriteHeight,
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
            setScore();
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
          if (playerX > (centerTilePerRow - 1) * 32) {
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
    ]).then(() => {
      requestAnimationFrame(animate);
    });
  }, []);

  return <canvas ref={canvasRef} />;
};

export default CanvasWithSeparateSprites;
