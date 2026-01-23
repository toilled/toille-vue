<template>
  <div class="icon-wrapper" :title="description" @click="toggleModal">
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

    <!-- Modal -->
    <Teleport to="body" v-if="isMounted">
      <div v-if="showModal" class="weather-modal-overlay" @click.self="showModal = false">
        <article class="weather-modal">
          <header class="modal-header">
            <h3>Weather Forecast</h3>
            <button class="close-btn" @click="showModal = false" aria-label="Close">&times;</button>
          </header>
          <div class="chart-container">
            <svg viewBox="0 0 300 150" class="weather-chart">
              <!-- Grid lines -->
              <line x1="0" y1="135" x2="300" y2="135" stroke="#444" stroke-width="1" />

              <!-- Rain Bars -->
              <g v-for="(point, index) in computedPoints" :key="'rain-' + index">
                 <rect
                    :x="point.x - 5"
                    :y="point.rainY"
                    width="10"
                    :height="point.rainHeight"
                    fill="rgba(0, 100, 255, 0.4)"
                    class="rain-bar"
                 />
                  <text
                    v-if="point.rain > 0"
                    :x="point.x"
                    :y="point.rainY - 4"
                    text-anchor="middle"
                    fill="#3399ff"
                    font-size="9"
                  >{{ point.rain }}mm</text>
              </g>

              <!-- Graph Line (Temp) -->
              <polyline
                :points="graphPoints"
                fill="none"
                stroke="#00ff9d"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Data Points (Temp) -->
              <g v-for="(point, index) in computedPoints" :key="'temp-' + index">
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  r="4"
                  fill="#111"
                  stroke="#00ff9d"
                  stroke-width="2"
                  class="data-point"
                />
                <!-- Labels -->
                 <text
                  :x="point.x"
                  y="148"
                  text-anchor="middle"
                  fill="#ccc"
                  font-size="10"
                >{{ point.time }}</text>
                 <text
                  :x="point.x"
                  :y="point.y - 10"
                  text-anchor="middle"
                  fill="#fff"
                  font-size="12"
                  font-weight="bold"
                >{{ point.temp }}°</text>
              </g>
            </svg>
          </div>
          <footer class="modal-footer">
            <small>Next 6 hours in Cheltenham</small>
            <div class="legend">
                <span class="legend-item"><span class="dot temp"></span>Temp</span>
                <span class="legend-item"><span class="dot rain"></span>Rain</span>
            </div>
          </footer>
        </article>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const iconType = ref<string>('');
const description = ref<string>('Loading weather...');
const showModal = ref(false);
const isMounted = ref(false);

interface HourlyData {
  time: string;
  temp: number;
  rain: number;
}
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
    description.value = 'Weather data unavailable';
    iconType.value = '';
  }
};

const processHourlyData = (hourly: any) => {
  const now = new Date();
  const currentHourStr = now.toISOString().slice(0, 13); // Match YYYY-MM-DDTHH format

  // Open Meteo returns time in ISO format (e.g., 2023-10-27T10:00)
  // Find index of current hour or next hour
  let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));

  if (startIndex === -1) {
    // Fallback if not found (e.g. timezone diff), just take nearest based on time comparison
    const nowTime = now.getTime();
    let minDiff = Infinity;
    startIndex = 0;
    for(let i=0; i<hourly.time.length; i++) {
        const t = new Date(hourly.time[i]).getTime();
        const diff = Math.abs(t - nowTime);
        if(diff < minDiff) {
            minDiff = diff;
            startIndex = i;
        }
    }
  }

  // Take next 6 hours (including current)
  const next6 = [];
  for (let i = startIndex; i < startIndex + 6; i++) {
    if (hourly.time[i]) {
      next6.push({
        time: hourly.time[i].slice(11, 16), // Extract HH:MM
        temp: hourly.temperature_2m[i],
        rain: hourly.rain ? hourly.rain[i] : 0
      });
    }
  }
  hourlyForecast.value = next6;
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

const toggleModal = () => {
  if (hourlyForecast.value.length > 0) {
    showModal.value = true;
  }
};

const computedPoints = computed(() => {
  if (hourlyForecast.value.length === 0) return [];
  const temps = hourlyForecast.value.map(d => d.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  // Add some padding to range to avoid lines touching edges
  const padding = 2; // degrees
  const range = (max - min) + (padding * 2) || 1;
  const bottomVal = min - padding;

  const width = 300;
  const height = 130; // Use 130 height for graph area, leaving bottom for labels
  const stepX = width / (hourlyForecast.value.length - 1 || 1);

  // Rain calculation
  const rains = hourlyForecast.value.map(d => d.rain);
  const maxRain = Math.max(...rains, 5); // Default scale up to 5mm if less

  return hourlyForecast.value.map((d, i) => {
    // Rain bar height (scaled to 40% of graph height max)
    const rainHeight = (d.rain / maxRain) * (height * 0.4);

    return {
      x: i * stepX,
      y: height - ((d.temp - bottomVal) / range) * height,
      temp: d.temp,
      time: d.time,
      rain: d.rain,
      rainHeight,
      rainY: 135 - rainHeight // Start from bottom line (135)
    };
  });
});

const graphPoints = computed(() => {
  return computedPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

onMounted(() => {
  isMounted.value = true;
  fetchWeather();
});
</script>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.icon {
  width: 24px;
  height: 24px;
}

/* Modal Styles */
.weather-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.weather-modal {
  background: #111;
  color: #eee;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  border: 1px solid #333;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #00ff9d;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.chart-container {
  width: 100%;
  /* height: 200px; */
}

.weather-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.modal-footer {
  margin-top: 1rem;
  text-align: center;
  color: #666;
}

.data-point {
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 6;
  cursor: crosshair;
}

.rain-bar {
    transition: height 0.3s ease;
}

.legend {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 5px;
    font-size: 0.8rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.dot.temp {
    background: #00ff9d;
}

.dot.rain {
    background: #3399ff;
}
</style>
