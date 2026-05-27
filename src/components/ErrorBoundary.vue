<template>
  <div v-if="hasError" class="error-boundary" role="alert">
    <h2>Something went wrong</h2>
    <p>{{ errorMessage }}</p>
    <button @click="resetError" class="outline">Try Again</button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";

const hasError = ref(false);
const errorMessage = ref("");

onErrorCaptured((err: Error) => {
  hasError.value = true;
  errorMessage.value = err.message || "An unexpected error occurred";
  console.error("Error caught by boundary:", err);
  return false;
});

function resetError() {
  hasError.value = false;
  errorMessage.value = "";
}
</script>

<style scoped>
.error-boundary {
  padding: 2rem;
  text-align: center;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  border-radius: 8px;
  margin: 2rem auto;
  max-width: 600px;
  color: #ff6666;
}

.error-boundary h2 {
  color: #ff0000;
  margin-bottom: 1rem;
}

.error-boundary button {
  margin-top: 1rem;
}
</style>
