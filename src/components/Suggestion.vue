<template>
  <button
    @click="newSuggestion"
    @keydown.enter="newSuggestion"
    @keydown.space.prevent="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container suggestion-button"
    type="button"
    :aria-label="t('suggestion.clickToUpdate')"
  >
    <article v-if="suggestion" :title="hoverHintText" class="marginless panel-3d">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless">{{ translatedSuggestionText }}</p>
    </article>
    <article v-else class="marginless panel-3d">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless" aria-busy="true">{{ url }} {{ t('suggestionDown') }}</p>
    </article>
    <Transition name="slide-fade">
      <article v-if="!hideHint">
        <footer style="font-style: oblique; font-size: 0.8em; margin-top: 0">
          {{ t('suggestion.clickToUpdate') }}
        </footer>
      </article>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTranslate } from '../composables/useTranslate';

const { t } = useI18n();
const { translate, locale } = useTranslate();

/**
 * @file Suggestion.vue
 * @description A reusable component that fetches a suggestion from a given API endpoint and displays it.
 * It's designed to be generic, working with different APIs that return a JSON object with a value to display.
 */

/**
 * @props {Object}
 * @property {string} url - The URL of the API to fetch the suggestion from.
 * @property {string} valueName - The name of the key in the JSON response that contains the suggestion text.
 * @property {string} title - The title to be displayed in the component's header.
 */
const props = defineProps<{
  url: string;
  valueName: string;
  title: string;
}>();

/**
 * @type {import('vue').Ref<Record<string, unknown> | null>}
 * @description A reactive reference to the suggestion object fetched from the API.
 */
const suggestion = ref<Record<string, unknown> | null>(null);

/**
 * @type {import('vue').Ref<string>}
 * @description A reactive reference to the translated suggestion text.
 */
const translatedSuggestionText = ref('');

/**
 * @type {import('vue').Ref<boolean>}
 * @description A reactive reference to indicate if a suggestion is currently being fetched.
 */
const loading = ref(false);

/**
 * @type {import('vue').Ref<boolean>}
 * @description A reactive reference to control the visibility of the "Click to update" hint.
 */
const hideHint = ref(false);

/**
 * @type {import('vue').ComputedRef<string>}
 * @description A computed property that generates the hover hint text based on the `valueName` prop.
 */
const hoverHintText = computed(() => t('suggestion.clickForNew', { name: props.valueName }));

/**
 * @description Fetches a suggestion from the provided URL and updates the component's state.
 * @returns {Promise<void>} A promise that resolves when the suggestion has been fetched.
 */
async function fetchSuggestion() {
  loading.value = true;
  try {
    const response = await fetch(props.url, {
      headers: { Accept: 'application/json' },
    });
    suggestion.value = await response.json();
    const s = suggestion.value;
    const raw = s ? (s[props.valueName] as string | undefined) : undefined;
    translatedSuggestionText.value = raw ?? '';
    if (raw) {
      translate(raw).then((t) => (translatedSuggestionText.value = t));
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

/**
 * @description Initiates fetching a new suggestion and hides the hint text.
 */
function newSuggestion() {
  fetchSuggestion();
  if (!hideHint.value) {
    hideHint.value = true;
  }
}

/**
 * @description A Vue lifecycle hook that fetches an initial suggestion when the component is mounted.
 */
onMounted(fetchSuggestion);

watch(locale, () => {
  const s = suggestion.value;
  if (!s) return;
  const raw = s[props.valueName] as string | undefined;
  translatedSuggestionText.value = raw ?? '';
  if (raw) {
    translate(raw).then((t) => (translatedSuggestionText.value = t));
  }
});
</script>
