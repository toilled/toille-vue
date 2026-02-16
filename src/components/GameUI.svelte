<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ScoreService } from '../utils/ScoreService';
  import type { ScoreEntry } from '../utils/ScoreService';
  import type { Controls, LookControls } from '../game/types';

  export let isDrivingMode = false;
  export let isGameMode = false;
  export let isExplorationMode = false;
  export let isFlyingTour = false;
  export let isCinematicMode = false;
  export let isGameOver = false;
  export let isMobile = false;
  export let drivingScore = 0;
  export let droneScore = 0;
  export let timeLeft = 0;
  export let distToTarget = 0;
  export let controls: Controls;
  export let lookControls: LookControls;
  export let leaderboard: ScoreEntry[] = [];
  export let showLeaderboard = false;

  // Callback props for actions
  export let onExitGameMode: (() => void) | undefined = undefined;
  export let onUpdateLeaderboard: ((scores: ScoreEntry[]) => void) | undefined = undefined;
  export let onCloseLeaderboard: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let playerName = "";
  let isScoreSubmitted = false;

  // React to game over
  $: if (isGameOver && isDrivingMode) {
      isScoreSubmitted = false;
      ScoreService.getTopScores().then(scores => {
          if (onUpdateLeaderboard) onUpdateLeaderboard(scores);
          else dispatch("update-leaderboard", scores);
      });
  }

  async function submitHighScore() {
    if (!playerName.trim()) return;
    const nameUpper = playerName.trim().toUpperCase();
    const finalScore = isDrivingMode ? drivingScore : (droneScore || 0);
    const newScores = await ScoreService.submitScore(nameUpper, finalScore || 0);
    isScoreSubmitted = true;
    if (onUpdateLeaderboard) onUpdateLeaderboard(newScores);
    else dispatch("update-leaderboard", newScores);
  }

  function exitGameMode() {
      if (onExitGameMode) onExitGameMode();
      else dispatch("exit-game-mode");
  }
</script>

{#if (isDrivingMode ? drivingScore : droneScore) > 0}
  <div id="score-counter">SCORE: {isDrivingMode ? drivingScore : droneScore}</div>
{/if}

{#if isDrivingMode}
  <div id="timer-counter">
    TIME: {Math.ceil(timeLeft)}
  </div>
  <div id="dist-counter">
    DIST: {Math.ceil(distToTarget)}m
  </div>
{/if}

{#if isDrivingMode && isGameOver}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="game-over">
    <div class="game-over-title">GAME OVER</div>
    <div class="final-score">SCORE: {drivingScore}</div>

    {#if !isScoreSubmitted}
      <div class="score-form">
        <input
          bind:value={playerName}
          placeholder="ENTER NAME"
          maxlength="8"
          on:keyup={(e) => e.key === 'Enter' && submitHighScore()}
          class="name-input"
          autofocus
        />
        <button on:click={submitHighScore} class="submit-btn">SUBMIT</button>
      </div>
    {/if}

    <div class="leaderboard">
      <div class="lb-header">TOP DRIVERS</div>
      {#each leaderboard as entry, index}
        <div class="lb-row">
          <span class="lb-name">{index + 1}. {entry.name}</span>
          <span class="lb-score">{entry.score}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if showLeaderboard}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div id="leaderboard-modal">
    <div class="lb-header">LEADERBOARD</div>
    {#each leaderboard as entry, index}
      <div class="lb-row">
        <span class="lb-name">{index + 1}. {entry.name}</span>
        <span class="lb-score">{entry.score}</span>
      </div>
    {/each}
    <button class="close-btn" on:click={() => onCloseLeaderboard ? onCloseLeaderboard() : dispatch('close-leaderboard')}>CLOSE</button>
  </div>
{/if}

{#if isGameMode || isDrivingMode || isExplorationMode || isFlyingTour || isCinematicMode}
  <button
    id="return-button"
    on:click={exitGameMode}
  >
    RETURN
  </button>
{/if}

{#if isDrivingMode}
  <div id="driving-controls">
    <div class="control-group left">
      <button
        class="control-btn"
        on:mousedown={() => controls.left = true}
        on:mouseup={() => controls.left = false}
        on:mouseleave={() => controls.left = false}
        on:touchstart|preventDefault={() => controls.left = true}
        on:touchend|preventDefault={() => controls.left = false}
      >
        ←
      </button>
      <button
        class="control-btn"
        on:mousedown={() => controls.right = true}
        on:mouseup={() => controls.right = false}
        on:mouseleave={() => controls.right = false}
        on:touchstart|preventDefault={() => controls.right = true}
        on:touchend|preventDefault={() => controls.right = false}
      >
        →
      </button>
    </div>
    <div class="control-group right">
      <button
        class="control-btn"
        on:mousedown={() => controls.backward = true}
        on:mouseup={() => controls.backward = false}
        on:mouseleave={() => controls.backward = false}
        on:touchstart|preventDefault={() => controls.backward = true}
        on:touchend|preventDefault={() => controls.backward = false}
      >
        BRK
      </button>
      <button
        class="control-btn"
        on:mousedown={() => controls.forward = true}
        on:mouseup={() => controls.forward = false}
        on:mouseleave={() => controls.forward = false}
        on:touchstart|preventDefault={() => controls.forward = true}
        on:touchend|preventDefault={() => controls.forward = false}
      >
        GAS
      </button>
    </div>
  </div>
{/if}

{#if isExplorationMode && isMobile}
  <div id="exploration-controls">
    <div class="control-group left">
      <div class="dpad">
        <button
          class="dpad-btn up"
          on:touchstart|preventDefault={() => controls.forward = true}
          on:touchend|preventDefault={() => controls.forward = false}
        >
          W
        </button>
        <button
          class="dpad-btn left"
          on:touchstart|preventDefault={() => controls.left = true}
          on:touchend|preventDefault={() => controls.left = false}
        >
          A
        </button>
        <button
          class="dpad-btn right"
          on:touchstart|preventDefault={() => controls.right = true}
          on:touchend|preventDefault={() => controls.right = false}
        >
          D
        </button>
        <button
          class="dpad-btn down"
          on:touchstart|preventDefault={() => controls.backward = true}
          on:touchend|preventDefault={() => controls.backward = false}
        >
          S
        </button>
      </div>
    </div>
    <div class="control-group right">
      <div class="dpad">
        <button
          class="dpad-btn up"
          on:touchstart|preventDefault={() => lookControls.up = true}
          on:touchend|preventDefault={() => lookControls.up = false}
        >
          ↑
        </button>
        <button
          class="dpad-btn left"
          on:touchstart|preventDefault={() => lookControls.left = true}
          on:touchend|preventDefault={() => lookControls.left = false}
        >
          ←
        </button>
        <button
          class="dpad-btn right"
          on:touchstart|preventDefault={() => lookControls.right = true}
          on:touchend|preventDefault={() => lookControls.right = false}
        >
          →
        </button>
        <button
          class="dpad-btn down"
          on:touchstart|preventDefault={() => lookControls.down = true}
          on:touchend|preventDefault={() => lookControls.down = false}
        >
          ↓
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
#score-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  color: #00ffcc;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #00ffcc;
  pointer-events: none;
}

#timer-counter {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #ff00cc;
  font-family: "Courier New", Courier, monospace;
  font-size: 32px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ff00cc;
  pointer-events: none;
}

#dist-counter {
  position: fixed;
  top: 60px; /* Below timer */
  left: 50%;
  transform: translateX(-50%);
  color: #ffff00;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 10;
  text-shadow: 0 0 10px #ffff00;
  pointer-events: none;
}

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
  pointer-events: none; /* Allow clicks to pass through empty space */
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

#leaderboard-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #00ffcc;
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  z-index: 100;
  text-shadow: 0 0 20px #00ffcc;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border: 4px solid #00ffcc;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 400px;
}
.close-btn {
  margin-top: 20px;
  background: #00ffcc;
  color: #000;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}
.close-btn:hover {
  background: #fff;
}
</style>
