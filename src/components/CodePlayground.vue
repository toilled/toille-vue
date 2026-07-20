<template>
  <section class="content-container playground-container" aria-label="JavaScript Code Playground">
    <article class="panel-3d playground-panel">
      <header class="playground-header">
        <h2>JS Playground</h2>
        <div class="playground-actions">
          <button class="outline run-btn" @click="runCode" :disabled="isRunning">
            {{ isRunning ? 'Running...' : 'Run' }}
          </button>
          <button class="outline clear-btn" @click="clearConsole">Clear</button>
        </div>
      </header>

      <div class="playground-layout">
        <div class="editor-pane">
          <div class="pane-label">EDITOR</div>
          <div ref="editorContainer" class="editor-container"></div>
        </div>
        <div class="output-pane">
          <div class="pane-label">CONSOLE</div>
          <div ref="consoleContainer" class="console-container">
            <div
              v-for="(entry, index) in consoleEntries"
              :key="index"
              class="console-entry"
              :class="`console-${entry.type}`"
            >
              <span class="console-prefix">{{
                entry.type === 'error' ? '!' : entry.type === 'warn' ? '?' : '>'
              }}</span>
              <span class="console-text">{{ entry.text }}</span>
            </div>
            <div v-if="consoleEntries.length === 0" class="console-empty">
              Click Run to execute your code...
            </div>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span class="status-text">JavaScript</span>
        <span v-if="lastRunTime !== null" class="status-text">Last run: {{ lastRunTime }}ms</span>
        <span v-if="errorCount > 0" class="status-text status-error"
          >{{ errorCount }} error{{ errorCount > 1 ? 's' : '' }}</span
        >
      </div>
    </article>

    <iframe
      ref="sandboxFrame"
      sandbox="allow-scripts"
      class="sandbox-iframe"
      title="Code execution sandbox"
    ></iframe>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput } from '@codemirror/language';

const DEFAULT_CODE = `// Welcome to the JS Playground!
// Write JavaScript and click Run to see the output.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci sequence:", results);
console.log("Sum:", results.reduce((a, b) => a + b, 0));

// Array methods
const words = ["hello", "world", "cyberpunk", "neon", "grid"];
const upper = words.map(w => w.toUpperCase());
console.log("Uppercased:", upper);

const filtered = words.filter(w => w.length > 4);
console.log("Long words:", filtered);
`;

const editorContainer = ref<HTMLElement | null>(null);
const consoleContainer = ref<HTMLElement | null>(null);
const sandboxFrame = ref<HTMLIFrameElement | null>(null);
const consoleEntries = ref<{ type: string; text: string }[]>([]);
const isRunning = ref(false);
const lastRunTime = ref<number | null>(null);
const errorCount = ref(0);

let editorView: EditorView | null = null;
let messageHandler: ((event: MessageEvent) => void) | null = null;

function scrollToBottom() {
  if (consoleContainer.value) {
    consoleContainer.value.scrollTop = consoleContainer.value.scrollHeight;
  }
}

function runCode() {
  if (!sandboxFrame.value || !editorView) return;

  isRunning.value = true;
  const code = editorView.state.doc.toString();

  const scriptSetup = `
    const __post = (type, args) => {
      parent.postMessage({ type: 'console', method: type, args: args.map(a => {
        if (a === null) return 'null';
        if (a === undefined) return 'undefined';
        if (typeof a === 'object') {
          try { return JSON.stringify(a, null, 2); } catch { return String(a); }
        }
        return String(a);
      })}, '*');
    };
    console.log = (...args) => __post('log', args);
    console.error = (...args) => __post('error', args);
    console.warn = (...args) => __post('warn', args);
    console.info = (...args) => __post('log', args);
    console.debug = (...args) => __post('log', args);
    window.onerror = (msg, src, line, col, err) => {
      __post('error', [msg + ' (line ' + line + ')']);
    };
    window.onunhandledrejection = (e) => {
      __post('error', ['Unhandled Promise rejection: ' + e.reason]);
    };
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'run') {
        try {
          const fn = new Function(e.data.code);
          const result = fn();
          if (result !== undefined) {
            __post('log', ['=> ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))]);
          }
        } catch (err) {
          __post('error', [err.message]);
        }
        parent.postMessage({ type: 'done' }, '*');
      }
    });
  `;

  const endScriptTag = '</' + 'script>';
  const openScriptTag = '<' + 'script>';
  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
    openScriptTag +
    scriptSetup +
    endScriptTag +
    '</body></html>';

  sandboxFrame.value.srcdoc = html;
  sandboxFrame.value.onload = () => {
    sandboxFrame.value?.contentWindow?.postMessage({ type: 'run', code }, '*');
  };
}

function handleConsoleMessage(event: MessageEvent) {
  if (!sandboxFrame.value || event.source !== sandboxFrame.value.contentWindow) return;

  if (event.data?.type === 'console') {
    consoleEntries.value.push({
      type: event.data.method,
      text: event.data.args.join(' '),
    });
    scrollToBottom();
  } else if (event.data?.type === 'done') {
    isRunning.value = false;
    lastRunTime.value = Math.round(performance.now() - (lastRunTime.value ?? 0));
    errorCount.value = consoleEntries.value.filter((e) => e.type === 'error').length;
  }
}

function clearConsole() {
  consoleEntries.value = [];
  errorCount.value = 0;
  lastRunTime.value = null;
}

function createCyberpunkTheme() {
  return EditorView.theme({
    '&': {
      backgroundColor: '#0a0a1a',
      color: '#e0e0e0',
      fontSize: '0.875rem',
      height: '100%',
    },
    '.cm-content': {
      caretColor: '#00ffcc',
      fontFamily: "'Courier New', Courier, monospace",
      padding: '0.5rem 0',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#00ffcc',
      borderLeftWidth: '2px',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(0, 255, 204, 0.06)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(0, 255, 204, 0.08)',
    },
    '.cm-gutters': {
      backgroundColor: '#080818',
      color: '#555577',
      borderRight: '1px solid rgba(0, 255, 204, 0.1)',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 0.5rem',
      minWidth: '2.5rem',
    },
    '.cm-foldGutter': {
      width: '0.8rem',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(0, 255, 204, 0.15) !important',
    },
    '.cm-searchMatch': {
      backgroundColor: 'rgba(255, 0, 204, 0.2)',
      outline: '1px solid rgba(255, 0, 204, 0.4)',
    },
    '.cm-matchingBracket': {
      backgroundColor: 'rgba(0, 255, 204, 0.15)',
      outline: '1px solid rgba(0, 255, 204, 0.4)',
    },
    '.cm-tooltip': {
      backgroundColor: '#0a0a1a',
      border: '1px solid rgba(0, 255, 204, 0.2)',
    },
  });
}

onMounted(() => {
  if (!editorContainer.value) return;

  const startState = EditorState.create({
    doc: DEFAULT_CODE,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      foldGutter(),
      indentOnInput(),
      bracketMatching(),
      highlightActiveLine(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      javascript(),
      oneDark,
      createCyberpunkTheme(),
      EditorView.lineWrapping,
    ],
  });

  editorView = new EditorView({
    state: startState,
    parent: editorContainer.value,
  });

  messageHandler = handleConsoleMessage;
  window.addEventListener('message', messageHandler);
});

onBeforeUnmount(() => {
  if (messageHandler) {
    window.removeEventListener('message', messageHandler);
    messageHandler = null;
  }
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
});
</script>

<style scoped>
.playground-container {
  max-width: 100%;
}

.playground-panel {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: none;
  animation: none;
}

.playground-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 204, 0.1);
}

.playground-header h2 {
  margin: 0;
}

.playground-actions {
  display: flex;
  gap: 0.5rem;
}

.run-btn {
  background: rgba(0, 255, 204, 0.15);
  border-color: #00ffcc;
  color: #00ffcc;
  font-weight: bold;
  letter-spacing: 0.05em;
}

.can-hover .run-btn:hover {
  background: rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
}

.clear-btn {
  font-size: 0.85rem;
}

.playground-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
  flex: 1;
}

.editor-pane,
.output-pane {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.editor-pane {
  border-right: 1px solid rgba(0, 255, 204, 0.1);
}

.pane-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: bold;
  letter-spacing: 0.15em;
  color: rgba(0, 255, 204, 0.5);
  padding: 0.4rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 255, 204, 0.08);
  user-select: none;
}

.editor-container {
  flex: 1;
  overflow: auto;
  min-height: 350px;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.console-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.6;
  min-height: 350px;
  background: #0a0a1a;
}

.console-entry {
  display: flex;
  gap: 0.5rem;
  padding: 0.15rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  white-space: pre-wrap;
  word-break: break-word;
}

.console-prefix {
  flex-shrink: 0;
  color: rgba(0, 255, 204, 0.5);
  font-weight: bold;
}

.console-log .console-text {
  color: #e0e0e0;
}

.console-error {
  background: rgba(255, 0, 204, 0.05);
}

.console-error .console-prefix {
  color: #ff5f56;
}

.console-error .console-text {
  color: #ff5f56;
}

.console-warn {
  background: rgba(255, 189, 46, 0.05);
}

.console-warn .console-prefix {
  color: #ffbd2e;
}

.console-warn .console-text {
  color: #ffbd2e;
}

.console-empty {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.35rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(0, 255, 204, 0.08);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
}

.status-error {
  color: #ff5f56;
}

.sandbox-iframe {
  position: absolute;
  width: 0;
  height: 0;
  border: none;
  pointer-events: none;
  opacity: 0;
}

@media (max-width: 768px) {
  .playground-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .editor-pane {
    border-right: none;
    border-bottom: 1px solid rgba(0, 255, 204, 0.1);
  }

  .editor-container {
    min-height: 250px;
  }

  .console-container {
    min-height: 200px;
  }
}
</style>
