import { useState } from "react";
import "./App.css";
import { BallGame } from "./components/BallGame";

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [shouldWin, setShouldWin] = useState(false);
  return (
    <div className="app">
      {lives > 0 &&
        !shouldWin &&
        Array(lives)
          .fill(0)
          .map((_, index) => (
            <div
              key={`${index}-${lives}`}
              style={{
                position: "fixed",
                left: 25 + index * 50,
                top: 75,
                width: 25,
                height: 25,
                backgroundColor: "green",
              }}></div>
          ))}
      {lives > 0 && !shouldWin && (
        <span
          style={{
            position: "fixed",
            left: "25px",
            fontSize: "2rem",
            fontWeight: "bold",
          }}>
          Score: {score}
        </span>
      )}
      {lives === 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "90vh",
            justifyContent: "center",
          }}>
          <h1 style={{ color: "red" }}>Game Over</h1>
          <h1>Score: {score}</h1>
        </div>
      )}

      {shouldWin && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "90vh",
            justifyContent: "center",
          }}>
          <h1 style={{ color: "green" }}>You won game!</h1>
          <h1>Score: {score}</h1>
        </div>
      )}
      {lives > 0 && !shouldWin && (
        <BallGame
          updateScore={() => setScore((prev) => prev + 1)}
          updateLives={() =>
            setLives((prev) => {
              console.log(prev);
              return prev - 0.5;
            })
          }
          winGame={() => setShouldWin(true)}
        />
      )}
    </div>
  );
}

export default App;
