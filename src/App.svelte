<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { path, navigate } from './router';
  import { fade, fly } from 'svelte/transition';
  import Router from './Router.svelte';
  import Title from './components/Title.svelte';
  import Menu from './components/Menu.svelte';
  import Checker from './components/Checker.svelte';
  import Activity from './components/Activity.svelte';
  import Suggestion from './components/Suggestion.svelte';
  import TypingText from './components/TypingText.svelte';
  import SplashScreen from './components/SplashScreen.svelte';
  import CyberpunkCity from './components/CyberpunkCity.svelte';
  import pages from './configs/pages.json';
  import titles from './configs/titles.json';

  // State
  let gameMode = false;
  let isContentVisible = true;
  let checker = false;
  let activity = false;
  let joke = false;
  let showHint = false;
  let showSplash = true;
  let containerRef: HTMLElement;
  let cyberpunkCity: CyberpunkCity;

  // Computed
  $: visiblePages = pages.filter((p: any) => !p.hidden);
  $: noFootersShowing = !activity && !checker && !joke;

  // Methods
  function toggleContent() {
    isContentVisible = !isContentVisible;
  }

  function startExploration() {
    if (cyberpunkCity) cyberpunkCity.startExplorationMode();
  }

  function startFlyingTour() {
    if (cyberpunkCity) cyberpunkCity.startFlyingTour();
  }

  function handleKeydown(e: KeyboardEvent) {
      if (gameMode) return;

      if (e.key === "Escape") {
          const gameRoutes = ['/game', '/noughts-and-crosses', '/checker', '/ask'];
          if (gameRoutes.includes($path)) {
              navigate('/hidden');
          }
      }

      switch (e.key) {
          case "ArrowRight": {
              const currentIndex = visiblePages.findIndex((page: any) => page.link === $path);
              if (currentIndex !== -1 && currentIndex < visiblePages.length - 1) {
                  navigate(visiblePages[currentIndex + 1].link);
              }
              break;
          }
          case "ArrowLeft": {
              const currentIndex = visiblePages.findIndex((page: any) => page.link === $path);
              if (currentIndex > 0) {
                  navigate(visiblePages[currentIndex - 1].link);
              }
              break;
          }
      }
  }

  // Lifecycle
  let splashTimeout: any;
  let hintTimeout1: any;
  let hintTimeout2: any;

  onMount(() => {
    splashTimeout = setTimeout(() => showSplash = false, 500);
    hintTimeout1 = setTimeout(() => showHint = true, 2000);
    hintTimeout2 = setTimeout(() => showHint = false, 5000);

    // Input detection for sticky hover fix
    let lastTouchTime = 0;
    const onTouchStart = () => {
        lastTouchTime = Date.now();
        document.body.classList.remove('can-hover');
    };
    const onMouseMove = () => {
        if (Date.now() - lastTouchTime > 500) {
            document.body.classList.add('can-hover');
        }
    };
    document.body.addEventListener('touchstart', onTouchStart);
    document.body.addEventListener('mousemove', onMouseMove);

    window.addEventListener('keydown', handleKeydown);

    return () => {
        document.body.removeEventListener('touchstart', onTouchStart);
        document.body.removeEventListener('mousemove', onMouseMove);
    };
  });

  onDestroy(() => {
    clearTimeout(splashTimeout);
    clearTimeout(hintTimeout1);
    clearTimeout(hintTimeout2);
    if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown);
  });

  // Watch route for title update
  $: {
    if (typeof document !== 'undefined') {
        let pageTitle = '404';
        const p = $path;

        if (p === '/noughts-and-crosses') pageTitle = 'Noughts and Crosses';
        else if (p === '/game') pageTitle = 'Catch the Button!';
        else if (p === '/checker') pageTitle = 'Checker';
        else if (p === '/ask') pageTitle = 'Ask Me';
        else {
            let routeName = '';
            if (p === '/') routeName = 'home';
            else {
                const parts = p.split('/').filter(Boolean);
                if (parts.length === 1) routeName = parts[0];
            }

            if (routeName) {
                const currentPage = pages.find((page: any) =>
                    routeName === 'home' ? page.link === '/' : page.link.slice(1) === routeName
                );
                if (currentPage) pageTitle = currentPage.title;
            }
        }
        document.title = "Elliot > " + pageTitle;
    }
  }
</script>

<div id="content-wrapper" class:fade-out={gameMode}>
  <nav>
    <Title
        title={titles.title}
        subtitle={titles.subtitle}
        {activity}
        {joke}
        on:activity={() => activity = !activity}
        on:joke={() => joke = !joke}
    />
    <Menu
        pages={visiblePages}
        contentVisible={isContentVisible}
        on:explore={startExploration}
        on:fly={startFlyingTour}
        on:toggle-content={toggleContent}
    />
  </nav>

  <div class="router-view-container" bind:this={containerRef}>
      {#if isContentVisible}
        {#key $path}
            <div class="router-transition-wrapper" in:fly={{ y: 20, duration: 500 }} out:fly={{ y: -20, duration: 500 }}>
                <Router />
            </div>
        {/key}
      {/if}
  </div>

  {#if noFootersShowing && showHint && isContentVisible}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <footer transition:fade on:click={() => checker = !checker} class="content-container">
          <TypingText text="The titles might be clickable..." />
      </footer>
  {/if}
</div>

<CyberpunkCity
    bind:this={cyberpunkCity}
    on:game-start={() => gameMode = true}
    on:game-end={() => gameMode = false}
/>

{#if checker}
    <div transition:fade class="overlay-container" class:fade-out={gameMode}>
        <Checker />
    </div>
{/if}
{#if activity}
    <div transition:fade class="overlay-container" class:fade-out={gameMode}>
        <Activity />
    </div>
{/if}
{#if joke}
    <div transition:fade class="overlay-container" class:fade-out={gameMode}>
        <Suggestion url="https://icanhazdadjoke.com/" valueName="joke" title="Have a laugh!" />
    </div>
{/if}
{#if showSplash}
    <div transition:fade class="overlay-container">
        <SplashScreen />
    </div>
{/if}

<style>
.title {
  margin-bottom: 0;
}

.fade-out {
  opacity: 0;
  pointer-events: none;
  transition: opacity 2s ease;
}

.overlay-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 100;
}
.overlay-container > :global(*) {
    pointer-events: auto;
}

/* Transitions are handled by Svelte `transition:fade` and `fly` */

.router-transition-wrapper {
    position: absolute;
    width: 100%;
}
</style>
