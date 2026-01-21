<template>
  <header>
    <h2 class="title" @mousedown="handleMouseDown">
      {{ title }}
      <Transition name="fade">
        <span
          v-if="showHint"
          style="
            font-weight: 100;
            font-style: italic;
            font-size: 0.6em;
            vertical-align: middle;
          "
        >
          - Nothing here
        </span>
      </Transition>
    </h2>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
}>();

const showHint = ref(false);

function handleMouseDown() {
  showHint.value = true;
  setTimeout(() => {
    showHint.value = false;
  }, 500);
}
</script>
