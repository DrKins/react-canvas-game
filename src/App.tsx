import { useState } from "react";
import "./App.css";
import Canvas from "./components/Canvas";

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
      <Canvas
        score={score}
        setScore={(score: number) => setScore((prev) => prev + score)}
      />
      <section className="footer-info">
        <h1 className="title">Game made by</h1>
        <div className="score">DrKins</div>
      </section>
    </div>
  );
}

export default App;
