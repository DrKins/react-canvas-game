import { useState } from "react";
import "./App.css";
import { Canvas } from "./components/Canvas";
import { EndGameText } from "./components/EndGameText";

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [win, setWin] = useState(false);
  const localStorageScore = localStorage.getItem("score");

  const handleWin = () => {
    setWin(true);
    setLives(0);
  };

  return (
    <div className="app">
      {!!lives && (
        <section className="header-info">
          <h1 className="title">React game</h1>
          {localStorageScore && (
            <div className="high-score">High Score: {localStorageScore}</div>
          )}
          <div className="score">Score: {score}</div>
          <div className="lives">
            Lives: {new Array(lives).fill("❤️").join("")}
          </div>
        </section>
      )}
      {!!lives ? (
        <Canvas
          score={score}
          setScore={setScore}
          lives={lives}
          setLives={setLives}
          winGame={handleWin}
        />
      ) : (
        <EndGameText
          score={score}
          variant={lives === 0 && !win ? "lose" : "win"}
          playAgain={() => window.location.reload()}
        />
      )}
    </div>
  );
}

export default App;
