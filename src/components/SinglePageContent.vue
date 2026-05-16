<template>
  <div class="single-page-container">
    <section
      v-for="page in displayPages"
      :key="page.link"
      :id="getSectionId(page)"
      class="page-section"
      :data-section="getSectionId(page)"
    >
      <article class="marginless page-content-card">
        <header>
          <h2 class="title">
            <template v-if="page">
              <span v-if="page.icon" class="page-icon">{{ page.icon }} </span>{{ page.title }}
            </template>
          </h2>
        </header>
        <div class="page-body">
          <Paragraph
            v-for="(paragraph, index) in page.body"
            :key="index"
            :paragraph="paragraph"
            :last="index + 1 === page.body.length"
          />
        </div>

        <SectionDivider v-if="getSectionId(page) === 'home'" icon="🛠️" />
        <template v-if="getSectionId(page) === 'home'">
          <h4 class="sub-heading">What I Do</h4>
          <div class="what-i-do-grid">
            <div class="do-card">
              <div class="do-card-accent fullstack"></div>
              <div class="do-card-icon">🌐</div>
              <h5 class="do-card-title">Full-Stack Development</h5>
              <p class="do-card-desc">End-to-end web applications — from database architecture to polished frontends.</p>
            </div>
            <div class="do-card">
              <div class="do-card-accent ux"></div>
              <div class="do-card-icon">🎨</div>
              <h5 class="do-card-title">Creative UI/UX</h5>
              <p class="do-card-desc">Interfaces that are a joy to use — responsive, accessible, and thoughtfully designed.</p>
            </div>
            <div class="do-card">
              <div class="do-card-accent interactive"></div>
              <div class="do-card-icon">⚡</div>
              <h5 class="do-card-title">Interactive 3D</h5>
              <p class="do-card-desc">Immersive browser-based experiences powered by Three.js and WebGL.</p>
            </div>
          </div>
        </template>

        <SectionDivider v-if="getSectionId(page) === 'about'" icon="⚡" />
        <template v-if="getSectionId(page) === 'about'">
          <h4 class="sub-heading">Technical Skills</h4>
          <SkillCard
            :skills="backendSkills"
            category="Backend Development"
          />
          <SkillCard
            :skills="frontendSkills"
            category="Frontend Development"
          />
          <SkillCard
            :skills="toolsSkills"
            category="Tools & Platforms"
          />
        </template>

        <SectionDivider v-if="getSectionId(page) === 'interests'" icon="✨" />
        <template v-if="getSectionId(page) === 'interests'">
          <h4 class="sub-heading">Featured Projects</h4>
          <ProjectGallery :projects="showcaseProjects" />

          <SectionDivider icon="🎵" />
          <h4 class="sub-heading">Music & Creative</h4>
          <div class="music-card">
            <div class="music-icon">🎸</div>
            <div class="music-content">
              <h5>Guitar Compositions</h5>
              <p>Original music shared on my YouTube channel</p>
              <a
                href="https://www.youtube.com/@toilled"
                target="_blank"
                rel="noopener noreferrer"
                class="music-link"
              >
                Visit YouTube Channel →
              </a>
            </div>
          </div>

          <div class="interest-grid">
            <div class="interest-item">
              <span class="interest-icon">🕹️</span>
              <span>3D Graphics</span>
            </div>
            <div class="interest-item">
              <span class="interest-icon">🧪</span>
              <span>Experimentation</span>
            </div>
            <div class="interest-item">
              <span class="interest-icon">🎹</span>
              <span>Multi-Instrumentalist</span>
            </div>
            <div class="interest-item">
              <span class="interest-icon">📡</span>
              <span>Tech Discovery</span>
            </div>
          </div>
        </template>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import pages from "../configs/pages.json";
import Paragraph from "./Paragraph.vue";
import SkillCard from "./SkillCard.vue";
import ProjectGallery from "./ProjectGallery.vue";
import SectionDivider from "./SectionDivider.vue";
import { Page } from "../interfaces/Page";

const backendSkills = [
  { name: "Laravel", icon: "/laravel-icon.svg", link: "https://laravel.com/" },
  { name: "MySQL", icon: "/mysql-icon.svg", link: "https://www.mysql.com/" },
  { name: "PHP", icon: "🐘", link: "https://www.php.net/" },
  { name: "Symfony", icon: "/symfony-icon.svg", link: "https://symfony.com/" },
  { name: "Yii", icon: "/yii-icon.svg", link: "https://www.yiiframework.com/" },
];

const frontendSkills = [
  { name: "JavaScript", icon: "/javascript-icon.svg", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  { name: "React", icon: "⚛️", link: "https://react.dev/" },
  { name: "SolidJS", icon: "/solidjs-icon.svg", link: "https://www.solidjs.com/" },
  { name: "Three.js", icon: "/threejs-icon.svg", link: "https://threejs.org/" },
  { name: "TypeScript", icon: "/typescript-icon.svg", link: "https://www.typescriptlang.org/" },
  { name: "Vue.js", icon: "/vuejs-icon.svg", link: "https://vuejs.org/" },
];

const toolsSkills = [
  { name: "Cloudflare", icon: "/cloudflare-icon.svg", link: "https://www.cloudflare.com/" },
  { name: "Docker", icon: "🐳", link: "https://www.docker.com/" },
  { name: "Git", icon: "/git-icon.svg", link: "https://git-scm.com/" },
  { name: "Linux", icon: "🐧", link: "https://www.kernel.org/" },
  { name: "MQTT", icon: "/mqtt-icon.svg", link: "https://mqtt.org/" },
];

const showcaseProjects = [
  {
    icon: "🌆",
    title: "Cyberpunk City",
    description: "Interactive 3D city built with Three.js featuring driving, flying, and exploration modes",
    tag: "Three.js",
  },
  {
    icon: "🎮",
    title: "Game Collection",
    description: "Reflex games, tic-tac-toe with AI, and more interactive experiments",
    tag: "Vue.js",
  },
  {
    icon: "🤖",
    title: "Chat Assistant",
    description: "Keyword-based chatbot that answers questions about my background and skills",
    tag: "Interactive",
  },
  {
    icon: "📊",
    title: "Weather Widget",
    description: "Real-time weather data with SVG temperature charts from Open-Meteo API",
    tag: "API",
  },
];

function getSectionId(page: Page): string {
  if (page.link === "/") return "home";
  return page.link.replace(/^\//, "");
}

const displayPages = computed(() => {
  return pages.filter((page: Page) => !page.hidden);
});
</script>

<style scoped>
.single-page-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-section {
  scroll-margin-top: 100px;
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
  margin: 0 auto;
  position: relative;
}

.page-section::after {
  content: '';
  display: block;
  width: 40%;
  max-width: 140px;
  height: 1px;
  margin: 2.5rem auto 0;
  background: linear-gradient(90deg,
    transparent,
    rgba(0, 255, 204, 0.4),
    rgba(255, 0, 204, 0.3),
    transparent
  );
}

.page-section:last-child::after {
  display: none;
}

@media (max-width: 768px) {
  .page-section {
    scroll-margin-top: 200px;
  }
}

.page-content-card {
  padding: 2rem 2.5rem;
}

.page-content-card > header {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.page-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}

.page-body {
  font-size: 0.95rem;
}

.sub-heading {
  margin: 1.75rem 0 1rem 0;
  font-size: 1.1rem;
  color: var(--pico-h2-color, #ff00cc);
  letter-spacing: 0.02em;
}

.what-i-do-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

.do-card {
  position: relative;
  padding: 1.5rem 1.25rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.35s ease;
}

.can-hover .do-card:hover {
  background: rgba(15, 20, 40, 0.7);
  border-color: rgba(0, 255, 204, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.do-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 12px 12px 0 0;
}

.do-card-accent.fullstack {
  background: linear-gradient(90deg, #00ffcc, #00ccff);
}

.do-card-accent.ux {
  background: linear-gradient(90deg, #ff00cc, #ff6600);
}

.do-card-accent.interactive {
  background: linear-gradient(90deg, #cc00ff, #00ffcc);
}

.do-card-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  display: block;
}

.do-card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #fff;
  letter-spacing: 0.01em;
}

.do-card-desc {
  margin: 0;
  font-size: 0.82rem;
  color: #8888aa;
  line-height: 1.55;
}

.timeline {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 2px solid rgba(0, 255, 204, 0.2);
}

.timeline-item {
  position: relative;
  padding-left: 1.5rem;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.4rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--pico-color, #00ffcc);
  box-shadow: 0 0 8px rgba(0, 255, 204, 0.5);
}

.timeline-content h5 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #fff;
}

.timeline-company {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: var(--pico-color, #00ffcc);
}

.timeline-period {
  margin: 0;
  font-size: 0.75rem;
  color: #8888aa;
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

.music-content h5 {
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  color: #fff;
}

.music-content p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #8888aa;
}

.music-link {
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.12);
  border-radius: 10px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.can-hover .interest-item:hover {
  background: rgba(20, 30, 60, 0.6);
  border-color: rgba(0, 255, 204, 0.25);
  transform: translateY(-1px);
}

.interest-icon {
  font-size: 1.25rem;
}

@media (max-width: 600px) {
  .single-page-container {
    gap: 1rem;
  }

  .page-section::after {
    margin-top: 1.5rem;
    width: 30%;
    max-width: 100px;
  }

  .page-content-card {
    padding: 1.25rem 1.25rem;
  }

  .page-body {
    font-size: 0.9rem;
  }

  .music-card {
    flex-direction: column;
    text-align: center;
  }

  .interest-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .what-i-do-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
