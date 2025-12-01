<template>
  <footer
    @click="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container"
  >
    <article v-if="suggestion" :title="hoverHintText" style="margin-bottom: 0">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless">{{ suggestion[valueName] }}</p>
    </article>
    <article v-else style="margin-bottom: 0">
      <header>
        <strong>{{ title }}</strong>
      </header>
      <p class="marginless" aria-busy="true">{{ url }} might be down.</p>
    </article>
    <transition name="fade">
      <article v-if="!hideHint" style="padding-top: 0; margin-top: 0; margin-bottom: 0">
        <footer style="font-style: oblique; font-size: 0.8em; margin-top: 0">
          Click to update
        </footer>
      </article>
    </transition>
  </footer>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
    },
    valueName: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const suggestion = ref(null)
    const loading = ref(false)
    const hideHint = ref(false)

    const hoverHintText = computed(() => 'Click for a new ' + props.valueName)

    async function fetchSuggestion() {
      loading.value = true
      try {
        const response = await fetch(props.url, {
          headers: { Accept: 'application/json' }
        })
        suggestion.value = await response.json()
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    function newSuggestion() {
      fetchSuggestion()
      if (!hideHint.value) {
        hideHint.value = true
      }
    }

    onMounted(fetchSuggestion)

    return {
      suggestion,
      loading,
      hideHint,
      hoverHintText,
      newSuggestion
    }
  }
})
</script>
