<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let subtitle: string;
  export let activity: boolean = false;
  export let joke: boolean = false;

  const dispatch = createEventDispatcher();

  let animatingTitle = false;
  let animatingSubtitle = false;

  function handleTitleClick() {
    dispatch('activity');
    triggerAnimation('title');
  }

  function handleSubtitleClick() {
    dispatch('joke');
    triggerAnimation('subtitle');
  }

  function triggerAnimation(target: 'title' | 'subtitle') {
    if (target === 'title') {
        if (animatingTitle) return;
        animatingTitle = true;
        setTimeout(() => animatingTitle = false, 1000);
    } else {
        if (animatingSubtitle) return;
        animatingSubtitle = true;
        setTimeout(() => animatingSubtitle = false, 1000);
    }
  }
</script>

<ul>
  <li>
    <hgroup>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <h1
        class="title question"
        class:space-warp={animatingTitle}
        on:mousedown={handleTitleClick}
      >
        {title}
      </h1>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <h2
        class="title question"
        class:space-warp={animatingSubtitle}
        on:mousedown={handleSubtitleClick}
      >
        {subtitle}
      </h2>
    </hgroup>
  </li>
</ul>

<style>
.space-warp {
  animation: space-warp 1s ease-in-out;
}

@keyframes space-warp {
  0% {
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  25% {
    transform: scale(1.1) skewX(-10deg);
    filter: hue-rotate(90deg) drop-shadow(0 0 10px cyan);
  }
  50% {
    transform: scale(0.9) skewX(10deg);
    filter: hue-rotate(180deg) drop-shadow(0 0 10px magenta);
  }
  75% {
    transform: scale(1.05) skewX(-5deg);
    filter: hue-rotate(270deg) drop-shadow(0 0 10px cyan);
  }
  100% {
    transform: scale(1);
    filter: hue-rotate(360deg);
  }
}
</style>
