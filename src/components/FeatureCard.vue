<template>
  <component
    :is="tag"
    class="feature-card"
    :href="href"
    :target="target"
    :rel="rel"
    @click="handleClick"
    :tabindex="link ? 0 : undefined"
    :role="role"
  >
    <div class="feature-icon" aria-hidden="true">{{ icon }}</div>
    <div class="feature-content">
      <h4 class="feature-title">{{ title }}</h4>
      <p class="feature-description">{{ description }}</p>
      <div v-if="tags?.length" class="feature-tags">
        <span v-for="tag in tags" :key="tag" class="feature-tag">{{ tag }}</span>
      </div>
    </div>
    <div v-if="link" class="feature-arrow" aria-hidden="true">→</div>
  </component>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string;
  title: string;
  description: string;
  link?: string;
  isHash?: boolean;
  tags?: string[];
}>();

const router = useRouter();
const navigateToSection =
  inject<(id: string, behavior?: ScrollBehavior) => void>('navigateToSection');

const isExternal = computed(() => props.link?.startsWith('http') ?? false);
const tag = computed(() => (props.link ? 'a' : 'div'));
const href = computed(() => props.link && !props.isHash ? props.link : undefined);
const target = computed(() => (isExternal.value ? '_blank' : undefined));
const rel = computed(() => (isExternal.value ? 'noopener noreferrer' : undefined));
const role = computed(() => (props.link && props.isHash ? 'link' : undefined));

function handleClick() {
  if (!props.link) return;

  if (props.isHash && navigateToSection) {
    const sectionId = props.link.replace(/^#/, '');
    navigateToSection(sectionId);
  } else if (props.link.startsWith('/')) {
    router.push(props.link);
  } else if (isExternal.value) {
    window.open(props.link, '_blank', 'noopener noreferrer');
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
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 10px;
  margin: 0.75rem 0;
  cursor: default;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
}

.feature-card[link] {
  cursor: pointer;
}

.can-hover .feature-card[link]:hover {
  background: rgba(15, 20, 35, 0.8);
  border-color: rgba(0, 255, 204, 0.35);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
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
  color: #ff00cc;
}

.feature-description {
  margin: 0;
  font-size: 0.85rem;
  color: #b0b0cc;
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
  color: #00ffcc;
  border: 1px solid rgba(0, 255, 204, 0.2);
}

.feature-arrow {
  font-size: 1.25rem;
  color: #00ffcc;
  opacity: 0.6;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
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
