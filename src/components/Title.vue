<template>
  <ul>
    <li>
      <hgroup>
        <h1
          class="title question"
          :class="{ 'space-warp': animatingTitle }"
          @mousedown="handleTitleClick"
        >
          {{ title }}
        </h1>
        <h2
          class="title question"
          :class="{ 'space-warp': animatingSubtitle }"
          @mousedown="handleSubtitleClick"
        >
          {{ subtitle }}
        </h2>
      </hgroup>
    </li>
  </ul>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    activity: Boolean,
    joke: Boolean
  },
  setup(props, { emit }) {
    const animatingTitle = ref(false)
    const animatingSubtitle = ref(false)

    function handleTitleClick() {
      emit('activity')
      triggerAnimation(animatingTitle)
    }

    function handleSubtitleClick() {
      emit('joke')
      triggerAnimation(animatingSubtitle)
    }

    function triggerAnimation(animatingRef) {
      if (animatingRef.value) return
      animatingRef.value = true
      setTimeout(() => {
        animatingRef.value = false
      }, 1000)
    }

    return {
      animatingTitle,
      animatingSubtitle,
      handleTitleClick,
      handleSubtitleClick
    }
  }
})
</script>

<style scoped>
.space-warp {
  animation: space-warp 1s ease-in-out;
}

@keyframes space-warp {
  0% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  25% {
    transform: scale(1.1) skewX(-10deg);
    filter: hue-rotate(90deg) drop-shadow(0 0 10px cyan);
  }
  50% {
    transform: scale(0.9) skewX(10deg);
    filter: hue-rotate(180deg) drop-shadow(0 0 10px magenta);
  }
  75% {
    transform: scale(1.05) skewX(-5deg);
    filter: hue-rotate(270deg) drop-shadow(0 0 10px cyan);
  }
  100% {
    transform: scale(1);
    filter: hue-rotate(360deg);
  }
}
</style>
