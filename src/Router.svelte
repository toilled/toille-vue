<script lang="ts">
  import { path } from './router';
  import PageContent from './components/PageContent.svelte';
  import Checker from './components/Checker.svelte';
  import MiniGame from './components/MiniGame.svelte';
  import NoughtsAndCrosses from './components/NoughtsAndCrosses.svelte';
  import Ask from './components/Ask.svelte';

  $: currentPath = $path;

  function match(p: string) {
      if (p === '/') return { Component: PageContent, props: { name: 'home' } };
      // Strip trailing slash for consistency
      const cleanPath = p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;

      if (cleanPath === '/checker') return { Component: Checker, props: {} };
      if (cleanPath === '/game') return { Component: MiniGame, props: {} };
      if (cleanPath === '/noughts-and-crosses') return { Component: NoughtsAndCrosses, props: {} };
      if (cleanPath === '/ask') return { Component: Ask, props: {} };

      const parts = cleanPath.split('/').filter(Boolean);

      // /:name
      if (parts.length === 1) {
          return { Component: PageContent, props: { name: parts[0] } };
      }

      // Fallback
      return { Component: PageContent, props: { name: '404' } };
  }

  $: route = match(currentPath);
</script>

<svelte:component this={route.Component} {...route.props} />
