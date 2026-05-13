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
        <img v-if="skill.icon && skill.icon.includes('/')" :src="skill.icon" alt="" class="skill-icon-img" />
        <span v-else-if="skill.icon" class="skill-icon">{{ skill.icon }}</span>
        <span class="skill-name">{{ skill.name }}</span>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from "vue";

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
  font-size: 0.85rem;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
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
  padding: 0.4rem 0.8rem;
  background: rgba(20, 30, 60, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

a.skill-tag {
  cursor: pointer;
  color: inherit;
}

.can-hover a.skill-tag:hover {
  background: rgba(30, 50, 80, 0.7);
  border-color: rgba(0, 255, 204, 0.4);
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.15);
  transform: translateY(-1px);
}

.skill-icon {
  font-size: 1rem;
}

.skill-icon-img {
  width: 1rem;
  height: 1rem;
  display: block;
}

.skill-name {
  color: #fff;
}
</style>
