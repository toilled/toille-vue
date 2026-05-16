<template>
  <div class="project-gallery">
    <div
      v-for="(project, index) in projects"
      :key="index"
      class="project-card"
      @click="handleClick(project)"
    >
      <div class="project-icon">{{ project.icon }}</div>
      <h4 class="project-title">{{ project.title }}</h4>
      <p class="project-description">{{ project.description }}</p>
      <div v-if="project.tag" class="project-tag">{{ project.tag }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject, type PropType } from "vue";

interface Project {
  icon: string;
  title: string;
  description: string;
  link?: string;
  linkType?: "route" | "external" | "hash";
  tag?: string;
}

defineProps<{
  projects: Project[];
}>();

const router = useRouter();
const navigateToSection = inject<(id: string, behavior?: ScrollBehavior) => void>("navigateToSection");

function handleClick(project: Project) {
  if (!project.link) return;

  if (project.linkType === "route" || (project.linkType === undefined && project.link.startsWith("/"))) {
    router.push(project.link);
  } else if (project.linkType === "external" || project.link.startsWith("http")) {
    window.open(project.link, "_blank", "noopener noreferrer");
  } else if (project.link.startsWith("#") && navigateToSection) {
    const id = project.link.replace(/^#/, "");
    navigateToSection(id);
  }
}
</script>

<style scoped>
.project-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

.project-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1.25rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 14px;
  cursor: default;
  position: relative;
  overflow: hidden;
  transition: all 0.35s ease;
}

.project-card[link] {
  cursor: pointer;
}

.can-hover .project-card[link]:hover {
  background: rgba(15, 20, 35, 0.8);
  border-color: rgba(255, 0, 204, 0.3);
  box-shadow: 0 0 24px rgba(255, 0, 204, 0.12);
  transform: translateY(-4px);
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00ffcc, #ff00cc);
  opacity: 0;
  transition: opacity 0.35s ease;
  border-radius: 14px 14px 0 0;
}

.can-hover .project-card[link]:hover::before {
  opacity: 1;
}

.project-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  display: block;
}

.project-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--pico-h2-color, #ff00cc);
  letter-spacing: 0.01em;
}

.project-description {
  margin: 0 0 0.75rem 0;
  font-size: 0.82rem;
  color: #8888aa;
  line-height: 1.55;
  flex: 1;
}

.project-tag {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.25rem 0.75rem;
  background: rgba(0, 255, 204, 0.08);
  border: 1px solid rgba(0, 255, 204, 0.15);
  border-radius: 100px;
  color: var(--pico-color, #00ffcc);
}

@media (max-width: 600px) {
  .project-gallery {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .project-card {
    padding: 1.25rem 1rem;
  }
}
</style>
