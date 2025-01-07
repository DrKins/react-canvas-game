import { useEffect, useRef } from "react";
import { SpriteSheet } from "../utils/createSpriteSheet";

interface PlayerStats {
  x: number;
  y: number;
  id: number;
}

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerRef = useRef<PlayerStats>({
    x: window.innerWidth / 2,
    y: window.innerHeight - 200,
    id: Date.now(),
  });
  let animationId: number | null = null;

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

  const update = (timestamp: number) => {
    if (
      playerRef.current.y >
      (canvasRef.current as HTMLCanvasElement).height -
        playerSpriteSheetInstance.spriteHeight * 6
    ) {
      playerRef.current.y = playerRef.current.y - 0.5;
    }

    playerSpriteSheetInstance.updateCurrentFrame(timestamp);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    // Draw the player
    playerSpriteSheetInstance.draw({
      ctx,
      x: playerRef.current.x,
      y: playerRef.current.y,
    });
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
