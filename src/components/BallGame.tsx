import { useEffect, useState } from "react";

type BallMove = "left" | "right";

interface Position {
  x: number;
  y: number;
}

interface Props {
  shouldHide: () => void;
  updateScore: () => void;
}

export const BallGame: React.FC<Props> = ({ shouldHide, updateScore }) => {
  const [ballPosition, setBallPosition] = useState<Position>({
    x: window.innerWidth - window.innerWidth / 2 - 40,
    y: 200,
  });

  const [obsticlesPosition, setObsticlesPosition] = useState<Array<Position>>([
    {
      x: Math.floor(Math.random() * 201) + 500,
      y: 500,
    },
  ]);
  const handleMove = (side: BallMove) => {
    shouldHide();
    if (side === "left") {
      console.log("left");
      setBallPosition((prev) => ({ ...prev, x: prev.x - 50 }));
      return;
    }
    if (side === "right") {
      setBallPosition((prev) => ({ ...prev, x: prev.x + 50 }));
      console.log("right");
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
    };
    const gravity = setInterval(() => {
      setBallPosition((prev) => ({ ...prev, y: prev.y + 10 }));
    }, 200);

    const obsticles = setInterval(() => {
      setObsticlesPosition((prev) => [
        ...prev,
        {
          x: Math.floor(Math.random() * 201) + 500,
          y: obsticlesPosition[obsticlesPosition.length - 1].y + 400,
        },
      ]);
    }, 2500);

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
          transition: "top 0.2s ease",
        }}></div>

      {obsticlesPosition.map((obsticle) => (
        <div
          style={{
            width: "75px",
            height: "75px",
            backgroundColor: "green",
            position: "absolute",
            left: `${obsticle.x}px`,
            top: `${obsticle.y}px`,
            transition: "top 0.2s ease",
          }}></div>
      ))}
    </>
  );
};
