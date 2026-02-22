<template>
  <footer
    @click="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container"
  >
    <article v-if="activity" title="Click for a new suggestion" class="marginless">
      <header>
        <strong>
          Try this {{ activity.type }} activity
        </strong>
        (The Bored API)
      </header>
      <p class="marginless">{{ activity.activity }}</p>
    </article>
    <article v-else class="marginless">
      <header>
        <strong>Try this activity</strong>
      </header>
      <p class="marginless" aria-busy="true">
        Loading from The Bored API.
      </p>
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