<template>
  <p :class="{ marginless: last }" v-html="paragraph"></p>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    paragraph: {
      type: String,
      required: true
    },
    last: {
      type: Boolean,
      default: false
    }
  }
})
</script>
