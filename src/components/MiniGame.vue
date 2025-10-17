<template>
  <div class="flex flex-col items-center pt-8">
    <h1 class="text-3xl font-bold">Catch the Button!</h1>
    <p class="text-xl">Score: {{ score }}</p>
    <div class="relative w-full h-[70vh] border border-gray-300 mt-4">
      <button
        @click="moveButton"
        :style="buttonStyle"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Click Me!
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

/**
 * @file MiniGame.vue
 * @description A simple mini-game where the user tries to click a button that moves to a random position on each click.
 */

/**
 * @type {import('vue').Ref<number>}
 * @description A reactive reference to the player's score.
 */
const score = ref(0);

/**
 * @type {import('vue').Reactive<object>}
 * @description A reactive object for the button's CSS styles, allowing its position to be updated dynamically.
 */
const buttonStyle = reactive({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  transition: "all 0.3s ease",
});

/**
 * @description Handles the button click event. It increments the score and moves the button to a new random position within the game area.
 */
const moveButton = () => {
  score.value++;
  const newX = Math.random() * 90;
  const newY = Math.random() * 90;
  buttonStyle.left = `${newX}%`;
  buttonStyle.top = `${newY}%`;
};
</script>