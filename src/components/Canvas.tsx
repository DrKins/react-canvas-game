import { useEffect, useRef } from "react";
import { randomIntFromInterval } from "../utils/randomIntFromInterval";

type Position = {
  x: number;
  y: number;
};

type BallMove = "left" | "right" | "up" | "down";

interface CanvasProps {
  score: number;
  lives: number;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  score,
  setScore,
  lives,
  setLives,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Position>({ x: window.innerWidth / 2, y: 100 });
  const obstaclesRef = useRef<Position[]>([
    { x: 300, y: 400 },
    { x: 500, y: 500 },
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
      playerRef.current.x -= 15;
      return;
    }
    if (side === "right") {
      playerRef.current.x += 15;
      return;
    }

    if (side === "up") {
      playerRef.current.y -= 15;
      return;
    }
    if (side === "down") {
      playerRef.current.y += 15;
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
      obstaclesRef.current.forEach((obstacle) => {
        if (
          obstacle.x === playerRef.current.x &&
          obstacle.y === playerRef.current.y
        ) {
          console.log("Game Over");
        }
      });

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
        x: randomIntFromInterval(200, 600),
        y: playerRef.current.y + randomIntFromInterval(300, 600),
      };

      let isCollidingWithOtherObstacles = true;
      while (isCollidingWithOtherObstacles) {
        isCollidingWithOtherObstacles = false;
        obstaclesRef.current.forEach((obstacle) => {
          if (
            obstacle.x < newObstacle.x + 50 &&
            obstacle.x + 50 > newObstacle.x &&
            obstacle.y < newObstacle.y + 50 &&
            obstacle.y + 50 > newObstacle.y
          ) {
            newObstacle.x = randomIntFromInterval(200, 600);
            newObstacle.y =
              playerRef.current.y + randomIntFromInterval(300, 500);
            isCollidingWithOtherObstacles = true;
          }
        });
      }

      obstaclesRef.current.push(newObstacle);
    };

    const moveObstacleAndDetectCollision = () => {
      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
        const isOffScreen = obstacle.y > -50;

        if (!isOffScreen) {
          setLives(lives - 1);
          return false;
        }
        return true;
      });

      obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
        const isColliding =
          obstacle.x > playerRef.current.x - 80 &&
          obstacle.x < playerRef.current.x + 30 &&
          obstacle.y > playerRef.current.y - 80 &&
          obstacle.y < playerRef.current.y + 30;

        if (isColliding) {
          setScore(score + 1);
          return false;
        }
        return true;
      });

      obstaclesRef.current.forEach((obstacle) => {
        obstacle.y -= 2;
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    const obstacleInterval = setInterval(addObstacle, 1000);
    const gravitiyInterval = setInterval(moveObstacleAndDetectCollision, 50);

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
