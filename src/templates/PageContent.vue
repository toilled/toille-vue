<template>
  <Layout>
    <main>
      <section>
        <header>
          <h2 class="title" @mousedown="handleMouseDown">
            <template v-if="$context">
              {{ $context.title }}
              <transition name="fade">
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
              </transition>
            </template>
            <template v-else> 404 - Page not found </template>
          </h2>
        </header>
        <template v-if="$context">
          <Paragraph
            v-for="(paragraph, index) in $context.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === $context.body.length"
          />
        </template>
        <template v-else>
          <Paragraph
            :paragraph="`The page does not exist!`"
            :last="true"
          />
        </template>
      </section>
    </main>
  </Layout>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'
import Paragraph from '~/components/Paragraph.vue'

export default defineComponent({
  components: {
    Paragraph
  },
  setup() {
    const showHint = ref(false)

    function handleMouseDown() {
      showHint.value = true
      setTimeout(() => {
        showHint.value = false
      }, 500)
    }

    return {
      showHint,
      handleMouseDown
    }
  }
})
</script>
