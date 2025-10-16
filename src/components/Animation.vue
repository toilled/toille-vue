<template>
  <div style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-left: 10px;">
    <TresCanvas>
      <TresPerspectiveCamera :position="[0, 0, 5]" />
      <Torus />
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import Torus from './Torus.vue';
</script>