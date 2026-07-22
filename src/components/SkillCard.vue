<template>
  <div class="skill-card">
    <div v-if="category" class="skill-category">{{ category }}</div>
    <div class="skill-tags">
      <component
        :is="skill.link ? 'a' : 'span'"
        v-for="(skill, index) in skills"
        :key="index"
        class="skill-tag"
        :href="skill.link"
        :target="skill.link ? '_blank' : undefined"
        :rel="skill.link ? 'noopener noreferrer' : undefined"
      >
        <img
          v-if="skill.icon && skill.icon.includes('/')"
          :src="skill.icon"
          alt=""
          class="skill-icon-img"
        />
        <span v-else-if="skill.icon" class="skill-icon">{{ skill.icon }}</span>
        <span class="skill-name">{{ skill.name }}</span>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Skill {
  name: string;
  icon?: string;
  link?: string;
}

defineProps<{
  skills: Skill[];
  category?: string;
}>();
</script>

<style scoped>
.skill-card {
  margin: 1rem 0;
}

.skill-category {
  font-size: 0.8rem;
  color: #9999bb;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 0.6rem;
  opacity: 0.8;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: linear-gradient(165deg, rgba(15, 25, 50, 0.6) 0%, rgba(10, 18, 40, 0.7) 100%);
  border: 1px solid rgba(0, 255, 204, 0.15);
  border-radius: 100px;
  font-size: 0.82rem;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-decoration: none;
  backdrop-filter: blur(4px);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
}

a.skill-tag {
  cursor: pointer;
  color: inherit;
}

.can-hover a.skill-tag:hover {
  background: linear-gradient(165deg, rgba(25, 45, 80, 0.8) 0%, rgba(20, 35, 65, 0.85) 100%);
  border-color: rgba(0, 255, 204, 0.35);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 12px rgba(0, 255, 204, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transform: translateY(-2px) translateZ(0);
}

.skill-icon {
  font-size: 0.95rem;
}

.skill-icon-img {
  width: 0.95rem;
  height: 0.95rem;
  display: block;
}

.skill-name {
  color: #e0e0f0;
}
</style>
