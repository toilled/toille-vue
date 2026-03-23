import { createSignal, createEffect, Show, For } from "solid-js";
import { ScoreService, type ScoreEntry } from "../utils/ScoreService";

interface GameOverModalProps {
  isGameOver: boolean;
  drivingScore: number;
  droneScore: number;
  isDrivingMode: boolean;
  leaderboard: ScoreEntry[];
  onUpdateLeaderboard: (scores: ScoreEntry[]) => void;
}

export default function GameOverModal(props: GameOverModalProps) {
  const [playerName, setPlayerName] = createSignal("");
  const [isScoreSubmitted, setIsScoreSubmitted] = createSignal(false);

  createEffect(async () => {
    if (props.isGameOver && props.isDrivingMode) {
      setIsScoreSubmitted(false);
      const scores = await ScoreService.getTopScores();
      props.onUpdateLeaderboard(scores);
    }
  });

  async function submitHighScore() {
    if (!playerName().trim()) return;
    const nameUpper = playerName().trim().toUpperCase();
    const finalScore = props.isDrivingMode ? props.drivingScore : (props.droneScore || 0);
    const newScores = await ScoreService.submitScore(nameUpper, finalScore || 0);
    setIsScoreSubmitted(true);
    props.onUpdateLeaderboard(newScores);
  }

  return (
    <Show when={props.isGameOver}>
      <div id="game-over">
        <div class="game-over-title">GAME OVER</div>
        <div class="final-score">SCORE: {props.drivingScore}</div>

        <Show when={!isScoreSubmitted()}>
          <div class="score-form">
            <input
              value={playerName()}
              onInput={(e) => setPlayerName(e.currentTarget.value)}
              placeholder="ENTER NAME"
              maxlength="8"
              onKeyUp={(e) => e.key === "Enter" && submitHighScore()}
              class="name-input"
              autofocus
            />
            <button onClick={submitHighScore} class="submit-btn">SUBMIT</button>
          </div>
        </Show>

        <div class="leaderboard">
          <div class="lb-header">TOP DRIVERS</div>
          <For each={props.leaderboard}>
            {(entry, index) => (
              <div class="lb-row">
                <span class="lb-name">{index() + 1}. {entry.name}</span>
                <span class="lb-score">{entry.score}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <style>{`
        #game-over {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ff0000;
          font-family: "Courier New", Courier, monospace;
          font-size: 64px;
          font-weight: bold;
          z-index: 30;
          text-shadow: 0 0 20px #ff0000;
          pointer-events: auto;
          background: rgba(0, 0, 0, 0.9);
          padding: 40px;
          border: 4px solid #ff0000;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 400px;
        }

        .game-over-title {
          font-size: 64px;
          color: #ff0000;
          margin-bottom: 20px;
        }
        .final-score {
          font-size: 32px;
          color: #ffff00;
          margin-bottom: 30px;
        }
        .score-form {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          z-index: 100;
        }
        .name-input {
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid #00ffcc;
          color: #00ffcc;
          padding: 10px;
          font-family: inherit;
          font-size: 24px;
          text-transform: uppercase;
          width: 200px;
          pointer-events: auto;
        }
        .submit-btn {
          background: #00ffcc;
          color: #000;
          border: none;
          padding: 10px 20px;
          font-family: inherit;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          pointer-events: auto;
        }
        .submit-btn:hover {
          background: #fff;
        }
        .leaderboard {
          width: 100%;
          max-width: 400px;
          text-align: left;
        }
        .lb-header {
          color: #ff00cc;
          font-size: 24px;
          border-bottom: 2px solid #ff00cc;
          margin-bottom: 10px;
          padding-bottom: 5px;
        }
        .lb-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          font-size: 20px;
          color: #fff;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
      `}</style>
    </Show>
  );
}
