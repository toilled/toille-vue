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
          <h4 class="sub-heading">Built With</h4>
          <FeatureCard
            icon="💚"
            title="Vue.js"
            description="Progressive JavaScript framework for building the UI"
            link="https://vuejs.org"
          />
          <FeatureCard
            icon="🎲"
            title="Three.js"
            description="3D library powering the interactive cyberpunk city"
            link="https://threejs.org"
          />
          <FeatureCard
            icon="📘"
            title="TypeScript"
            description="Type-safe JavaScript for scalable development"
            link="https://www.typescriptlang.org"
          />
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
import FeatureCard from "./FeatureCard.vue";
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
  width: 60%;
  max-width: 200px;
  height: 20px;
  margin: 2rem auto 0;
  background:
    linear-gradient(90deg,
      transparent 0%,
      rgba(255, 0, 204, 0.3) 10%,
      rgba(0, 255, 204, 0.9) 25%,
      #ff00cc 35%,
      rgba(0, 255, 204, 0.9) 45%,
      rgba(255, 0, 204, 0.3) 60%,
      transparent 70%
    ) no-repeat,
    linear-gradient(90deg,
      transparent,
      rgba(255, 0, 204, 0.12),
      rgba(0, 255, 204, 0.12),
      transparent
    );
  background-size: 25% 100%, 100% 100%;
  background-position: -25% center, 0 center;
  animation: signalSweep 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  -webkit-mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20'%3E%3Cpath d='M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10 T120,10 T140,10 T160,10 T180,10 T200,10' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20'%3E%3Cpath d='M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10 T120,10 T140,10 T160,10 T180,10 T200,10' stroke='white' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
}

@keyframes signalSweep {
  0% { background-position: -25% center, 0 center; }
  100% { background-position: 125% center, 0 center; }
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
  padding: 1.5rem 2rem;
}

.page-content-card > header {
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.page-icon {
  margin-right: 0.5rem;
}

.page-body {
  font-size: 0.95rem;
}

.sub-heading {
  margin: 1.5rem 0 1rem 0;
  font-size: 1.1rem;
  color: var(--pico-h2-color, #ff00cc);
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
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 0, 204, 0.1), rgba(0, 255, 204, 0.1));
  border: 1px solid rgba(255, 0, 204, 0.3);
  border-radius: 12px;
  margin: 1rem 0;
}

.music-icon {
  font-size: 3rem;
}

.music-content h5 {
  margin: 0 0 0.5rem 0;
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
}

.interest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(10, 10, 20, 0.5);
  border: 1px solid rgba(0, 255, 204, 0.15);
  border-radius: 8px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.can-hover .interest-item:hover {
  background: rgba(20, 30, 60, 0.6);
  border-color: rgba(0, 255, 204, 0.3);
}

.interest-icon {
  font-size: 1.25rem;
}

@media (max-width: 600px) {
  .single-page-container {
    gap: 1rem;
  }

  .page-section::after {
    margin-top: 1rem;
    height: 14px;
    max-width: 140px;
  }

  .page-content-card {
    padding: 1rem 1.25rem;
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
}
</style>
