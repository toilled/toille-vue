<template>
  <Transition name="glitch-fade">
    <div v-if="visible" id="story-dialog-overlay">
      <!-- Briefing Screen -->
      <div v-if="showingBriefing" id="story-briefing" @click="dismiss">
        <div id="briefing-header">
          <span class="briefing-tag">MISSION</span>
          <span class="briefing-id">{{ currentMission?.id?.toUpperCase().replace(/-/g, " ") }}</span>
        </div>
        <div id="briefing-title">{{ currentMission?.title }}</div>
        <div id="briefing-divider">▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀</div>
        <div id="ai-notice">[ SYSTEM WARNING: STORY IS AI GENERATED ]</div>
        <div id="briefing-text">{{ currentMission?.brief }}</div>
        <div id="briefing-objectives" v-if="currentMission">
          <div class="objective-header">OBJECTIVES:</div>
          <div
            v-for="(obj, idx) in currentMission.objectives"
            :key="idx"
            class="objective-item"
          >
            <span class="obj-marker">{{ obj.completed ? "█" : "▣" }}</span>
            <span :class="{ completed: obj.completed }">{{ obj.label }}</span>
          </div>
        </div>
        <div id="briefing-hint">[ CLICK or press E to continue ]</div>
      </div>

      <!-- Dialogue Screen -->
      <div v-else-if="showingDialogue && currentDialogueLine" id="story-dialogue" @click="advance">
        <div id="dialogue-window">
          <div id="dialogue-header">
            <span class="dialogue-tag">INCOMING TRANSMISSION</span>
            <span class="dialogue-progress">{{ dialogueIndex + 1 }}/{{ currentMission?.dialogue.length }}</span>
          </div>
          <div id="dialogue-divider">────────────────────────────────</div>
          <div id="dialogue-text">
            <span v-for="(char, i) in displayedText" :key="i" :class="{ glitch: char === '[' || char === ']' }">{{ char }}</span>
            <span v-if="isTyping" class="cursor-blink">▌</span>
          </div>
          <div id="dialogue-hint" v-if="!isTyping">
            [ CLICK or press E to continue ]
          </div>
        </div>
      </div>

      <!-- Mission Complete Banner -->
      <Transition name="fade-up">
        <div v-if="missionComplete" id="mission-complete">
          <div id="complete-header">MISSION COMPLETE</div>
          <div id="complete-divider">▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀</div>
          <div id="complete-message">{{ currentMission?.completeMessage }}</div>
          <div id="complete-hint" v-if="hasNextMission">NEXT MISSION INCOMING...</div>
        </div>
      </Transition>

      <!-- HUD Objective Tracker -->
      <div id="objective-tracker" v-if="!showingBriefing && !showingDialogue">
        <div id="tracker-header">{{ currentMission?.title }}</div>
        <div
          v-for="(obj, idx) in currentMission?.objectives"
          :key="idx"
          class="tracker-item"
          :class="{ done: obj.completed }"
        >
          <span class="tracker-marker">{{ obj.completed ? "█" : "▣" }}</span>
          <span>{{ obj.label }}</span>
          <span class="tracker-status">{{ obj.completed ? "[DONE]" : "[PENDING]" }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { StoryMission } from "../game/types";
import { speak, stopSpeech } from "../utils/SpeechSynthesizer";

const props = defineProps({
  visible: { type: Boolean, default: false },
  showingBriefing: { type: Boolean, default: false },
  showingDialogue: { type: Boolean, default: false },
  missionComplete: { type: Boolean, default: false },
  dialogueIndex: { type: Number, default: 0 },
  currentMission: { type: Object as () => StoryMission | null, default: null },
  hasNextMission: { type: Boolean, default: false },
});

const emit = defineEmits(["dismiss", "advance"]);

const displayedText = ref("");
const isTyping = ref(false);
let typingTimer: ReturnType<typeof setInterval> | null = null;

const currentDialogueLine = computed(() => {
  if (!props.currentMission || !props.showingDialogue) return "";
  return props.currentMission.dialogue[props.dialogueIndex] ?? "";
});

function startTyping(text: string) {
  stopTyping();
  displayedText.value = "";
  isTyping.value = true;

  const clean = text.replace(/[[\]]/g, "").replace(/["']/g, "");
  speak(clean);

  let i = 0;
  typingTimer = setInterval(() => {
    if (i < text.length) {
      displayedText.value += text[i];
      i++;
    } else {
      isTyping.value = false;
      if (typingTimer) clearInterval(typingTimer);
    }
  }, 20);
}

function stopTyping() {
  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }
  isTyping.value = false;
}

function dismiss() {
  stopSpeech();
  emit("dismiss");
}

function advance() {
  if (isTyping.value) {
    stopSpeech();
    if (currentDialogueLine.value) {
      stopTyping();
      displayedText.value = currentDialogueLine.value;
    }
    return;
  }
  stopSpeech();
  emit("advance");
}

watch(
  () => [props.showingDialogue, props.dialogueIndex, props.currentMission?.id],
  () => {
    if (props.showingDialogue && currentDialogueLine.value) {
      startTyping(currentDialogueLine.value);
    } else {
      stopTyping();
    }
  },
  { immediate: true },
);

watch(
  () => props.showingBriefing,
  (val) => {
    if (!val) stopTyping();
  },
);

onBeforeUnmount(() => {
  stopTyping();
  stopSpeech();
});
</script>

<style scoped>
#story-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

#story-briefing,
#story-dialogue {
  pointer-events: auto;
  cursor: pointer;
}

#story-briefing {
  background: rgba(5, 5, 20, 0.92);
  border: 1px solid rgba(0, 255, 204, 0.3);
  box-shadow: 0 0 40px rgba(0, 255, 204, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.5);
  padding: 30px;
  max-width: 560px;
  width: 90%;
  animation: scan-in 0.3s ease-out;
}

#briefing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.briefing-tag {
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  color: #ff00cc;
  letter-spacing: 3px;
  text-shadow: 0 0 8px #ff00cc;
}

.briefing-id {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.4);
  letter-spacing: 1px;
}

#briefing-title {
  font-family: "Courier New", Courier, monospace;
  font-size: 28px;
  font-weight: bold;
  color: #00ffcc;
  text-shadow: 0 0 15px rgba(0, 255, 204, 0.5);
  margin-bottom: 8px;
  letter-spacing: 4px;
}

#briefing-divider {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.2);
  margin-bottom: 8px;
  letter-spacing: -1px;
}

#ai-notice {
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  color: #ff00cc;
  text-shadow: 0 0 8px rgba(255, 0, 204, 0.5);
  margin-bottom: 16px;
  letter-spacing: 2px;
  animation: pulse 2s infinite;
}

#briefing-text {
  font-family: "Courier New", Courier, monospace;
  font-size: 13px;
  color: #c0c0e0;
  line-height: 1.6;
  margin-bottom: 20px;
}

#briefing-objectives {
  margin-bottom: 16px;
}

.objective-header {
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  color: #ff00cc;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.objective-item {
  font-family: "Courier New", Courier, monospace;
  font-size: 12px;
  color: #e0e0ff;
  margin: 4px 0;
  display: flex;
  gap: 8px;
}

.obj-marker {
  color: #00ffcc;
}

.objective-item .completed {
  color: rgba(0, 255, 204, 0.4);
  text-decoration: line-through;
}

#briefing-hint {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.4);
  letter-spacing: 1px;
  animation: pulse 2s infinite;
}

#story-dialogue {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
}

#dialogue-window {
  background: rgba(5, 5, 20, 0.92);
  border: 1px solid rgba(0, 255, 204, 0.25);
  box-shadow: 0 0 30px rgba(0, 255, 204, 0.08);
  padding: 20px 24px;
  animation: slide-up 0.25s ease-out;
}

#dialogue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dialogue-tag {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: #00ffcc;
  letter-spacing: 2px;
  text-shadow: 0 0 6px rgba(0, 255, 204, 0.3);
}

.dialogue-progress {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.3);
}

#dialogue-divider {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.15);
  margin-bottom: 12px;
}

#dialogue-text {
  font-family: "Courier New", Courier, monospace;
  font-size: 14px;
  color: #d0d0f0;
  line-height: 1.7;
  min-height: 60px;
}

#dialogue-text .glitch {
  color: #ff00cc;
  text-shadow: 0 0 6px #ff00cc;
}

.cursor-blink {
  color: #00ffcc;
  animation: blink 0.6s step-end infinite;
}

#dialogue-hint {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(0, 255, 204, 0.3);
  margin-top: 12px;
  letter-spacing: 1px;
  animation: pulse 2s infinite;
}

#mission-complete {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

#complete-header {
  font-family: "Courier New", Courier, monospace;
  font-size: 24px;
  font-weight: bold;
  color: #ffcc00;
  text-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
  letter-spacing: 6px;
  margin-bottom: 8px;
}

#complete-divider {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: rgba(255, 204, 0, 0.2);
  margin-bottom: 16px;
}

#complete-message {
  font-family: "Courier New", Courier, monospace;
  font-size: 13px;
  color: #d0d0f0;
  max-width: 400px;
  line-height: 1.6;
}

#complete-hint {
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  color: #00ffcc;
  margin-top: 20px;
  letter-spacing: 2px;
  animation: pulse 1.5s infinite;
}

#objective-tracker {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 15;
  background: rgba(5, 5, 20, 0.8);
  border: 1px solid rgba(0, 255, 204, 0.15);
  padding: 10px 14px;
  min-width: 180px;
  pointer-events: none;
}

#tracker-header {
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  font-weight: bold;
  color: #00ffcc;
  letter-spacing: 2px;
  margin-bottom: 6px;
  text-shadow: 0 0 8px rgba(0, 255, 204, 0.3);
}

.tracker-item {
  font-family: "Courier New", Courier, monospace;
  font-size: 10px;
  color: #c0c0e0;
  display: flex;
  gap: 6px;
  margin: 3px 0;
  align-items: center;
}

.tracker-item.done {
  color: rgba(0, 255, 204, 0.3);
}

.tracker-marker {
  color: #00ffcc;
  flex-shrink: 0;
}

.tracker-item.done .tracker-marker {
  color: rgba(0, 255, 204, 0.3);
}

.tracker-status {
  margin-left: auto;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.2);
}

.tracker-item.done .tracker-status {
  color: rgba(0, 255, 204, 0.2);
}

@keyframes scan-in {
  from {
    opacity: 0;
    transform: scaleY(0.95) translateY(-10px);
    filter: hue-rotate(30deg);
  }
  to {
    opacity: 1;
    transform: scaleY(1) translateY(0);
    filter: hue-rotate(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes blink {
  50% { opacity: 0; }
}

.glitch-fade-enter-active {
  animation: glitch-fade-in 0.3s ease-out;
}

.glitch-fade-leave-active {
  animation: glitch-fade-out 0.2s ease-in;
}

@keyframes glitch-fade-in {
  0% { opacity: 0; clip-path: inset(50% 0 50% 0); }
  100% { opacity: 1; clip-path: inset(0 0 0 0); }
}

@keyframes glitch-fade-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.fade-up-enter-active {
  animation: fade-up-in 0.5s ease-out;
}

.fade-up-leave-active {
  animation: fade-up-out 0.3s ease-in;
}

@keyframes fade-up-in {
  0% { opacity: 0; transform: translate(-50%, -40%); }
  100% { opacity: 1; transform: translate(-50%, -50%); }
}

@keyframes fade-up-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
