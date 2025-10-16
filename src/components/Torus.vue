<template>
  <TresMesh ref="torusRef">
    <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
    <TresMeshBasicMaterial color="orange" />
  </TresMesh>
</template>

<script setup lang="ts">
import { useLoop } from '@tresjs/core';
import { ref } from 'vue';
import { Mesh } from 'three';

const torusRef = ref<Mesh | null>(null);

const { onBeforeRender } = useLoop();

onBeforeRender(({ delta }) => {
  if (torusRef.value) {
    torusRef.value.rotation.y += delta;
    torusRef.value.rotation.x += delta;
  }
});
</script>