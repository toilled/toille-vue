<script lang="ts">
  import { onMount } from 'svelte';

  let count = 0;
  let limitTime = "";
  let soberTime = "";

  function updateTimes() {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
    } as const;
    const currentTime = new Date().getTime();
    if (count === 0) {
      limitTime = new Date(currentTime).toLocaleTimeString([], options);
      soberTime = new Date(currentTime).toLocaleTimeString([], options);
    } else {
      limitTime = new Date(
        currentTime + count * 60 * 60 * 1000,
      ).toLocaleTimeString([], options);
      soberTime = new Date(
        currentTime + (count + 1) * 60 * 60 * 1000,
      ).toLocaleTimeString([], options);
    }
  }

  function add() {
    count++;
    updateTimes();
  }

  function subtract() {
    if (count > 0) {
      count--;
      updateTimes();
    }
  }

  onMount(updateTimes);

  $: count, updateTimes();
</script>

<footer class="content-container">
  <article class="marginless">
    <header>Alcohol Checker</header>
    <section class="grid">
      <button on:click={add} class="outline">Add</button>
      <button on:click={subtract} class="outline">Subtract</button>
    </section>
    <table class="marginless">
      <thead>
        <tr>
          <th>Units consumed</th>
          <th>Borderline time</th>
          <th>Safe time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{count}</td>
          <td>{limitTime}</td>
          <td>{soberTime}</td>
        </tr>
      </tbody>
    </table>
  </article>
</footer>
