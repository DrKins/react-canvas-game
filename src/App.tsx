import { useState } from "react";
import "./App.css";
import { Game } from "./components/Game";

type GameState = "idle" | "playing" | "end";
function App() {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");

  if (gameState === "idle") {
    return (
      <section className="start-page">
        <h1 className="end-game-text__title">React game</h1>
        <div
          className="end-game-text__button"
          onClick={() => setGameState("playing")}>
          Start
        </div>
      </section>
    );
  }

  if (gameState === "end") {
    return (
      <section className="end-page">
        <h1 className="end-game-text__title">React game</h1>
        <div className="end-game-text__score">Score: {score}</div>
        <div
          className="end-game-text__button"
          onClick={() => {
            window.location.reload();
          }}>
          Back to main menu
        </div>
      </section>
    );
  }

  if (gameState === "playing") return <Game />;
  // return (
  //   <div>
  //     {
  //       <section className="header-info">
  //         <h1 className="title">React game</h1>
  //         <div className="score">Score: {score}</div>
  //       </section>
  //     }
  //     <Canvas
  //       setScore={() => {
  //         setScore((prev) => prev + 1);
  //       }}
  //       endGame={() => setGameState("end")}
  //     />
  //   </div>
  // );
}

export default App;
