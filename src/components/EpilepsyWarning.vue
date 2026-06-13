<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showWarning" class="epilepsy-overlay" @click.self="cancel">
        <div class="epilepsy-modal">
          <div class="modal-header">⚠ SYSTEM WARNING</div>
          <div class="modal-body">{{ warningMessage }}</div>
          <div class="modal-footer">
            <button class="btn btn-confirm" @click="confirm">I Understand</button>
            <button class="btn btn-cancel" @click="cancel">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useEpilepsyWarning } from "../composables/useEpilepsyWarning";

const { showWarning, warningMessage, resolveConfirm } = useEpilepsyWarning();

function confirm() {
  resolveConfirm(true);
}

function cancel() {
  resolveConfirm(false);
}
</script>

<style scoped>
.epilepsy-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(5, 5, 16, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.epilepsy-modal {
  background: #0a0a1a;
  border: 2px solid rgba(255, 0, 0, 0.5);
  border-radius: 10px;
  box-shadow:
    0 0 40px rgba(255, 0, 0, 0.15),
    0 0 80px rgba(255, 0, 0, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.5);
  padding: 2rem;
  max-width: 520px;
  width: 100%;
  font-family: "Courier New", Courier, monospace;
  color: #ff5f56;
}

.modal-header {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ff0000;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255, 0, 0, 0.3);
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

.modal-body {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 95, 86, 0.9);
  white-space: pre-line;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.6rem 1.5rem;
  border: 1px solid;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
  background: transparent;
}

.btn-confirm {
  color: #00ffcc;
  border-color: #00ffcc;
}

.btn-confirm:hover {
  background: rgba(0, 255, 204, 0.15);
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
}

.btn-cancel {
  color: #ff5f56;
  border-color: #ff5f56;
}

.btn-cancel:hover {
  background: rgba(255, 95, 86, 0.15);
  box-shadow: 0 0 15px rgba(255, 95, 86, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
