<template>
  <div id="solar-system-container" style="border: 1px solid red;">
    <pre id="error-log" style="color: red; position: absolute; top: 0; left: 0; z-index: 1;"></pre>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as Spacekit from 'spacekit.js';

onMounted(() => {
  const errorLog = document.getElementById('error-log');
  const originalError = console.error;
  console.error = function(message) {
    if (errorLog) {
      errorLog.textContent += message + '\\n';
    }
    originalError.apply(console, arguments);
  };

  try {
    const viz = new Spacekit.Simulation(document.getElementById('solar-system-container'), {
      basePath: 'https://typpo.github.io/spacekit/src/assets',
    });

    viz.createSkybox(Spacekit.SkyboxPresets.NASA_TYCHO);

    viz.createSphere('earth', {
      textureUrl: 'https://typpo.github.io/spacekit/src/assets/map-earth-day.jpg',
      radius: 1,
      position: [0, 0, 0],
    });

    viz.getCamera().setPosition([0, 0, 5]);
  } catch (e) {
    if (errorLog && e instanceof Error) {
      errorLog.textContent += e.message + '\\n';
    }
  }
});
</script>

<style scoped>
#solar-system-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>