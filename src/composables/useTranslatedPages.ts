import { useI18n } from 'vue-i18n';
import rawPages from '../configs/pages.json';
import type { Page, PageSection } from '../interfaces/Page';

const pages = rawPages as Page[];

export function useTranslatedPages() {
  const { t, te } = useI18n();

  function getPageId(page: Page): string {
    if (page.link === '/') return 'home';
    return page.link.replace(/^\//, '');
  }

  function translateValue(prefix: string, fallback: string): string {
    return te(prefix) ? t(prefix) : fallback;
  }

  function resolveText(value: string | undefined, key: string | undefined): string {
    if (key && te(key)) return t(key);
    return value ?? '';
  }

  function translateSections(sections: PageSection[]): PageSection[] {
    return sections.map((section) => {
      const translated: PageSection = { ...section };

      translated.heading = resolveText(section.heading, section.headingKey);
      translated.title = resolveText(section.title, section.titleKey);
      translated.description = resolveText(section.description, section.descriptionKey);
      translated.linkText = resolveText(section.linkText, section.linkTextKey);

      if (section.items) {
        translated.items = section.items.map((item) => {
          const ti = { ...item };
          ti.title = resolveText(item.title, item.titleKey);
          ti.description = resolveText(item.description, item.descriptionKey);
          ti.text = resolveText(item.text, item.textKey);
          return ti;
        });
      }

      if (section.groups) {
        translated.groups = section.groups.map((group) => {
          const tg = { ...group };
          tg.category = resolveText(group.category, group.categoryKey);
          return tg;
        });
      }

      return translated;
    });
  }

  function translatePage(page: Page): Page {
    const id = getPageId(page);
    const prefix = `pages.${id}`;

    const translated: Page = {
      ...page,
      name: translateValue(`${prefix}.name`, page.name),
      title: translateValue(`${prefix}.title`, page.title),
      metaDescription: translateValue(`${prefix}.metaDescription`, page.metaDescription ?? ''),
      metaKeywords: translateValue(`${prefix}.metaKeywords`, page.metaKeywords ?? ''),
      body: [],
    };

    if (Array.isArray(page.body)) {
      for (let i = 0; i < page.body.length; i++) {
        const key = `${prefix}.body${i}`;
        translated.body.push(te(key) ? t(key) : page.body[i]);
      }
    }

    if (page.sections) {
      translated.sections = translateSections(page.sections);
    }

    return translated;
  }

  const translatedPages = computed(() => {
    if (!Array.isArray(pages)) return [];
    return pages.map(translatePage);
  });

  return { translatedPages, translatePage, getPageId };
}
