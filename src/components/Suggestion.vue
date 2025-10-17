<template>
  <div
    @click="newSuggestion"
    :class="['container mx-auto px-4 mt-8', { 'cursor-progress': loading }]"
  >
    <div
      v-if="suggestion"
      :title="hoverHintText"
      class="bg-gray-800 rounded-lg shadow-lg p-4"
    >
      <div class="text-xl font-bold mb-2">
        <strong>{{ title }}</strong>
      </div>
      <p class="mb-0">{{ suggestion[valueName] }}</p>
    </div>
    <div v-else class="bg-gray-800 rounded-lg shadow-lg p-4">
      <div class="text-xl font-bold mb-2">
        <strong>{{ title }}</strong>
      </div>
      <p class="mb-0 animate-pulse">{{ url }} might be down.</p>
    </div>
    <Transition name="fade">
      <div v-if="!hideHint" class="text-center italic text-sm mt-2">
        Click to update
      </div>
    </Transition>
  </div>
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
