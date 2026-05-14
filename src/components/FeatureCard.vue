<template>
  <div class="feature-card" @click="handleClick">
    <div class="feature-icon">{{ icon }}</div>
    <div class="feature-content">
      <h4 class="feature-title">{{ title }}</h4>
      <p class="feature-description">{{ description }}</p>
      <div v-if="tags?.length" class="feature-tags">
        <span v-for="tag in tags" :key="tag" class="feature-tag">{{ tag }}</span>
      </div>
    </div>
    <div v-if="link" class="feature-arrow">→</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject } from "vue";

const props = defineProps<{
  icon: string;
  title: string;
  description: string;
  link?: string;
  isHash?: boolean;
  tags?: string[];
}>();

const router = useRouter();
const navigateToSection = inject<(id: string, behavior?: ScrollBehavior) => void>("navigateToSection");

function handleClick() {
  if (!props.link) return;

  if (props.isHash && navigateToSection) {
    const sectionId = props.link.replace(/^#/, "");
    navigateToSection(sectionId);
  } else if (props.link.startsWith("/")) {
    router.push(props.link);
  } else if (props.link.startsWith("http")) {
    window.open(props.link, "_blank", "noopener noreferrer");
  }
}
</script>

<style scoped>
.feature-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(10, 10, 20, 0.6);
  border: 1px solid rgba(0, 255, 204, 0.15);
  border-radius: 8px;
  margin: 0.75rem 0;
  cursor: default;
  transition: all 0.3s ease;
}

.feature-card[link] {
  cursor: pointer;
}

.can-hover .feature-card[link]:hover {
  background: rgba(15, 20, 35, 0.8);
  border-color: rgba(0, 255, 204, 0.35);
  box-shadow: 0 0 15px rgba(0, 255, 204, 0.1);
  transform: translateX(5px);
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--pico-h2-color, #ff00cc);
}

.feature-description {
  margin: 0;
  font-size: 0.85rem;
  color: #8888aa;
  line-height: 1.4;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.feature-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  border-radius: 4px;
  background: rgba(0, 255, 204, 0.1);
  color: var(--pico-color, #00ffcc);
  border: 1px solid rgba(0, 255, 204, 0.2);
}

.feature-arrow {
  font-size: 1.25rem;
  color: var(--pico-color, #00ffcc);
  opacity: 0.6;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.can-hover .feature-card[link]:hover .feature-arrow {
  transform: translateX(3px);
  opacity: 1;
}

@media (max-width: 600px) {
  .feature-card {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .feature-icon {
    font-size: 1.75rem;
  }

  .feature-title {
    font-size: 0.95rem;
  }

  .feature-description {
    font-size: 0.8rem;
  }
}
</style>
