<template>
  <div class="icon-wrapper" :title="description">
    <!-- Sun / Clear -->
    <svg
      v-if="iconType === 'sun'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="black" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- Cloud / Overcast / Fog -->
    <svg
      v-else-if="iconType === 'cloud'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>

    <!-- Rain / Drizzle -->
    <svg
      v-else-if="iconType === 'rain'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <path d="M16 13c.8 0 1.5.2 2.1.6 1.1 0 2.2 1.3 1.9 2.4-.2 1.1-1.3 1.6-2.4 1.6H7c-1.8 0-3.3-1.2-3.8-2.9-.5-1.7.3-3.6 1.9-4.3.4-2.8 2.8-5 5.7-5 2.1 0 4 .1 5.3 1.7" fill="none" stroke="black" stroke-width="2" />
      <path d="M8 19v2m4-2v2m4-2v2" stroke="black" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- Snow -->
    <svg
      v-else-if="iconType === 'snow'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <path d="M12 2v20m-8-6 16-8m-16 8 16-8" stroke="black" stroke-width="2" stroke-linecap="round" />
      <path d="M12 2l-2 3m2-3l2 3m-2 17l-2-3m2 3l2-3M4 16l3 1m-3-1l2-3m14 2l-3 1m3-1l-2-3M4 8l3-1m-3 1l2 3m14-2l-3-1m3 1l-2 3" stroke="black" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- Thunder -->
    <svg
      v-else-if="iconType === 'thunder'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      <path d="M13 14l-2 4h3l-1 4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- Question Mark (Loading/Error) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      class="icon"
    >
      <text x="50%" y="75%" text-anchor="middle" font-size="20" font-weight="bold" fill="black">?</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const iconType = ref<string>('');
const description = ref<string>('Loading weather...');

const fetchWeather = async () => {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true'
    );
    if (!res.ok) throw new Error('Failed to fetch weather');

    const data = await res.json();
    const code = data.current_weather.weathercode;
    const temp = data.current_weather.temperature;

    updateIcon(code, temp);
  } catch (error) {
    console.error('Weather fetch error:', error);
    description.value = 'Weather data unavailable';
    iconType.value = '';
  }
};

const updateIcon = (code: number, temp: number) => {
  let weatherDesc = '';

  if (code === 0) {
    iconType.value = 'sun';
    weatherDesc = 'Clear Sky';
  } else if ([1, 2, 3].includes(code)) {
    iconType.value = 'cloud';
    weatherDesc = 'Partly Cloudy';
  } else if ([45, 48].includes(code)) {
    iconType.value = 'cloud';
    weatherDesc = 'Fog';
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    iconType.value = 'rain';
    weatherDesc = 'Rain';
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    iconType.value = 'snow';
    weatherDesc = 'Snow';
  } else if ([95, 96, 99].includes(code)) {
    iconType.value = 'thunder';
    weatherDesc = 'Thunderstorm';
  } else {
    iconType.value = 'cloud';
    weatherDesc = 'Unknown';
  }

  description.value = `${weatherDesc} (${temp}°C) in Cheltenham, UK`;
};

onMounted(() => {
  fetchWeather();
});
</script>

<style scoped>
/* Styles inherited from parent usually, but we ensure basic layout */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  width: 24px;
  height: 24px;
}
</style>
