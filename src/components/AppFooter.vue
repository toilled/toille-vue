<template>
  <Transition name="slide-fade">
    <footer
      class="app-footer"
      v-if="noFootersShowing"
      v-show="contentVisible"
      @click="$emit('toggle-checker')"
    >
      <div class="container">
        <TypingText :text="t('footer.hint')" :skip-animation="hintHasBeenShown" />
      </div>
    </footer>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  noFootersShowing: boolean;
  contentVisible: boolean;
  hintHasBeenShown: boolean;
}>();

defineEmits<{
  'toggle-checker': [];
}>();

const { t } = useI18n();
</script>
