<template>
  <footer
    @click="newSuggestion"
    :style="{ cursor: loading ? 'progress' : '' }"
    class="content-container"
  >
    <article v-if="activity" title="Click for a new suggestion" style="margin-bottom: 0">
      <header>
        <strong>
          Try this {{ activity.type }} activity
        </strong>
        (The Bored API)
      </header>
      <p class="marginless">{{ activity.activity }}</p>
    </article>
    <article v-else style="margin-bottom: 0">
      <header>
        <strong>Try this activity</strong>
      </header>
      <p class="marginless" aria-busy="true">
        Loading from The Bored API.
      </p>
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
import { defineComponent, ref, onMounted } from '@vue/composition-api'

export default defineComponent({
  setup() {
    const activity = ref(null)
    const loading = ref(false)
    const hideHint = ref(false)

    async function fetchActivity() {
      loading.value = true
      try {
        const response = await fetch('https://bored.api.lewagon.com/api/activity')
        activity.value = await response.json()
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    function newSuggestion() {
      fetchActivity()
      if (!hideHint.value) {
        hideHint.value = true
      }
    }

    onMounted(fetchActivity)

    return {
      activity,
      loading,
      hideHint,
      newSuggestion
    }
  }
})
</script>
