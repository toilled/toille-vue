<template>
  <Transition name="glitch-fade">
    <div v-if="visible" id="story-dialog-overlay">
      <StoryBriefing v-if="showingBriefing" :current-mission="currentMission" @dismiss="dismiss" />
      <StoryDialogue
        v-else-if="showingDialogue && currentDialogueLine"
        :current-mission="currentMission"
        :displayed-text="displayedText"
        :is-typing="isTyping"
        :dialogue-index="dialogueIndex"
        @advance="advance"
      />
      <StoryMissionComplete
        v-if="missionComplete"
        :current-mission="currentMission"
        :has-next-mission="hasNextMission"
      />
      <StoryObjectiveTracker
        v-if="!showingBriefing && !showingDialogue"
        :current-mission="currentMission"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { StoryMission } from '../game/types';
import { speak, stopSpeech } from '../utils/SpeechSynthesizer';
import StoryBriefing from './story/StoryBriefing.vue';
import StoryDialogue from './story/StoryDialogue.vue';
import StoryMissionComplete from './story/StoryMissionComplete.vue';
import StoryObjectiveTracker from './story/StoryObjectiveTracker.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
  showingBriefing: { type: Boolean, default: false },
  showingDialogue: { type: Boolean, default: false },
  missionComplete: { type: Boolean, default: false },
  dialogueIndex: { type: Number, default: 0 },
  currentMission: { type: Object as () => StoryMission | null, default: null },
  hasNextMission: { type: Boolean, default: false },
});

const emit = defineEmits(['dismiss', 'advance']);

const displayedText = ref('');
const isTyping = ref(false);
let typingTimer: ReturnType<typeof setInterval> | null = null;

const currentDialogueLine = computed(() => {
  if (!props.currentMission || !props.showingDialogue) return '';
  return props.currentMission.dialogue[props.dialogueIndex] ?? '';
});

function startTyping(text: string) {
  stopTyping();
  displayedText.value = '';
  isTyping.value = true;

  const clean = text.replace(/[[\]]/g, '').replace(/["']/g, '');
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
  emit('dismiss');
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
  emit('advance');
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
  { immediate: true }
);

watch(
  () => props.showingBriefing,
  (val) => {
    if (!val) stopTyping();
  }
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

.glitch-fade-enter-active {
  animation: glitch-fade-in 0.3s ease-out;
}

.glitch-fade-leave-active {
  animation: glitch-fade-out 0.2s ease-in;
}

@keyframes glitch-fade-in {
  0% {
    opacity: 0;
    clip-path: inset(50% 0 50% 0);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes glitch-fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
