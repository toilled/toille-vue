<template>
  <div class="d-flex align-center">
    <template v-if="$vuetify.display.mdAndUp">
        <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    </template>

    <v-menu v-else>
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-menu" v-bind="props"></v-btn>
      </template>
      <v-list>
        <v-list-item v-for="page in pages" :key="page.link" :to="page.link">
           <v-list-item-title>{{ page.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn icon @click="toggleSound" class="ml-2">
      <v-icon>{{ soundOn ? 'mdi-volume-high' : 'mdi-volume-off' }}</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import MenuItem from "./MenuItem.vue";
import { Page } from "../interfaces/Page";

defineProps<{
  pages: Page[];
}>();

const soundOn = ref(false);
let audio: HTMLAudioElement | null = null;

const toggleSound = () => {
  if (!audio) {
    audio = new Audio("/ambient-space-sound.mp3");
    audio.loop = true;
  }

  soundOn.value = !soundOn.value;
  if (soundOn.value) {
    audio.play();
  } else {
    audio.pause();
  }
};
</script>
