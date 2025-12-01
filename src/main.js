// This is the main.js file. Import global styles and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import '@picocss/pico'
import '~/index.css'

import DefaultLayout from '~/layouts/Default.vue'

export default function (Vue, { router, head, isClient }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)

  head.htmlAttrs = { lang: 'en' }
  head.bodyAttrs = { class: '' }
}
