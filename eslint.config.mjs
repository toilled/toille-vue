import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,vue}"] },
  {
    ignores: [
      "dist/",
      "node_modules/",
      "coverage/",
      "vue-legacy/",
      "functions/ssr-app.js",
      ".astro/",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        global: "readonly",
        process: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: {
        ref: "readonly",
        computed: "readonly",
        watch: "readonly",
        onMounted: "readonly",
        onUnmounted: "readonly",
        onBeforeUnmount: "readonly",
        onErrorCaptured: "readonly",
        nextTick: "readonly",
        defineProps: "readonly",
        defineEmits: "readonly",
        defineAsyncComponent: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
        useSlots: "readonly",
        useAttrs: "readonly",
        inject: "readonly",
        provide: "readonly",
        reactive: "readonly",
        useRoute: "readonly",
        useRouter: "readonly",
        useI18n: "readonly",
        ScrollBehavior: "readonly",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-mutating-props": "off",
      "no-undef": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
