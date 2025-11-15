<template>
  <PageContent :name="($route.params.slug && $route.params.slug[0]) || 'home'" />
</template>
