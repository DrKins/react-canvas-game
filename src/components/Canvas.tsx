import { useEffect, useRef } from "react";
import { randomIntFromInterval } from "../utils/randomIntFromInterval";

type Position = {
  x: number;
  y: number;
};

type BallMove = "left" | "right" | "up" | "down";

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Position>({ x: window.innerWidth / 2, y: 100 });
  const obstaclesRef = useRef<Position[]>([
    { x: 500, y: 600 },
    { x: 700, y: 500 },
  ]);

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw the circle
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, 30, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the obstacles
    ctx.fillStyle = "black";
    obstaclesRef.current.forEach((obstacle) => {
      ctx.fillRect(obstacle.x, obstacle.y, 50, 50);
    });
  };

  const handleMove = (side: BallMove) => {
    if (side === "left") {
      console.log("left");
      playerRef.current.x -= 75;
      return;
    }
    if (side === "right") {
      playerRef.current.x += 75;
      console.log("right");
      return;
    }

    if (side === "up") {
      playerRef.current.y -= 75;
      console.log("up");
      return;
    }
    if (side === "down") {
      playerRef.current.y += 75;
      console.log("down");
      return;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas!.width = window.innerWidth;
    canvas!.height = window.innerHeight;
    const context = canvas?.getContext("2d");
    let frameCount = 0;
    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleMove("left");
      }
      if (e.key === "ArrowRight") {
        handleMove("right");
      }
      if (e.key === "ArrowUp") {
        handleMove("up");
      }
      if (e.key === "ArrowDown") {
        handleMove("down");
      }
    };

    // Function to add a new obstacle every second
    const addObstacle = () => {
      if (obstaclesRef.current.length >= 5) return;

      const newObstacle: Position = {
        x: randomIntFromInterval(200, 900),
        y: playerRef.current.y + randomIntFromInterval(400, 900),
      };
      obstaclesRef.current.push(newObstacle);
    };

    // Function to move the obstacles up
    const moveObstacle = () => {
      // Remove obstacles that are off the screen
      obstaclesRef.current = obstaclesRef.current.filter(
        (obstacle) =>
          obstacle.y > -50 &&
          !(
            obstacle.x < playerRef.current.x + 30 &&
            obstacle.x + 30 > playerRef.current.x &&
            obstacle.y < playerRef.current.y + 75 &&
            obstacle.y + 75 > playerRef.current.y
          ),
      );

      obstaclesRef.current.forEach((obstacle) => {
        obstacle.y -= 5;
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    const obstacleInterval = setInterval(addObstacle, 1000);
    const gravitiyInterval = setInterval(moveObstacle, 100);

    const render = () => {
      frameCount++;
      draw(context!);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(animationFrameId);
      clearInterval(obstacleInterval);
      clearInterval(gravitiyInterval);
    };
  }, [draw]);

  return <canvas ref={canvasRef}></canvas>;
};
