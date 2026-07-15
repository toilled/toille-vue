<template>
  <div>
    <Paragraph :paragraph="t('notFound.pageDoesNotExist', { name })" :last="false" />
    <div class="not-found-nav">
      <h3>{{ t('notFound.availablePages') }}</h3>
      <ul>
        <li v-for="p in pages" :key="p.link">
          <router-link :to="p.link">{{ p.icon }} {{ p.name }}</router-link>
        </li>
      </ul>
      <router-link to="/" class="button outline">{{ t('notFound.goHome') }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Page } from '../interfaces/Page';
import Paragraph from './Paragraph.vue';

defineProps<{
  name: string;
  pages: Page[];
}>();

const { t } = useI18n();
</script>
