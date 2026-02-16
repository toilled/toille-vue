<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let text: string;

  let displayedText = '';
  let interval: any;

  onMount(() => {
    let index = 0;
    interval = setInterval(() => {
      if (index < text.length) {
        displayedText += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
  });

  onDestroy(() => {
      if (interval) clearInterval(interval);
  });
</script>

<p class="typing-effect">{displayedText}<span class="cursor"></span></p>

<style>
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
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
