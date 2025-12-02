<template>
  <v-footer app color="transparent" class="justify-center">
    <v-card
      width="100%"
      max-width="600"
      @click="newSuggestion"
      :style="{ cursor: loading ? 'progress' : 'pointer' }"
      elevation="8"
      :title="hoverHintText"
    >
      <v-card-title>
        <strong>{{ title }}</strong>
      </v-card-title>

      <v-card-text>
        <p v-if="suggestion" class="text-body-1 mb-0">{{ suggestion[valueName] }}</p>
        <div v-else class="d-flex align-center">
             <p class="text-body-1 mb-0 mr-2" aria-busy="true">{{ url }} might be down.</p>
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
import { ref, onMounted, computed } from "vue";

const props = defineProps<{
  url: string;
  valueName: string;
  title: string;
}>();

const suggestion = ref<any>(null);
const loading = ref(false);
const hideHint = ref(false);

const hoverHintText = computed(() => "Click for a new " + props.valueName);

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

function newSuggestion() {
  fetchSuggestion();
  if (!hideHint.value) {
    hideHint.value = true;
  }
}

onMounted(fetchSuggestion);
</script>
