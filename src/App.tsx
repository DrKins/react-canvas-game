import { useState } from "react";
import "./App.css";
import { Canvas } from "./components/Canvas";
import { EndGameText } from "./components/EndGameText";

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  return (
    <div className="app">
      {!!lives && (
        <section>
          <h1 className="title">React game</h1>
          <div className="score">Score: {score}</div>
          <div className="lives">Lives: {lives}</div>
        </section>
      )}
      {!!lives ? (
        <Canvas
          score={score}
          setScore={setScore}
          lives={lives}
          setLives={setLives}
        />
      ) : (
        <EndGameText variant={lives === 0 ? "lose" : "win"} />
      )}
    </div>
  );
}

export default App;
