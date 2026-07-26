<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="weather-modal-overlay"
      @click.self="$emit('close')"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="t('weather.forecast')"
    >
      <article class="weather-modal">
        <header class="modal-header">
          <h2>{{ t('weather.forecast') }}</h2>
          <button class="close-btn" @click="$emit('close')" :aria-label="t('weather.close')">
            &times;
          </button>
        </header>
        <div class="chart-container">
          <svg viewBox="0 0 300 150" class="weather-chart">
            <!-- Grid line -->
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
              >
                {{ point.rain }}mm
              </text>
            </g>

            <!-- Graph Line (Temp) -->
            <polyline
              :points="tempLinePoints"
              fill="none"
              stroke="#00ff9d"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Data Points (Temp) -->
            <g v-for="(point, index) in computedPoints" :key="'dot-' + index">
              <circle
                :cx="point.x"
                :cy="point.tempY"
                r="4"
                fill="#111"
                stroke="#00ff9d"
                stroke-width="2"
                class="data-point"
              />
              <text :x="point.x" y="148" text-anchor="middle" fill="#ccc" font-size="10">
                {{ point.time }}
              </text>
              <text
                :x="point.x"
                :y="point.tempY - 10"
                text-anchor="middle"
                fill="#fff"
                font-size="12"
                font-weight="bold"
              >
                {{ point.temp }}°
              </text>
            </g>
          </svg>
        </div>
        <footer class="modal-footer">
          <small>{{ t('weather.nextHours') }}</small>
          <div class="legend">
            <span class="legend-item"><span class="dot temp"></span>{{ t('weather.temp') }}</span>
            <span class="legend-item"
              ><span class="dot rain"></span>{{ t('weather.rainLabel') }}</span
            >
          </div>
        </footer>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface HourlyData {
  time: string;
  temp: number;
  rain: number;
}

interface ComputedPoint extends HourlyData {
  x: number;
  rainY: number;
  rainHeight: number;
  tempY: number;
}

const { t } = useI18n();

const props = defineProps<{
  show: boolean;
  forecast: HourlyData[];
}>();

defineEmits<{ close: [] }>();

const computedPoints = computed<ComputedPoint[]>(() => {
  if (!props.forecast.length) return [];

  const maxRain = Math.max(...props.forecast.map((p) => p.rain), 1);
  const maxTemp = Math.max(...props.forecast.map((p) => p.temp));
  const minTemp = Math.min(...props.forecast.map((p) => p.temp));
  const tempRange = maxTemp - minTemp || 1;

  return props.forecast.map((p, i) => {
    const x = 25 + i * 50;
    const rainHeight = (p.rain / maxRain) * 120;
    const rainY = 135 - rainHeight;
    const tempY = 135 - ((p.temp - minTemp) / tempRange) * 120;

    return { ...p, x, rainY, rainHeight, tempY };
  });
});

const tempLinePoints = computed(() => {
  return computedPoints.value.map((p) => `${p.x},${p.tempY}`).join(' ');
});
</script>

<style scoped>
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
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
