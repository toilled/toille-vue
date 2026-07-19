<template>
  <Transition name="slide-fade">
    <div class="container" style="min-width: 0" v-if="checker">
      <Checker :class="{ 'fade-out': gameMode }" />
    </div>
  </Transition>
  <Transition name="slide-fade">
    <div class="container" style="min-width: 0" v-if="activity">
      <Activity :class="{ 'fade-out': gameMode }" />
    </div>
  </Transition>
  <Transition name="slide-fade">
    <div class="container" style="min-width: 0" v-if="joke">
      <Suggestion
        :class="{ 'fade-out': gameMode }"
        url="https://icanhazdadjoke.com/"
        valueName="joke"
        :title="t('haveALaugh')"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { defineAsyncComponent } from 'vue';

const Checker = defineAsyncComponent(() => import('./Checker.vue'));
const Activity = defineAsyncComponent(() => import('./Activity.vue'));
const Suggestion = defineAsyncComponent(() => import('./Suggestion.vue'));

defineProps<{
  checker: boolean;
  activity: boolean;
  joke: boolean;
  gameMode: boolean;
}>();

const { t } = useI18n();
</script>
