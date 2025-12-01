<template>
  <div>
    <nav>
      <Title
        :title="titles.title"
        :subtitle="titles.subtitle"
        :activity="activity"
        :joke="joke"
        @activity="toggleActivity"
        @joke="toggleJoke"
      />
      <Menu :pages="visiblePages" />
    </nav>
    <div class="router-view-container" ref="containerRef">
      <transition
        :name="transitionName"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
      >
        <slot />
      </transition>
    </div>
    <Starfield />
    <transition name="fade">
      <footer
        v-if="noFootersShowing && showHint"
        @click="checker = !checker"
        class="content-container"
      >
        <TypingText text="The titles might be clickable..." />
      </footer>
    </transition>
    <transition name="fade">
      <Checker v-if="checker" />
    </transition>
    <transition name="fade">
      <Activity v-show="activity" />
    </transition>
    <transition name="fade">
      <Suggestion
        v-show="joke"
        url="https://icanhazdadjoke.com/"
        valueName="joke"
        title="Have a laugh!"
      />
    </transition>
  </div>
</template>

<script>
import Title from '~/components/Title.vue'
import Menu from '~/components/Menu.vue'
import Checker from '~/components/Checker.vue'
import Activity from '~/components/Activity.vue'
import Suggestion from '~/components/Suggestion.vue'
import Starfield from '~/components/Starfield.vue'
import TypingText from '~/components/TypingText.vue'
import pages from '~/configs/pages.json'
import titles from '~/configs/titles.json'

export default {
  components: {
    Title,
    Menu,
    Checker,
    Activity,
    Suggestion,
    Starfield,
    TypingText
  },
  data() {
    return {
      titles,
      checker: false,
      activity: false,
      joke: false,
      showHint: false,
      transitionName: 'cards'
    }
  },
  computed: {
    visiblePages() {
      return pages.filter((page) => !page.hidden)
    },
    noFootersShowing() {
      return !this.activity && !this.checker && !this.joke
    }
  },
  watch: {
    '$route.path': {
      immediate: true,
      handler(newPath, oldPath) {
        if (oldPath) {
          const oldPageIndex = this.getPageIndex(oldPath.slice(1))
          const newPageIndex = this.getPageIndex(newPath.slice(1))

          this.transitionName = newPageIndex > oldPageIndex ? 'cards' : 'cards-reverse'
        }

        let pageTitle

        if (newPath === '/noughts-and-crosses') {
          pageTitle = 'Noughts and Crosses'
        } else if (newPath === '/game') {
          pageTitle = 'Catch the Button!'
        } else if (newPath === '/checker') {
          pageTitle = 'Checker'
        } else {
          let routeName
          if (this.$route.params && this.$route.params.name) {
            routeName = this.$route.params.name
          } else if (newPath === '/') {
            routeName = 'home'
          }

          if (routeName) {
            let currentPage
            if (routeName === 'home') {
              currentPage = pages.find((page) => page.link === '/')
            } else {
              currentPage = pages.find((page) => page.link.slice(1) === routeName)
            }
            pageTitle = currentPage ? currentPage.title : '404'
          } else {
            pageTitle = '404'
          }
        }

        if (typeof document !== 'undefined') {
          document.title = "Elliot > " + pageTitle;
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.showHint = true
    }, 2000)

    setTimeout(() => {
      this.showHint = false
    }, 5000)

    // Input detection for sticky hover fix
    let lastTouchTime = 0

    document.body.addEventListener('touchstart', () => {
      lastTouchTime = Date.now()
      document.body.classList.remove('can-hover')
    })

    document.body.addEventListener('mousemove', () => {
      if (Date.now() - lastTouchTime > 500) {
        document.body.classList.add('can-hover')
      }
    })
  },
  methods: {
    onBeforeLeave(el) {
      if (this.$refs.containerRef) {
        const { height } = getComputedStyle(el)
        this.$refs.containerRef.style.height = height
      }
    },
    onEnter(el) {
      if (this.$refs.containerRef) {
        const { height } = getComputedStyle(el)
        this.$refs.containerRef.style.height = height
      }
    },
    onAfterEnter() {
      if (this.$refs.containerRef) {
        this.$refs.containerRef.style.height = ''
      }
    },
    getPageIndex(routeName) {
      if (routeName === '/') {
        return pages.findIndex((page) => page.link === '/')
      }

      const index = pages.findIndex((page) => page.link.slice(1) === routeName)
      return index === -1 ? Object.keys(pages).length : index
    },
    toggleActivity() {
      this.activity = !this.activity
    },
    toggleJoke() {
      this.joke = !this.joke
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
