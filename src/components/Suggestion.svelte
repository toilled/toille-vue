<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let url: string;
  export let valueName: string;
  export let title: string;

  let suggestion: any = null;
  let loading = false;
  let hideHint = false;

  $: hoverHintText = "Click for a new " + valueName;

  async function fetchSuggestion() {
      loading = true;
      try {
          const res = await fetch(url, { headers: { Accept: "application/json" } });
          suggestion = await res.json();
      } catch (e) {
          console.error(e);
      } finally {
          loading = false;
      }
  }

  function newSuggestion() {
      fetchSuggestion();
      if (!hideHint) hideHint = true;
  }

  onMount(fetchSuggestion);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<footer
  on:click={newSuggestion}
  style:cursor={loading ? 'progress' : ''}
  class="content-container"
>
  {#if suggestion}
    <article title={hoverHintText} class="marginless">
      <header><strong>{title}</strong></header>
      <p class="marginless">{suggestion[valueName]}</p>
    </article>
  {:else}
    <article class="marginless">
      <header><strong>{title}</strong></header>
      <p class="marginless" aria-busy="true">{url} might be down.</p>
    </article>
  {/if}

  {#if !hideHint}
    <div transition:fade>
      <article style="padding-top: 0; margin-top: 0; margin-bottom: 0">
        <footer style="font-style: oblique; font-size: 0.8em; margin-top: 0">
          Click to update
        </footer>
      </article>
    </div>
  {/if}
</footer>
