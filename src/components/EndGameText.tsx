type EndGameTextVariant = "win" | "lose";

interface EndGameTextProps {
  variant: EndGameTextVariant;
}
export const EndGameText: React.FC<EndGameTextProps> = ({ variant }) => {
  if (variant === "win") {
    return (
      <div className="end-game">
        <h1>You Won! :)</h1>
      </div>
    );
  }

  return (
    <div className="end-game">
      <h1>Game Over :(</h1>
    </div>
  );
};
