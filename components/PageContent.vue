<template>
  <main>
    <section>
      <header>
        <h2 class="title" @mousedown="handleMouseDown">
          <template v-if="page">
            {{ page.title }}
            <Transition name="fade">
              <span
                v-if="showHint"
                style="
                  font-weight: 100;
                  font-style: italic;
                  font-size: 0.6em;
                  vertical-align: middle;
                "
              >
                - Nothing here
              </span>
            </Transition>
          </template>
          <template v-else> 404 - Page not found </template>
        </h2>
      </header>
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
          :paragraph="`The page <strong>${name}</strong> does not exist!`"
          :last="true"
        />
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import pages from "~/configs/pages.json";
import Paragraph from "./Paragraph.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const showHint = ref(false);

const page = computed(() => {
  if (props.name === "home") {
    return pages.find((p) => p.link === "/");
  }
  return pages.find((p) => p.link === `/${props.name}`);
});

function handleMouseDown() {
  showHint.value = true;
  setTimeout(() => {
    showHint.value = false;
  }, 500);
}
</script>
