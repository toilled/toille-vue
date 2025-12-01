<template>
  <ul>
    <MenuItem v-for="page in pages" :key="page.link" :page="page" />
    <li @click="toggleSound" class="sound-icon-container">
      <img
        v-if="soundOn"
        src="/sound-icon.svg"
        alt="Toggle sound"
        class="sound-icon"
      />
      <img
        v-else
        src="/mute-icon.svg"
        alt="Toggle sound"
        class="sound-icon"
      />
    </li>
  </ul>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import MenuItem from './MenuItem.vue'

export default defineComponent({
  components: {
    MenuItem
  },
  props: {
    pages: {
      type: Array,
      required: true
    }
  },
  setup() {
    const soundOn = ref(false)
    let audio = null

    const toggleSound = () => {
      // In Gridsome/SSR, window/document might not be available immediately during build,
      // but click handlers run on client.
      if (!audio && typeof window !== 'undefined') {
        audio = new Audio('/ambient-space-sound.mp3')
        audio.loop = true
      }

      soundOn.value = !soundOn.value
      if (audio) {
        if (soundOn.value) {
          audio.play()
        } else {
          audio.pause()
        }
      }
    }

    return {
      soundOn,
      toggleSound
    }
  }
})
</script>

<style scoped>
ul {
  position: relative;
}

.sound-icon-container {
  cursor: pointer;
  padding: 10px;
  position: absolute;
  right: 0;
  top: 0;
}

.sound-icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}
</style>
