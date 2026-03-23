import { Show } from "solid-js";
import { Controls, LookControls } from "../game/types";
import { ScoreEntry } from "../utils/ScoreService";
import LeaderboardModal from "./LeaderboardModal";
import GameOverModal from "./GameOverModal";

interface GameUIProps {
  isDrivingMode: boolean;
  isGameMode: boolean;
  isExplorationMode: boolean;
  isFlyingTour: boolean;
  isCinematicMode: boolean;
  isGameOver: boolean;
  isMobile: boolean;
  drivingScore: number;
  droneScore: number;
  timeLeft: number;
  distToTarget: number;
  controls: Controls;
  lookControls: LookControls;
  leaderboard: ScoreEntry[];
  showLeaderboard: boolean;
  onExitGameMode: () => void;
  onUpdateLeaderboard: (scores: ScoreEntry[]) => void;
  onCloseLeaderboard: () => void;
}

export default function GameUI(props: GameUIProps) {
  return (
    <>
      <Show when={(props.isDrivingMode ? props.drivingScore : props.droneScore) > 0}>
        <div id="score-counter">SCORE: {props.isDrivingMode ? props.drivingScore : props.droneScore}</div>
      </Show>

      <Show when={props.isDrivingMode}>
        <div id="timer-counter">
          TIME: {Math.ceil(props.timeLeft)}
        </div>
      </Show>

      <Show when={props.isDrivingMode}>
        <div id="dist-counter">
          DIST: {Math.ceil(props.distToTarget)}m
        </div>
      </Show>

      <Show when={props.isDrivingMode && props.isGameOver}>
        <GameOverModal
          isGameOver={props.isGameOver}
          drivingScore={props.drivingScore}
          droneScore={props.droneScore}
          isDrivingMode={props.isDrivingMode}
          leaderboard={props.leaderboard}
          onUpdateLeaderboard={props.onUpdateLeaderboard}
        />
      </Show>

      <Show when={props.showLeaderboard}>
        <LeaderboardModal
          showLeaderboard={props.showLeaderboard}
          leaderboard={props.leaderboard}
          onCloseLeaderboard={props.onCloseLeaderboard}
        />
      </Show>

      <Show when={props.isGameMode || props.isDrivingMode || props.isExplorationMode || props.isFlyingTour || props.isCinematicMode}>
        <button id="return-button" onClick={props.onExitGameMode}>
          RETURN
        </button>
      </Show>

      <Show when={props.isDrivingMode}>
        <div id="driving-controls">
          <div class="control-group left">
            <button
              class="control-btn"
              onMouseDown={() => (props.controls.left = true)}
              onMouseUp={() => (props.controls.left = false)}
              onMouseLeave={() => (props.controls.left = false)}
              onTouchStart={(e) => { e.preventDefault(); props.controls.left = true; }}
              onTouchEnd={(e) => { e.preventDefault(); props.controls.left = false; }}
            >
              ←
            </button>
            <button
              class="control-btn"
              onMouseDown={() => (props.controls.right = true)}
              onMouseUp={() => (props.controls.right = false)}
              onMouseLeave={() => (props.controls.right = false)}
              onTouchStart={(e) => { e.preventDefault(); props.controls.right = true; }}
              onTouchEnd={(e) => { e.preventDefault(); props.controls.right = false; }}
            >
              →
            </button>
          </div>
          <div class="control-group right">
            <button
              class="control-btn"
              onMouseDown={() => (props.controls.backward = true)}
              onMouseUp={() => (props.controls.backward = false)}
              onMouseLeave={() => (props.controls.backward = false)}
              onTouchStart={(e) => { e.preventDefault(); props.controls.backward = true; }}
              onTouchEnd={(e) => { e.preventDefault(); props.controls.backward = false; }}
            >
              BRK
            </button>
            <button
              class="control-btn"
              onMouseDown={() => (props.controls.forward = true)}
              onMouseUp={() => (props.controls.forward = false)}
              onMouseLeave={() => (props.controls.forward = false)}
              onTouchStart={(e) => { e.preventDefault(); props.controls.forward = true; }}
              onTouchEnd={(e) => { e.preventDefault(); props.controls.forward = false; }}
            >
              GAS
            </button>
          </div>
        </div>
      </Show>

      <Show when={props.isExplorationMode && props.isMobile}>
        <div id="exploration-controls">
          <div class="control-group left">
            <div class="dpad">
              <button
                class="dpad-btn up"
                onTouchStart={(e) => { e.preventDefault(); props.controls.forward = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.controls.forward = false; }}
              >
                W
              </button>
              <button
                class="dpad-btn left"
                onTouchStart={(e) => { e.preventDefault(); props.controls.left = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.controls.left = false; }}
              >
                A
              </button>
              <button
                class="dpad-btn right"
                onTouchStart={(e) => { e.preventDefault(); props.controls.right = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.controls.right = false; }}
              >
                D
              </button>
              <button
                class="dpad-btn down"
                onTouchStart={(e) => { e.preventDefault(); props.controls.backward = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.controls.backward = false; }}
              >
                S
              </button>
            </div>
          </div>
          <div class="control-group right">
            <div class="dpad">
              <button
                class="dpad-btn up"
                onTouchStart={(e) => { e.preventDefault(); props.lookControls.up = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.lookControls.up = false; }}
              >
                ↑
              </button>
              <button
                class="dpad-btn left"
                onTouchStart={(e) => { e.preventDefault(); props.lookControls.left = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.lookControls.left = false; }}
              >
                ←
              </button>
              <button
                class="dpad-btn right"
                onTouchStart={(e) => { e.preventDefault(); props.lookControls.right = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.lookControls.right = false; }}
              >
                →
              </button>
              <button
                class="dpad-btn down"
                onTouchStart={(e) => { e.preventDefault(); props.lookControls.down = true; }}
                onTouchEnd={(e) => { e.preventDefault(); props.lookControls.down = false; }}
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </Show>

      <style>{`
        #score-counter,
        #timer-counter,
        #dist-counter {
          position: fixed;
          top: 20px;
          color: #00ffcc;
          font-family: "Courier New", Courier, monospace;
          font-size: 24px;
          font-weight: bold;
          text-shadow: 0 0 10px #00ffcc;
          z-index: 10;
          pointer-events: none;
        }

        #score-counter {
          right: 20px;
        }

        #timer-counter {
          left: 20px;
        }

        #dist-counter {
          left: 50%;
          transform: translateX(-50%);
        }

        #return-button {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: #ff00cc;
          border: 1px solid #ff00cc;
          padding: 10px 20px;
          font-family: "Courier New", Courier, monospace;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          z-index: 10;
          text-shadow: 0 0 5px #ff00cc;
          box-shadow: 0 0 10px #ff00cc;
        }

        #return-button:hover {
          background: rgba(255, 0, 204, 0.2);
          color: #ffffff;
          text-shadow: 0 0 10px #ffffff;
        }

        #driving-controls,
        #exploration-controls {
          position: fixed;
          bottom: 80px;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding: 0 20px;
          box-sizing: border-box;
          z-index: 20;
          pointer-events: none;
        }

        .control-group {
          display: flex;
          gap: 20px;
          pointer-events: auto;
        }

        .control-btn {
          width: 60px;
          height: 60px;
          background: rgba(0, 255, 204, 0.2);
          border: 2px solid #00ffcc;
          border-radius: 50%;
          color: #00ffcc;
          font-size: 20px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        }

        .control-btn:active {
          background: rgba(0, 255, 204, 0.5);
          color: #fff;
        }

        .dpad {
          position: relative;
          width: 100px;
          height: 100px;
        }

        .dpad-btn {
          position: absolute;
          width: 30px;
          height: 30px;
          background: rgba(0, 255, 204, 0.2);
          border: 1px solid #00ffcc;
          color: #00ffcc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
        }
        .dpad-btn:active {
          background: rgba(0, 255, 204, 0.5);
          color: #fff;
        }

        .dpad-btn.up {
          top: 0;
          left: 35px;
        }
        .dpad-btn.down {
          bottom: 0;
          left: 35px;
        }
        .dpad-btn.left {
          top: 35px;
          left: 0;
        }
        .dpad-btn.right {
          top: 35px;
          right: 0;
        }
      `}</style>
    </>
  );
}
