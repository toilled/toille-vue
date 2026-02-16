<script lang="ts">
  import { fade } from 'svelte/transition';
  import Paragraph from './Paragraph.svelte';
  import pages from '../configs/pages.json';

  export let name: string;

  let showHint = false;

  // Compute resolvedPage reactive to `name`
  $: resolvedPage = (() => {
      // name is from router logic:
      // / -> name='home'
      // /:name -> name=params.name
      // 404 -> name='404'

      if (name === 'home') return pages.find((p: any) => p.link === '/');
      if (name === '404') return null;

      const found = pages.find((p: any) => p.link.slice(1) === name);
      // If not found and not explicitly 404, we might default or show 404.
      // Vue logic was: if route.params.name -> find page. if not found -> undefined.
      // If route.params.pathMatch -> null.
      // If none (route.path === '/') -> pages[0].

      // With my router:
      // / -> name='home'
      // /:name -> name=foo

      if (found) return found;

      // If name is home but not found (unlikely), fallback to pages[0]
      if (name === 'home') return pages[0];

      return null;
  })();

  function handleMouseDown() {
    showHint = true;
    setTimeout(() => showHint = false, 500);
  }
</script>

<main>
  <section>
    <article class="marginless">
      <header>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <h2 class="title" on:mousedown={handleMouseDown}>
          {#if resolvedPage}
            {resolvedPage.title}
            {#if showHint}
              <span transition:fade
                style="font-weight: 100; font-style: italic; font-size: 0.6em; vertical-align: middle;">
                - Nothing here
              </span>
            {/if}
          {:else}
            404 - Page not found
          {/if}
        </h2>
      </header>
      {#if resolvedPage}
        {#each resolvedPage.body as paragraph, index}
          <Paragraph
            {paragraph}
            last={index + 1 === resolvedPage.body.length}
          />
        {/each}
      {:else}
        <Paragraph
          paragraph={`The page <strong>${name}</strong> does not exist!`}
          last={true}
        />
      {/if}
    </article>
  </section>
</main>
