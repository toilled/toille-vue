<template>
  <v-footer app color="transparent" class="justify-center">
    <v-card width="100%" max-width="600" elevation="8">
      <v-card-title>Alcohol Checker</v-card-title>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="6">
            <v-btn block color="primary" variant="outlined" @click="add">Add</v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block color="error" variant="outlined" @click="subtract">Subtract</v-btn>
          </v-col>
        </v-row>
        <v-table>
          <thead>
            <tr>
              <th>Units consumed</th>
              <th>Borderline time</th>
              <th>Safe time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ count }}</td>
              <td>{{ limitTime }}</td>
              <td>{{ soberTime }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const count = ref(0);
const limitTime = ref("");
const soberTime = ref("");

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

function add() {
  count.value++;
}

function subtract() {
  if (count.value > 0) {
    count.value--;
  }
}

onMounted(updateTimes);

watch(count, updateTimes);
</script>
