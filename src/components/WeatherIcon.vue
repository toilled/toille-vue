<template>
  <div class="weather-icon-container" @click="toggleModal">
    <SunIcon v-if="iconType === 'sun'" :title="description" class="icon" />
    <CloudIcon v-else-if="iconType === 'cloud'" :title="description" class="icon" />
    <FogIcon v-else-if="iconType === 'fog'" :title="description" class="icon" />
    <RainIcon v-else-if="iconType === 'rain'" :title="description" class="icon" />
    <SnowIcon v-else-if="iconType === 'snow'" :title="description" class="icon" />
    <ThunderIcon v-else-if="iconType === 'thunder'" :title="description" class="icon" />
    <UnknownIcon v-else :title="description" class="icon" />

    <WeatherModal
      v-if="isMounted && showModal"
      :show="showModal"
      :forecast="hourlyForecast"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  SunIcon,
  CloudIcon,
  FogIcon,
  RainIcon,
  SnowIcon,
  ThunderIcon,
  UnknownIcon,
  WeatherModal,
} from './weather';

const { t } = useI18n();

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  rain?: number[];
}

interface HourlyData {
  time: string;
  temp: number;
  rain: number;
}

const iconType = ref<string>('');
const description = ref<string>('');
const showModal = ref(false);
const isMounted = ref(false);
const hourlyForecast = ref<HourlyData[]>([]);

const fetchWeather = async () => {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=51.9001&longitude=-2.0877&current_weather=true&hourly=temperature_2m,rain&timezone=Europe%2FLondon'
    );
    if (!res.ok) throw new Error('Failed to fetch weather');

    const data = await res.json();
    const code = data.current_weather.weathercode;
    const temp = data.current_weather.temperature;

    updateIcon(code, temp);
    processHourlyData(data.hourly);
  } catch (error) {
    console.error('Weather fetch error:', error);
    description.value = t('weather.unavailable');
    iconType.value = '';
  }
};

const processHourlyData = (hourly: OpenMeteoHourly) => {
  const now = new Date();
  const currentHourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}`;

  let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));

  if (startIndex === -1) {
    const nowTime = now.getTime();
    let minDiff = Infinity;
    for (let i = 0; i < hourly.time.length; i++) {
      const diff = Math.abs(new Date(hourly.time[i]).getTime() - nowTime);
      if (diff < minDiff) {
        minDiff = diff;
        startIndex = i;
      }
    }
  }

  const next6: HourlyData[] = [];
  for (let i = startIndex; i < startIndex + 6; i++) {
    if (hourly.time[i]) {
      next6.push({
        time: hourly.time[i].slice(11, 16),
        temp: hourly.temperature_2m[i],
        rain: hourly.rain ? hourly.rain[i] : 0,
      });
    }
  }
  hourlyForecast.value = next6;
};

const updateIcon = (code: number, temp: number) => {
  let weatherDesc: string;

  switch (true) {
    case code === 0:
      iconType.value = 'sun';
      weatherDesc = t('weather.clearSky');
      break;
    case [1, 2, 3].includes(code):
      iconType.value = 'cloud';
      weatherDesc = t('weather.partlyCloudy');
      break;
    case [45, 48].includes(code):
      iconType.value = 'fog';
      weatherDesc = t('weather.fog');
      break;
    case [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code):
      iconType.value = 'rain';
      weatherDesc = t('weather.rain');
      break;
    case [71, 73, 75, 77, 85, 86].includes(code):
      iconType.value = 'snow';
      weatherDesc = t('weather.snow');
      break;
    case [95, 96, 99].includes(code):
      iconType.value = 'thunder';
      weatherDesc = t('weather.thunderstorm');
      break;
    default:
      iconType.value = 'cloud';
      weatherDesc = t('weather.unknown');
      break;
  }

  description.value = t('weather.location', { desc: weatherDesc, temp });
};

const toggleModal = () => {
  if (hourlyForecast.value.length > 0) {
    showModal.value = true;
  }
};

onMounted(() => {
  isMounted.value = true;
  description.value = t('weather.loading');
  fetchWeather();
});

defineExpose({ toggleModal });
</script>

<style scoped>
.weather-icon-container {
  width: 24px;
  height: 24px;
  color: black;
  filter: invert(1);
  cursor: pointer;
  pointer-events: bounding-box;
}

.icon {
  width: 100%;
  height: 100%;
}
</style>
