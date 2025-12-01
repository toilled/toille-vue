<template>
  <Layout>
    <main>
      <section>
        <header>
          <h2 class="title" @mousedown="handleMouseDown">
            <template v-if="page">
              {{ page.title }}
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
          </h2>
        </header>
        <template v-if="page">
          <Paragraph
            v-for="(paragraph, index) in page.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === page.body.length"
          />
        </template>
      </section>
    </main>
  </Layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import Paragraph from '~/components/Paragraph.vue'
import pages from '~/configs/pages.json'

export default defineComponent({
  components: {
    Paragraph
  },
  setup() {
    const showHint = ref(false)
    const page = computed(() => pages.find(p => p.link === '/'))

    function handleMouseDown() {
      showHint.value = true
      setTimeout(() => {
        showHint.value = false
      }, 500)
    }

    return {
      showHint,
      page,
      handleMouseDown
    }
  }
})
</script>
