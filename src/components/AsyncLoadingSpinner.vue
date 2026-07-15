<template>
  <div class="async-loading" role="status" aria-label="Loading">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.async-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 64px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 255, 204, 0.2);
  border-top-color: #00ffcc;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
