import { useI18n } from "vue-i18n";
import pages from "../configs/pages.json";
import type { Page } from "../interfaces/Page";

export function useTranslatedPages() {
  const { t, te } = useI18n();

  function getPageId(page: Page): string {
    if (page.link === "/") return "home";
    return page.link.replace(/^\//, "");
  }

  function translatePage(page: Page): Page {
    const id = getPageId(page);
    const prefix = `pages.${id}`;

    const translated: Page = {
      ...page,
      name: te(`${prefix}.name`) ? t(`${prefix}.name`) : page.name,
      title: te(`${prefix}.title`) ? t(`${prefix}.title`) : page.title,
      metaDescription: te(`${prefix}.metaDescription`) ? t(`${prefix}.metaDescription`) : (page.metaDescription ?? ""),
      metaKeywords: te(`${prefix}.metaKeywords`) ? t(`${prefix}.metaKeywords`) : (page.metaKeywords ?? ""),
      body: [],
    };

    if (Array.isArray(page.body)) {
      for (let i = 0; i < page.body.length; i++) {
        const key = `${prefix}.body${i}`;
        translated.body.push(te(key) ? t(key) : page.body[i]);
      }
    }

    return translated;
  }

  const translatedPages = computed(() => {
    if (!Array.isArray(pages)) return [];
    return pages.map(translatePage);
  });

  return { translatedPages, translatePage, getPageId };
}
