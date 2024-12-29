import { useEffect, useRef, useState } from "react";
import { intersects } from "../utils/intersects";
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
  const [target, setTarget] = useState<Position | { x: null; y: null }>({
    x: null,
    y: null,
  });
  const [maxObstacles, setMaxObstacles] = useState(5);
  const [ballRadius, setBallRadius] = useState(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Position & { speed: number }>({
    x: 400,
    y: Math.min(0 + randomIntFromInterval(300, 600), 300),
    speed: 10,
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
    ctx.arc(
      playerRef.current.x,
      playerRef.current.y,
      ballRadius,
      0,
      2 * Math.PI,
    );
    ctx.fill();

    // Draw the obstacles
    ctx.fillStyle = "black";
    obstaclesRef.current.forEach((obstacle) => {
      ctx.fillRect(obstacle.x, obstacle.y, 50, 50);
    });
  };

  const handleMove = (side: BallMove) => {
    const { speed } = playerRef.current;
    switch (side) {
      case "left":
        playerRef.current.x -= speed;
        target.x = playerRef.current.x;
        target.y = playerRef.current.y;
        break;
      case "right":
        playerRef.current.x += speed;
        target.x = playerRef.current.x;
        target.y = playerRef.current.y;
        break;
      case "up":
        playerRef.current.y -= speed;
        target.x = playerRef.current.x;
        target.y = playerRef.current.y;
        break;
      case "down":
        playerRef.current.y += speed;
        target.x = playerRef.current.x;
        target.y = playerRef.current.y;
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
        const isColliding = intersects({
          circle: {
            x: playerRef.current.x,
            y: playerRef.current.y,
            r: ballRadius,
          },
          rect: { x: obstacle.x, y: obstacle.y, width: 50, height: 50 },
        });

        if (isColliding) {
          setScore(score + 1);
          if (score % 5 === 0 && score > 0) {
            setMaxObstacles((prev) => prev + 1);
            //setBallRadius((prev) => prev + 10);
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
    const gravitiyInterval = setInterval(() => {
      moveObstacleAndDetectCollision();
      movePlayerOnClick();
    }, 50);

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
  const handleMoveClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setTarget({ x, y });
    }
  };

  const movePlayerOnClick = () => {
    const { x, y, speed } = playerRef.current;

    const dx = target.x! - x;
    const dy = target.y! - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!target.x && !target.y) {
    } else if (distance > speed) {
      playerRef.current.x += (dx / distance) * speed;
      playerRef.current.y += (dy / distance) * speed;
    } else {
      playerRef.current.x = target.x!;
      playerRef.current.y = target.y!;
    }
  };

  return <canvas ref={canvasRef} onClick={handleMoveClick}></canvas>;
};
