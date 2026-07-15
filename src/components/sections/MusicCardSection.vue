<template>
  <div>
    <h3 v-if="heading" class="sub-heading">{{ heading }}</h3>
    <div class="music-card">
      <div v-if="icon" class="music-icon">{{ icon }}</div>
      <div class="music-content">
        <h4>{{ title }}</h4>
        <p>{{ description }}</p>
        <a
          v-if="linkUrl"
          :href="linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="music-link"
        >
          {{ linkText }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  heading?: string;
  icon?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
}>();
</script>

<style scoped>
.sub-heading {
  margin: 1.75rem 0 1rem 0;
  font-size: 1.1rem;
  color: #ff00cc;
  letter-spacing: 0.02em;
}

.music-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.08), rgba(0, 255, 204, 0.08));
  border: 1px solid rgba(255, 0, 204, 0.2);
  border-radius: 14px;
  margin: 1.25rem 0;
  transition: all 0.3s ease;
}

.can-hover .music-card:hover {
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.12), rgba(0, 255, 204, 0.12));
  border-color: rgba(255, 0, 204, 0.35);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.music-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.music-content h4 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  color: #fff;
}

.music-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #b0b0cc;
}

.music-link {
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

@media (max-width: 600px) {
  .music-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
