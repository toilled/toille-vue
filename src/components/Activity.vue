<template>
  <v-footer app color="transparent" class="justify-center">
    <v-card
      width="100%"
      max-width="600"
      @click="newSuggestion"
      :style="{ cursor: loading ? 'progress' : 'pointer' }"
      elevation="8"
    >
      <v-card-title>
        <template v-if="activity">
          <strong>Try this {{ activity.type }} activity</strong>
          <span class="text-caption ml-2">(The Bored API)</span>
        </template>
        <template v-else>
            <strong>Try this activity</strong>
        </template>
      </v-card-title>
      <v-card-text>
        <div v-if="activity">
          <p class="text-body-1 mb-0">{{ activity.activity }}</p>
        </div>
        <div v-else class="d-flex align-center">
            <p class="text-body-1 mb-0 mr-2">Loading from The Bored API.</p>
            <v-progress-circular indeterminate size="20"></v-progress-circular>
        </div>
      </v-card-text>

      <v-expand-transition>
        <v-card-actions v-if="!hideHint" class="pt-0">
             <span class="text-caption font-italic">Click to update</span>
        </v-card-actions>
      </v-expand-transition>
    </v-card>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const activity = ref<any>(null);
const loading = ref(false);
const hideHint = ref(false);

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

function newSuggestion() {
  fetchActivity();
  if (!hideHint.value) {
    hideHint.value = true;
  }
}

onMounted(fetchActivity);
</script>
