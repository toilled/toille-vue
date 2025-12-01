<template>
  <Layout>
    <Checker />
  </Layout>
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import Checker from '~/components/Checker.vue'

export default defineComponent({
  components: {
    Checker
  }
})
</script>
