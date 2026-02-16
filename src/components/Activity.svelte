<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let activity: any = null;
  let loading = false;
  let hideHint = false;

  async function fetchActivity() {
      loading = true;
      try {
          const response = await fetch("https://bored.api.lewagon.com/api/activity");
          activity = await response.json();
      } catch (error) {
          console.error(error);
      } finally {
          loading = false;
      }
  }

  function newSuggestion() {
      fetchActivity();
      if (!hideHint) hideHint = true;
  }

  onMount(fetchActivity);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<footer
  on:click={newSuggestion}
  style:cursor={loading ? 'progress' : ''}
  class="content-container"
>
  {#if activity}
    <article title="Click for a new suggestion" class="marginless">
      <header>
        <strong>
          Try this {activity.type} activity
        </strong>
        (The Bored API)
      </header>
      <p class="marginless">{activity.activity}</p>
    </article>
  {:else}
    <article class="marginless">
      <header>
        <strong>Try this activity</strong>
      </header>
      <p class="marginless" aria-busy="true">
        Loading from The Bored API.
      </p>
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
