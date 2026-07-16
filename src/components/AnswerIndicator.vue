<template>
  <span v-if="isCorrect" class="answer-indicator correct-indicator" aria-hidden="true">✓</span>
  <span v-else-if="isWrong" class="answer-indicator wrong-indicator" aria-hidden="true">✗</span>
</template>

<script setup lang="ts">
defineProps<{
  isCorrect: boolean;
  isWrong: boolean;
}>();
</script>

<style scoped>
.answer-indicator {
  margin-right: 0.5rem;
  font-weight: bold;
}

.correct-indicator {
  color: #00ffcc;
}

.wrong-indicator {
  color: #ff00cc;
}
</style>
