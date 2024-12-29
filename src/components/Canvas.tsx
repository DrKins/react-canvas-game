import { useEffect, useRef, useState } from "react";
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
  winGame: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  score,
  setScore,
  lives,
  setLives,
  winGame,
}) => {
  const [maxObstacles, setMaxObstacles] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Position>({
    x: 400,
    y: Math.min(0 + randomIntFromInterval(300, 600), 300),
  });
  const obstaclesRef = useRef<Position[]>([
    {
      x: randomIntFromInterval(0, window.innerWidth - 50),
      y: playerRef.current.y + randomIntFromInterval(200, 400),
    },
    {
      x: randomIntFromInterval(0, window.innerWidth - 50),
      y: playerRef.current.y + randomIntFromInterval(500, 600),
    },
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
    switch (side) {
      case "left":
        playerRef.current.x -= 45;
        break;
      case "right":
        playerRef.current.x += 45;
        break;
      case "up":
        playerRef.current.y -= 45;
        break;
      case "down":
        playerRef.current.y += 45;
        break;
      default:
        console.error("Invalid move");
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;
      canvas.width = containerWidth; // Limit width for visibility
      canvas.height = containerHeight;
    }
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
      if (obstaclesRef.current.length >= maxObstacles) return;

      const newObstacle: Position = {
        x: randomIntFromInterval(0, window.innerWidth - 50),
        y: Math.min(
          playerRef.current.y + randomIntFromInterval(300, 600),
          window.innerHeight - 50,
        ),
      };

      let isCollidingWithOtherObstacles = true;
      while (isCollidingWithOtherObstacles) {
        isCollidingWithOtherObstacles = false;
        obstaclesRef.current.forEach((obstacle) => {
          if (
            obstacle.x < newObstacle.x + 100 &&
            obstacle.x + 100 > newObstacle.x &&
            obstacle.y < newObstacle.y + 100 &&
            obstacle.y + 100 > newObstacle.y
          ) {
            (newObstacle.x = randomIntFromInterval(0, window.innerWidth - 50)),
              (newObstacle.y = Math.min(
                playerRef.current.y + randomIntFromInterval(300, 600),
                window.innerHeight - 50,
              ));
            isCollidingWithOtherObstacles = true;
          }
        });
      }

      obstaclesRef.current.push(newObstacle);
    };

    const moveObstacleAndDetectCollision = () => {
      if (obstaclesRef.current.length === 0) {
        winGame();
        return;
      }

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
          if (score % 5 === 0 && score > 0) {
            setMaxObstacles((prev) => prev + 1);
          }
          return false;
        }
        return true;
      });

      obstaclesRef.current.forEach((obstacle) => {
        obstacle.y -= 2;
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    const obstacleInterval = setInterval(addObstacle, 750);
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
