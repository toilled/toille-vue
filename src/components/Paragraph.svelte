<script lang="ts">
  export let paragraph: string;
  export let last: boolean = false;
</script>

<div class="text-paragraph" class:marginless={last}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {@html paragraph}
</div>

<style>
/* text-paragraph is defined globally in main.css as per memory/check */
</style>
