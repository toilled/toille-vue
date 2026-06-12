<template>
  <div class="lang-wrapper" ref="wrapperRef">
    <div
      class="lang-trigger icon-wrapper"
      :class="{ open: open }"
      @click="toggle"
      :title="t('language.label')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon globe-icon">
        <circle cx="12" cy="12" r="10" />
        <ellipse cx="12" cy="12" rx="4" ry="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </div>
    <Teleport to="body">
      <Transition name="lang-fade">
        <div
          v-if="open && mounted"
          class="lang-dropdown"
          :style="dropdownStyle"
        >
          <button
            v-for="loc in locales"
            :key="loc.code"
            class="lang-option"
            :class="{ active: loc.code === currentLocale }"
            @click="select(loc.code)"
          >
            {{ loc.label }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale, t } = useI18n();

const open = ref(false);
const mounted = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const currentLocale = computed(() => locale.value);

const locales = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "zh-CN", label: "简体中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "hi", label: "हिन्दी" },
  { code: "nl", label: "Nederlands" },
];

function toggle() {
  open.value = !open.value;
  if (open.value) {
    positionDropdown();
  }
}

function positionDropdown() {
  if (!wrapperRef.value) return;
  const rect = wrapperRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const dropdownHeight = Math.min(280, locales.length * 38 + 16);

  if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
    dropdownStyle.value = {
      position: "fixed",
      bottom: `${window.innerHeight - rect.top + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  } else {
    dropdownStyle.value = {
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  }
}

function select(code: string) {
  locale.value = code;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("locale", code);
  }
  open.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    const dropdown = document.querySelector(".lang-dropdown");
    if (dropdown && !dropdown.contains(e.target as Node)) {
      open.value = false;
    }
  }
}

function handleScroll() {
  if (open.value && wrapperRef.value) {
    positionDropdown();
  }
}

onMounted(() => {
  mounted.value = true;
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleScroll, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleScroll);
});
</script>

<style scoped>
.lang-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.lang-trigger {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #00ffcc;
}

.can-hover .lang-trigger:hover {
  background: rgba(0, 255, 204, 0.1);
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.2), inset 0 0 8px rgba(0, 255, 204, 0.05);
}

.lang-trigger.open {
  background: rgba(0, 255, 204, 0.15);
}

.globe-icon {
  width: 22px;
  height: 22px;
}
</style>

<style>
.lang-dropdown {
  background: rgba(10, 10, 30, 0.97);
  border: 1px solid rgba(0, 255, 204, 0.25);
  border-radius: 10px;
  padding: 0.4rem;
  min-width: 160px;
  max-height: 280px;
  overflow-y: auto;
  z-index: 10000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 255, 204, 0.08);
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 204, 0.3) transparent;
}

.lang-dropdown::-webkit-scrollbar {
  width: 4px;
}

.lang-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.lang-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 204, 0.3);
  border-radius: 2px;
}

.lang-option {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.85rem;
  background: none;
  border: none;
  border-radius: 6px;
  color: #ccc;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.can-hover .lang-option:hover {
  background: rgba(0, 255, 204, 0.1);
  color: #fff;
}

.lang-option.active {
  color: #00ffcc;
  background: rgba(0, 255, 204, 0.08);
  font-weight: 600;
}

.lang-fade-enter-active,
.lang-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.lang-fade-enter-from,
.lang-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
