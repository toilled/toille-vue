<template>
  <div style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-left: 10px;">
    <TresCanvas>
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <TresMesh ref="torusRef">
        <TresTorusGeometry :args="[1, 0.5, 16, 32]" />
        <TresMeshBasicMaterial color="orange" />
      </TresMesh>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { TresCanvas, useLoop } from '@tresjs/core';
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