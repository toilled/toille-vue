<template>
  <footer class="content-container" role="main" aria-label="Alcohol Checker Tool" id="main-content">
    <article class="marginless">
      <header>Alcohol Checker</header>
      <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">
        Estimate when you'll be under the drink-drive limit. One unit ≈ 1 hour to process.
      </p>
      <section class="grid">
        <button @click="add" class="outline" aria-label="Add one unit of alcohol">Add</button>
        <button @click="subtract" class="outline" aria-label="Subtract one unit of alcohol">Subtract</button>
        <button @click="reset" class="outline" aria-label="Reset unit count to zero">Reset</button>
      </section>
      <table class="marginless" aria-describedby="table-caption">
        <caption id="table-caption" class="visually-hidden">Alcohol consumption tracker showing units consumed and estimated times</caption>
        <thead>
          <tr>
            <th scope="col">Units consumed</th>
            <th scope="col">Borderline time</th>
            <th scope="col">Safe time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ count }}</td>
            <td>{{ limitTime }}</td>
            <td>{{ soberTime }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useHead } from "@vueuse/head";

/**
 * @file Checker.vue
 * @description A component that calculates and displays estimated times to be under the drink-drive limit and sober.
 * It allows users to add or subtract units of alcohol consumed.
 */

const MS_PER_UNIT = 60 * 60 * 1000;
const STORAGE_KEY = "alcohol-checker-count";
const MAX_UNITS = 50;

useHead({
  title: "Elliot > Alcohol Checker",
  meta: [
    {
      name: "description",
      content: "Calculate when you'll be sober enough to drive with this alcohol unit tracker",
    },
  ],
});

/**
 * @type {import('vue').Ref<number>}
 * @description A reactive reference to the number of alcohol units consumed.
 */
const count = ref(0);

/**
 * @type {import('vue').Ref<string>}
 * @description A reactive reference to the formatted string for the borderline (drink-drive limit) time.
 */
const limitTime = ref("");

/**
 * @type {import('vue').Ref<string>}
 * @description A reactive reference to the formatted string for the estimated sober time.
 */
const soberTime = ref("");

/**
 * @description Updates the `limitTime` and `soberTime` based on the current `count` of alcohol units.
 * A unit of alcohol is estimated to take 1 hour to process.
 * The "borderline" time is when the user might be back under the limit.
 * The "sober" time is an hour after the borderline time, as a safer estimate.
 */
function updateTimes() {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
  } as const;
  const currentTime = new Date().getTime();
  if (count.value === 0) {
    limitTime.value = new Date(currentTime).toLocaleTimeString([], options);
    soberTime.value = new Date(currentTime).toLocaleTimeString([], options);
  } else {
    limitTime.value = new Date(
      currentTime + count.value * MS_PER_UNIT,
    ).toLocaleTimeString([], options);
    soberTime.value = new Date(
      currentTime + (count.value + 1) * MS_PER_UNIT,
    ).toLocaleTimeString([], options);
  }
}

/**
 * @description Increments the count of alcohol units and saves to localStorage.
 */
function add() {
  if (count.value < MAX_UNITS) {
    count.value++;
  }
}

/**
 * @description Decrements the count of alcohol units, with a minimum of 0, and saves to localStorage.
 */
function subtract() {
  if (count.value > 0) {
    count.value--;
  }
}

/**
 * @description Resets the count to 0 and clears localStorage.
 */
function reset() {
  count.value = 0;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * @description A Vue lifecycle hook that initializes the times when the component is mounted.
 */
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      count.value = parsed;
    }
  }
  updateTimes();
});

/**
 * @description A Vue watcher that calls `updateTimes` whenever the `count` changes.
 * Also saves to localStorage.
 */
watch(count, (newVal) => {
  updateTimes();
  localStorage.setItem(STORAGE_KEY, newVal.toString());
});
</script>

<style scoped>
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>