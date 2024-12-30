import { useState } from "react";
import "./App.css";
import CanvasWithSpriteSheet from "./components/CanvasWithSprite";

function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="app">
      {
        <section className="header-info">
          <h1 className="title">React game</h1>
          <div className="score">Score: {score}</div>
        </section>
      }
      <CanvasWithSpriteSheet
        score={score}
        setScore={() => setScore((prev) => prev + 1)}
      />
    </div>
  );
}

export default App;
