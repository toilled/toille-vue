import { createSignal } from "solid-js";

interface ButtonStyle {
  position: "absolute";
  left: string;
  top: string;
  transform: string;
  transition: string;
}

export default function MiniGame() {
  const [score, setScore] = createSignal(0);

  const [buttonStyle, setButtonStyle] = createSignal<ButtonStyle>({
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    transition: "all 0.3s ease",
  });

  const moveButton = () => {
    setScore(score() + 1);
    const newX = Math.random() * 90;
    const newY = Math.random() * 90;
    setButtonStyle((prev) => ({
      ...prev,
      left: `${newX}%`,
      top: `${newY}%`,
    }));
  };

  return (
    <div class="container">
      <h1>Catch the Button!</h1>
      <p>Score: {score()}</p>
      <div class="game-area">
        <button onClick={moveButton} style={buttonStyle()}>Click Me!</button>
      </div>
      <style>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 2rem;
        }
        .game-area {
          position: relative;
          width: 100%;
          height: 70vh;
          border: 1px solid #ccc;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
