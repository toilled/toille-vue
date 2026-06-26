<template>
  <aside class="terminal-overlay" @click.self="close">
    <div class="terminal" ref="terminalRef" @keydown="handleKeydown" tabindex="0">
      <div class="terminal-header">
        <span class="terminal-title">TOILLE://TERMINAL</span>
        <div class="terminal-controls">
          <span class="dot close" @click.stop="close" title="Close" />
          <span class="dot min" />
          <span class="dot max" />
        </div>
      </div>
      <div class="terminal-body" ref="bodyRef">
        <div v-for="(line, i) in lines" :key="i" class="terminal-line" :class="line.class">
          <pre v-if="line.pre">{{ line.text }}</pre>
          <span v-else-if="!line.pre">{{ line.text }}</span>
        </div>
        <div v-if="!animating" class="terminal-input-line">
          <span class="prompt">{{ prompt }}</span>
          <span class="input-text">{{ currentInput }}</span>
          <span class="cursor" :class="{ blink: !animating }">&#9608;</span>
        </div>
        <div v-if="animating" class="terminal-line boot-line">
          <span>{{ bootText }}</span>
          <span class="cursor blink">&#9608;</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { createCommands, commandAliases } from './terminal/terminalCommands';
import type { TerminalContext } from './terminal/terminalCommands';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const terminalRef = ref<HTMLElement | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const lines = ref<{ text: string; pre?: boolean; class?: string }[]>([]);
const currentInput = ref('');
const commandHistory = ref<string[]>([]);
const historyIndex = ref(-1);
const animating = ref(true);
const bootText = ref('');
const startTime = ref(Date.now());
const matrixInterval = ref<ReturnType<typeof setInterval> | null>(null);

const prompt = 'guest@toille:~$ ';

function close() {
  if (matrixInterval.value) {
    clearInterval(matrixInterval.value);
    matrixInterval.value = null;
  }
  emit('close');
}

function scrollToBottom() {
  nextTick(() => {
    if (bodyRef.value) {
      bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
    }
  });
}

function addLine(text: string, cls?: string) {
  if (cls) {
    lines.value.push({ text, class: cls });
  } else {
    lines.value.push({ text });
  }
}

function addPre(text: string, cls?: string) {
  if (cls) {
    lines.value.push({ text, pre: true, class: cls });
  } else {
    lines.value.push({ text, pre: true });
  }
}

function bootSequence() {
  const bootLines = [
    { text: 'sys: TOILLE-OS v3.0.1 booting...', delay: 200 },
    { text: 'sys: kernel loaded (cyberpunk-neon 6.6.0-cyber)', delay: 150 },
    { text: 'sys: memory check... 64TB OK', delay: 120 },
    { text: 'sys: neon-grid init... OK', delay: 180 },
    { text: 'sys: quantum entropy pool seeded', delay: 100 },
    { text: 'sys: network interfaces up (10.0.0.42)', delay: 250 },
    { text: 'sys: city data-link established', delay: 200 },
    { text: 'sys: audio system ready', delay: 150 },
    { text: 'sec: firewall active (1327 rules)', delay: 100 },
    { text: 'sec: intrusion detection online', delay: 150 },
    { text: 'sys: login prompt ready', delay: 100 },
    { text: '', delay: 100 },
    { text: 'TOILLE-OS v3.0.1 (cyberpunk-neon 6.6.0-cyber)', delay: 50 },
    { text: "Type 'help' for available commands.", delay: 50 },
    { text: '', delay: 50 },
  ];
  let i = 0;
  function nextBoot() {
    if (i < bootLines.length) {
      bootText.value = bootLines[i].text;
      scrollToBottom();
      i++;
      setTimeout(nextBoot, bootLines[i - 1].delay);
    } else {
      animating.value = false;
      bootText.value = '';
      terminalRef.value?.focus();
      scrollToBottom();
    }
  }
  nextBoot();
}

onMounted(() => {
  bootSequence();
});

const ctx: TerminalContext = {
  addLine,
  addPre,
  clearLines: () => {
    lines.value = [];
  },
  scrollToBottom,
  close,
  bootSequence,
  commandHistory: commandHistory.value,
  historyIndex: historyIndex as unknown as { value: number },
  startTime: startTime.value,
  matrixInterval: matrixInterval as unknown as { value: ReturnType<typeof setInterval> | null },
};

const commands = createCommands(ctx);

function executeCommand(cmd: string) {
  const trimmed = cmd.trim();
  if (!trimmed) return;

  addLine(`${prompt}${trimmed}`);
  commandHistory.value.push(trimmed);
  historyIndex.value = commandHistory.value.length;

  const parts = trimmed.split(/\s+/);
  let command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const resolved = commandAliases[command] || command;
  if (commands[resolved]) {
    commands[resolved](args);
  } else {
    addLine(`command not found: ${command}`, 'error');
    addLine("Type 'help' for a list of available commands.", 'info');
  }

  scrollToBottom();
}

function handleKeydown(e: KeyboardEvent) {
  if (animating.value) return;

  const actions: Record<string, (ev: KeyboardEvent) => void> = {
    Enter(ev) {
      ev.preventDefault();
      executeCommand(currentInput.value);
      currentInput.value = '';
    },
    Backspace(ev) {
      ev.preventDefault();
      currentInput.value = currentInput.value.slice(0, -1);
    },
    ArrowUp(ev) {
      ev.preventDefault();
      if (commandHistory.value.length > 0 && historyIndex.value > 0) {
        historyIndex.value--;
        currentInput.value = commandHistory.value[historyIndex.value];
      }
    },
    ArrowDown(ev) {
      ev.preventDefault();
      if (historyIndex.value < commandHistory.value.length - 1) {
        historyIndex.value++;
        currentInput.value = commandHistory.value[historyIndex.value];
      } else {
        historyIndex.value = commandHistory.value.length;
        currentInput.value = '';
      }
    },
    Tab(ev) {
      ev.preventDefault();
    },
    Delete(ev) {
      ev.preventDefault();
    },
  };

  if (actions[e.key]) {
    actions[e.key](e);
    return;
  }

  if (e.key === 'l' && e.ctrlKey) {
    e.preventDefault();
    lines.value = [];
    return;
  }

  if (e.key === 'd' && e.ctrlKey) {
    e.preventDefault();
    commands.exit([]);
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();
    currentInput.value += e.key;
  }
}
</script>

<style scoped>
.terminal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(5, 5, 16, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.terminal {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: #0a0a1a;
  border: 1px solid rgba(0, 255, 204, 0.3);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    0 0 40px rgba(0, 255, 204, 0.15),
    0 0 80px rgba(255, 0, 204, 0.1),
    inset 0 0 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  outline: none;
  color: #00ffcc;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(0, 255, 204, 0.15);
  flex-shrink: 0;
}

.terminal-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: #ff00cc;
  text-shadow: 0 0 10px rgba(255, 0, 204, 0.5);
  letter-spacing: 0.1em;
}

.terminal-controls {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot.close {
  background: #ff5f56;
  cursor: pointer;
  transition: all 0.2s ease;
}

.can-hover .dot.close:hover {
  filter: brightness(1.3);
  box-shadow: 0 0 6px rgba(255, 95, 86, 0.6);
}

.dot.min {
  background: #ffbd2e;
}

.dot.max {
  background: #27c93f;
}

.terminal-body {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 300px;
  max-height: calc(80vh - 42px);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 204, 0.3) transparent;
}

.terminal-body::-webkit-scrollbar {
  width: 4px;
}

.terminal-body::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 1px;
}

.terminal-line pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  white-space: pre;
  overflow-x: auto;
}

.terminal-line.error {
  color: #ff5f56;
}

.terminal-line.info {
  color: rgba(0, 255, 204, 0.7);
}

.terminal-line.fortune {
  font-style: italic;
  color: rgba(0, 255, 204, 0.8);
}

.terminal-line.matrix {
  color: rgba(0, 255, 0, 0.6);
  font-size: 0.75rem;
  line-height: 1.1;
}

.terminal-line.rainbow {
  background: linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.terminal-line.banner {
  color: #ff00cc;
  font-weight: bold;
}

.terminal-line.help {
  color: rgba(0, 255, 204, 0.85);
  font-size: 0.8rem;
}

.terminal-line.neofetch {
  color: #00ffcc;
}

.terminal-line.scan {
  color: rgba(0, 255, 204, 0.75);
}

.terminal-line.story {
  color: rgba(255, 0, 204, 0.8);
}

.terminal-line.city {
  color: rgba(0, 255, 204, 0.85);
}

.terminal-line.skills {
  color: rgba(0, 255, 204, 0.8);
}

.terminal-input-line {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: pre;
}

.prompt {
  color: #ff00cc;
  flex-shrink: 0;
}

.input-text {
  color: #00ffcc;
}

.cursor {
  color: #00ffcc;
  animation: blink-anim 0.8s step-end infinite;
  margin-left: 1px;
  line-height: 1;
}

.cursor.blink {
  animation: blink-anim 0.8s step-end infinite;
}

@keyframes blink-anim {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.terminal-overlay:not(:focus-within) .cursor {
  animation: none;
  opacity: 0.4;
}

@media (max-width: 600px) {
  .terminal-overlay {
    padding: 0.5rem;
    align-items: stretch;
  }

  .terminal {
    max-height: 95vh;
    font-size: 0.75rem;
  }

  .terminal-body {
    min-height: 200px;
    max-height: calc(95vh - 42px);
  }
}
</style>
