<template>
  <header ref="headerRef" class="app-header">
    <nav class="container header-nav">
      <Title
        :title="titles.title"
        :subtitle="t('site.subtitle')"
        @activity="$emit('activity')"
        @joke="$emit('joke')"
      />
      <Menu
        :pages="visiblePages"
        :content-visible="contentVisible"
        :city-fallback="cityFallback"
        @explore="$emit('explore')"
        @demo="$emit('demo')"
        @toggle-content="$emit('toggle-content')"
        @toggle-terminal="$emit('toggle-terminal')"
        @toggle-desktop="$emit('toggle-desktop')"
      />
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Page } from '../interfaces/Page';
import titles from '../configs/titles.json';

defineProps<{
  visiblePages: Page[];
  contentVisible: boolean;
  cityFallback: boolean;
}>();

defineEmits<{
  activity: [];
  joke: [];
  explore: [];
  demo: [];
  'toggle-content': [];
  'toggle-terminal': [];
  'toggle-desktop': [];
}>();

const { t } = useI18n();
</script>
