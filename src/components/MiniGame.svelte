<script lang="ts">
  let score = 0;
  let buttonStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.3s ease',
  };

  function moveButton() {
    score++;
    const newX = Math.random() * 90;
    const newY = Math.random() * 90;
    buttonStyle = {
      ...buttonStyle,
      left: `${newX}%`,
      top: `${newY}%`,
    };
  }
</script>

<div class="container">
  <h1>Catch the Button!</h1>
  <p>Score: {score}</p>
  <div class="game-area">
    <button on:click={moveButton} style:position={buttonStyle.position} style:left={buttonStyle.left} style:top={buttonStyle.top} style:transform={buttonStyle.transform} style:transition={buttonStyle.transition}>Click Me!</button>
  </div>
</div>

<style>
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
</style>
