<template>
  <div class="container mx-auto px-4 mt-8">
    <div class="bg-gray-800 rounded-lg shadow-lg p-4">
      <div class="text-center text-xl font-bold mb-4">Alcohol Checker</div>
      <div class="grid grid-cols-2 gap-4 mb-4">
        <button
          @click="add"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add
        </button>
        <button
          @click="subtract"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Subtract
        </button>
      </div>
      <table class="w-full text-center">
        <thead>
          <tr>
            <th class="py-2">Units consumed</th>
            <th class="py-2">Borderline time</th>
            <th class="py-2">Safe time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="py-2">{{ count }}</td>
            <td class="py-2">{{ limitTime }}</td>
            <td class="py-2">{{ soberTime }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

/**
 * @file Checker.vue
 * @description A component that calculates and displays estimated times to be under the drink-drive limit and sober.
 * It allows users to add or subtract units of alcohol consumed.
 */

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
      currentTime + count.value * 60 * 60 * 1000,
    ).toLocaleTimeString([], options);
    soberTime.value = new Date(
      currentTime + (count.value + 1) * 60 * 60 * 1000,
    ).toLocaleTimeString([], options);
  }
}

/**
 * @description Increments the count of alcohol units.
 */
function add() {
  count.value++;
}

/**
 * @description Decrements the count of alcohol units, with a minimum of 0.
 */
function subtract() {
  if (count.value > 0) {
    count.value--;
  }
}

/**
 * @description A Vue lifecycle hook that initializes the times when the component is mounted.
 */
onMounted(updateTimes);

/**
 * @description A Vue watcher that calls `updateTimes` whenever the `count` changes.
 */
watch(count, updateTimes);
</script>