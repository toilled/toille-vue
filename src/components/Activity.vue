<template>
  <div
    @click="newSuggestion"
    :class="['container mx-auto px-4 mt-8', { 'cursor-progress': loading }]"
  >
    <div
      v-if="activity"
      title="Click for a new suggestion"
      class="bg-gray-800 rounded-lg shadow-lg p-4"
    >
      <div class="text-xl font-bold mb-2">
        <strong> Try this {{ activity.type }} activity </strong>
        <span class="text-sm font-normal">(The Bored API)</span>
      </div>
      <p class="mb-0">{{ activity.activity }}</p>
    </div>
    <div v-else class="bg-gray-800 rounded-lg shadow-lg p-4">
      <div class="text-xl font-bold mb-2">
        <strong>Try this activity</strong>
      </div>
      <p class="mb-0 animate-pulse">Loading from The Bored API.</p>
    </div>
    <Transition name="fade">
      <div v-if="!hideHint" class="text-center italic text-sm mt-2">
        Click to update
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

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
    const response = await fetch("https://bored.api.lewagon.com/api/activity");
    activity.value = await response.json();
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
</script>