<template>
  <div>
    <header>
      <!-- You can add a navbar or header here -->
    </header>
    <main class="container">
      <slot />
    </main>
    <footer>
      <!-- You can add a footer here -->
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}
</style>
