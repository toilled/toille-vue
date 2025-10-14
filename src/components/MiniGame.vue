<template>
  <div class="container">
    <h1>Catch the Button!</h1>
    <p>Score: {{ score }}</p>
    <div class="game-area">
      <button @click="moveButton" :style="buttonStyle">Click Me!</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const score = ref(0);
const buttonStyle = reactive({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'all 0.3s ease',
});

const moveButton = () => {
  score.value++;
  const newX = Math.random() * 90;
  const newY = Math.random() * 90;
  buttonStyle.left = `${newX}%`;
  buttonStyle.top = `${newY}%`;
};
</script>

<style scoped>
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