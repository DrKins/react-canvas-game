import { useState } from "react";
import "./App.css";
import { BallGame } from "./components/BallGame";

function App() {
  const [shouldHide, setShouldHide] = useState(false);
  const [score, setScore] = useState(0);
  return (
    <div className="app">
      <span
        style={{
          position: "fixed",
          left: "25px",
          fontSize: "2rem",
          fontWeight: "bold",
        }}>
        Score: {score}
      </span>
      <span
        style={{ display: "block" }}
        className={shouldHide ? "fade-out" : ""}>
        Left or Right arrow keys to move ball.
      </span>
      <BallGame
        shouldHide={() => setShouldHide(true)}
        updateScore={() => setScore((prev) => prev + 1)}
      />
    </div>
  );
}

export default App;
