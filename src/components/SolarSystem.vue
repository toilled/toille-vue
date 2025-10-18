<template>
  <div id="solar-system-container"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import * as Spacekit from 'spacekit.js';

onMounted(() => {
  const viz = new Spacekit.Simulation(document.getElementById('solar-system-container'), {
    basePath: 'https://typpo.github.io/spacekit/src/assets',
    startDate: new Date(),
  });

  // Create a skybox
  viz.createSkybox(Spacekit.SkyboxPresets.NASA_TYCHO);

  // Create the sun
  viz.createObject('sun', Spacekit.SpaceObjectPresets.SUN);

  // Add planets
  viz.createObject('mercury', Spacekit.SpaceObjectPresets.MERCURY);
  viz.createObject('venus', Spacekit.SpaceObjectPresets.VENUS);
  viz.createObject('earth', Spacekit.SpaceObjectPresets.EARTH);
  viz.createObject('mars', Spacekit.SpaceObjectPresets.MARS);
  viz.createObject('jupiter', Spacekit.SpaceObjectPresets.JUPITER);
  viz.createObject('saturn', Spacekit.SpaceObjectPresets.SATURN);
  viz.createObject('uranus', Spacekit.SpaceObjectPresets.URANUS);
  viz.createObject('neptune', Spacekit.SpaceObjectPresets.NEPTUNE);
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