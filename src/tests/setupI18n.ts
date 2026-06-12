import { vi } from "vitest";
import { ref } from "vue";

const locale = ref("en");

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        let msg = key;
        for (const [k, v] of Object.entries(params)) {
          msg = msg.replace(`{${k}}`, String(v));
        }
        return msg;
      }
      return key;
    },
    te: () => false,
    locale,
  }),
  createI18n: () => ({
    global: {
      locale,
      t: (key: string) => key,
    },
    install: (app: any) => {
      app.config.globalProperties.$t = (key: string) => key;
    },
  }),
}));
