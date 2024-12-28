import { useEffect, useState } from "react";

type BallMove = "left" | "right" | "up" | "down";

interface Position {
  x: number;
  y: number;
}

interface Props {
  updateScore: () => void;
  updateLives: () => void;
  winGame: () => void;
}

function randomIntFromInterval(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const BallGame: React.FC<Props> = ({
  updateScore,
  updateLives,
  winGame,
}) => {
  const [ballPosition, setBallPosition] = useState<Position>({
    x: window.innerWidth - window.innerWidth / 2 - 40,
    y: 400,
  });

  const [obsticlesPosition, setObsticlesPosition] = useState<Array<Position>>([
    {
      x: randomIntFromInterval(300, 900),
      y: 800,
    },
  ]);
  const handleMove = (side: BallMove) => {
    if (side === "left") {
      console.log("left");
      setBallPosition((prev) => ({
        ...prev,
        x: prev.x - 75,
      }));
      return;
    }
    if (side === "right") {
      setBallPosition((prev) => ({
        ...prev,
        x: prev.x + 75,
      }));
      console.log("right");
      return;
    }

    if (side === "up") {
      setBallPosition((prev) => ({
        ...prev,
        y: prev.y - 75,
      }));
      console.log("up");
      return;
    }
    if (side === "down") {
      setBallPosition((prev) => ({
        ...prev,
        y: prev.y + 75,
      }));
      console.log("down");
      return;
    }
  };

  useEffect(() => {
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
    const gravity = setInterval(() => {
      setObsticlesPosition((prev) =>
        prev
          .map((obsticle) => ({
            ...obsticle,
            y: obsticle.y - 10 * prev.length,
          }))
          .filter((obsticle) => {
            if (obsticle.y > -75) return obsticle;
            updateLives();
            return undefined;
          }),
      );
    }, 200);

    const obsticles = setInterval(() => {
      setObsticlesPosition((prev) => {
        const x =
          prev[prev.length - 1]?.x + randomIntFromInterval(-300, 300) >
            window.innerWidth ||
          prev[prev.length - 1]?.x + randomIntFromInterval(-300, 300) < 0
            ? randomIntFromInterval(300, 900)
            : prev[prev.length - 1]?.x + randomIntFromInterval(-300, 300);
        if (prev[prev.length - 1] === undefined) {
          winGame();
        }
        return [
          ...prev,
          {
            x,
            y: window.innerHeight / 2 + window.innerHeight / 4,
          },
        ];
      });
    }, 1000);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", (e) => e.preventDefault());

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", (e) => e.preventDefault());
      clearInterval(gravity);
      clearInterval(obsticles);
    };
  }, []);

  useEffect(() => {
    const checkCollision = () => {
      const obsticlesToRemove: Position[] = [];
      obsticlesPosition.forEach((obsticle) => {
        if (
          ballPosition.x < obsticle.x + 75 &&
          ballPosition.x + 75 > obsticle.x &&
          ballPosition.y < obsticle.y + 75 &&
          ballPosition.y + 75 > obsticle.y
        ) {
          obsticlesToRemove.push(obsticle);
          updateScore();
        }
      });
      setObsticlesPosition((prev) =>
        prev.filter((obsticle) => !obsticlesToRemove.includes(obsticle)),
      );
    };

    const collisionInterval = setInterval(checkCollision, 100);

    return () => clearInterval(collisionInterval);
  }, [ballPosition, obsticlesPosition, updateScore]);
  return (
    <>
      <div
        className="ball"
        style={{
          width: "75px",
          height: "75px",
          borderRadius: "50%",
          backgroundColor: "#FFB703",
          position: "absolute",
          left: `${ballPosition.x}px`,
          top: `${ballPosition.y}px`,
          transition: "left 0.1s ease, top 0.1s ease",
        }}></div>

      {obsticlesPosition.map((obsticle, index) => (
        <div
          key={index}
          className="puff-in-center"
          style={{
            width: "75px",
            height: "75px",
            backgroundColor: "green",
            position: "absolute",
            left: `${obsticle.x}px`,
            top: `${obsticle.y}px`,
            filter: "blur(50px)",
          }}></div>
      ))}
    </>
  );
};
