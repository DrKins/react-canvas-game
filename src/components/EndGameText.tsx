type EndGameTextVariant = "win" | "lose";

interface EndGameTextProps {
  variant: EndGameTextVariant;
  score: number;
  playAgain: () => void;
}
export const EndGameText: React.FC<EndGameTextProps> = ({
  variant,
  score,
  playAgain,
}) => {
  const handlePlayAgain = () => {
    localStorage.setItem("score", score.toString());
    playAgain();
  };

  return (
    <div className="end-game-text">
      {variant === "lose" ? (
        <span className="end-game-text__title">Game Over, you lost :(</span>
      ) : (
        <span className="end-game-text__title">
          Congratulations, you won :)
        </span>
      )}
      <span className="end-game-text__score">Score: {score}</span>
      <button className="end-game-text__button" onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  );
};
