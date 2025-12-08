<template>
  <PageContent :name="route.params.name" />
</template>

<script setup>
const route = useRoute()
</script>
