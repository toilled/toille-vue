<template>
  <v-container class="fill-height justify-center align-start pt-10">
    <v-card width="100%" max-width="800" class="pa-6" elevation="8">
      <v-card-title class="text-h4 font-weight-bold mb-4" @mousedown="handleMouseDown" style="cursor: help;">
        <template v-if="page">
          {{ page.title }}
          <Transition name="fade">
            <span
              v-if="showHint"
              class="text-body-2 font-italic font-weight-light"
              style="vertical-align: middle;"
            >
              - Nothing here
            </span>
          </Transition>
        </template>
        <template v-else> 404 - Page not found </template>
      </v-card-title>

      <v-card-text>
        <template v-if="page">
          <Paragraph
            v-for="(paragraph, index) in page.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === page.body.length"
          />
        </template>
        <template v-else>
          <Paragraph
            :paragraph="`The page <strong>${route.params.name}</strong> does not exist!`"
            :last="true"
          />
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph.vue";

const showHint = ref(false);
const route = useRoute();

const page = computed(() => {
  if (route.params.name) {
    return (
      pages.find((p) => p.link.slice(1) === route.params.name)
    );
  }
  if (route.params.pathMatch) {
    return null;
  }
  return pages[0];
});

function handleMouseDown() {
  showHint.value = true;
  setTimeout(() => {
    showHint.value = false;
  }, 500);
}
</script>
