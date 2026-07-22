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
const href = computed(() => (props.link && !props.isHash ? props.link : undefined));
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
  background: linear-gradient(165deg, rgba(10, 10, 25, 0.7) 0%, rgba(5, 8, 20, 0.8) 100%);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 10px;
  margin: 0.75rem 0;
  cursor: default;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-decoration: none;
  color: inherit;
  font: inherit;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  transform: translateZ(0);
}

.feature-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.feature-card[link] {
  cursor: pointer;
}

.can-hover .feature-card[link]:hover {
  background: linear-gradient(165deg, rgba(15, 20, 40, 0.85) 0%, rgba(10, 15, 30, 0.9) 100%);
  border-color: rgba(0, 255, 204, 0.35);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 8px 16px rgba(0, 0, 0, 0.2),
    0 16px 32px rgba(0, 0, 0, 0.15),
    0 0 16px rgba(0, 255, 204, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-2px) translateZ(0);
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
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
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
