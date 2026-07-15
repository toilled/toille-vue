<template>
  <div class="route-loading" role="status" aria-label="Loading">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.route-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 255, 204, 0.2);
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
