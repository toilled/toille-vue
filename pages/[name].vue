<template>
  <PageContent :name="$route.params.name.toString()" />
</template>

<script setup>
import PageContent from '~/components/PageContent.vue'
</script>
