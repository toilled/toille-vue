<template>
  <footer
    @click="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container"
  >
    <article v-if="suggestion" :title="hoverHintText" style="margin-bottom: 0">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless">{{ suggestion[valueName] }}</p>
    </article>
    <article v-else style="margin-bottom: 0">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless" aria-busy="true">{{ url }} might be down.</p>
    </article>
    <Transition name="fade">
      <article v-if="!hideHint" style="padding-top: 0; margin-top: 0; margin-bottom: 0">
        <footer style="font-style: oblique; font-size: 0.8em; margin-top: 0">
          Click to update
        </footer>
      </article>
    </Transition>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

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
 * @type {import('vue').Ref<any>}
 * @description A reactive reference to the suggestion object fetched from the API.
 */
const suggestion = ref<any>(null);

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
const hoverHintText = computed(() => "Click for a new " + props.valueName);

/**
 * @description Fetches a suggestion from the provided URL and updates the component's state.
 * @returns {Promise<void>} A promise that resolves when the suggestion has been fetched.
 */
async function fetchSuggestion() {
  loading.value = true;
  try {
    const response = await fetch(props.url, {
      headers: { Accept: "application/json" },
    });
    suggestion.value = await response.json();
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
</script>
