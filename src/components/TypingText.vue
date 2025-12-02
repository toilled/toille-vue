<template>
  <p class="typing-effect text-body-1">{{ displayedText }}<span class="cursor"></span></p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  text: string;
}>();

const displayedText = ref('');
let index = 0;

onMounted(() => {
  const typing = setInterval(() => {
    if (index < props.text.length) {
      displayedText.value += props.text.charAt(index);
      index++;
    } else {
      clearInterval(typing);
    }
  }, 100);
});
</script>

<style scoped>
.typing-effect {
  color: #00ff00;
  font-family: 'Courier New', Courier, monospace;
}

.cursor {
  display: inline-block;
  width: 10px;
  height: 1.2em;
  background-color: #00ff00;
  animation: blink 0.7s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
