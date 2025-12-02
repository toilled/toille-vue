<template>
  <v-container class="fill-height flex-column">
    <h1 class="text-h3 mb-4">Catch the Button!</h1>
    <p class="text-h5 mb-4">Score: {{ score }}</p>
    <v-card width="100%" height="70vh" class="position-relative" variant="outlined">
      <v-btn @click="moveButton" :style="buttonStyle" color="primary">Click Me!</v-btn>
    </v-card>
  </v-container>
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
