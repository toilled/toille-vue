<template>
  <footer
    @click="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container"
  >
    <article v-if="activity" :title="t('activity.clickForNew')" class="marginless">
      <header>
        <strong>
          {{ t('activity.title', { type: activity.type }) }}
        </strong>
        {{ t('activity.boredApi') }}
      </header>
      <p class="marginless">{{ translatedActivityText }}</p>
    </article>
    <article v-else class="marginless">
      <header>
        <strong>{{ t('activity.tryActivity') }}</strong>
      </header>
      <p class="marginless" aria-busy="true">
        {{ t('activity.loading') }}
      </p>
    </article>
    <Transition name="slide-fade">
      <article v-if="!hideHint">
        <footer style="font-style: oblique; font-size: 0.8em; margin-top: 0">
          {{ t('activity.clickToUpdate') }}
        </footer>
      </article>
    </Transition>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTranslate } from '../composables/useTranslate';

const { t } = useI18n();
const { translate, locale } = useTranslate();

/**
 * @file Activity.vue
 * @description A component that fetches and displays a random activity suggestion from The Bored API.
 * It shows a loading state and allows users to fetch a new suggestion by clicking on it.
 */

/**
 * @type {import('vue').Ref<any>}
 * @description A reactive reference to the activity object fetched from the API.
 * It is null until the first activity is fetched.
 */
const activity = ref<any>(null);

/**
 * @type {import('vue').Ref<boolean>}
 * @description A reactive reference to indicate if an activity is currently being fetched.
 */
const loading = ref(false);

/**
 * @type {import('vue').Ref<string>}
 * @description A reactive reference to the translated activity text.
 */
const translatedActivityText = ref('');

/**
 * @type {import('vue').Ref<boolean>}
 * @description A reactive reference to control the visibility of the "Click to update" hint.
 * It becomes true after the first user-initiated suggestion fetch.
 */
const hideHint = ref(false);

/**
 * @description Fetches a random activity from The Bored API and updates the component's state.
 * Sets the loading state during the fetch operation.
 * @returns {Promise<void>} A promise that resolves when the activity has been fetched and state updated.
 */
async function fetchActivity() {
  loading.value = true;
  try {
    const response = await fetch('https://bored.api.lewagon.com/api/activity');
    activity.value = await response.json();
    translatedActivityText.value = activity.value.activity;
    translate(activity.value.activity).then((t) => (translatedActivityText.value = t));
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

/**
 * @description Initiates fetching a new activity suggestion and hides the hint text.
 */
function newSuggestion() {
  fetchActivity();
  if (!hideHint.value) {
    hideHint.value = true;
  }
}

/**
 * @description A Vue lifecycle hook that fetches an initial activity when the component is mounted.
 */
onMounted(fetchActivity);

watch(locale, () => {
  if (activity.value) {
    translatedActivityText.value = activity.value.activity;
    translate(activity.value.activity).then((t) => (translatedActivityText.value = t));
  }
});
</script>
