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

            <!-- Temp Line -->
            <polyline
              :points="tempLinePoints"
              fill="none"
              stroke="#ff6600"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- Temp Dots -->
            <g v-for="(point, index) in computedPoints" :key="'dot-' + index">
              <circle :cx="point.x" :cy="point.tempY" r="3" fill="#ff6600" />
              <text
                :x="point.x"
                :y="point.tempY - 6"
                text-anchor="middle"
                fill="#ff6600"
                font-size="9"
                font-weight="bold"
              >
                {{ point.temp }}°
              </text>
            </g>

            <!-- Time Labels -->
            <g v-for="(point, index) in computedPoints" :key="'label-' + index">
              <text :x="point.x" y="148" text-anchor="middle" fill="#aaa" font-size="8">
                {{ point.time }}
              </text>
            </g>
          </svg>
        </div>
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
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.weather-modal {
  background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid #00ffcc;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 340px;
  box-shadow:
    0 0 20px rgba(0, 255, 204, 0.2),
    0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 255, 204, 0.2);
}

.modal-header h2 {
  margin: 0;
  color: #00ffcc;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #00ffcc;
}

.chart-container {
  height: 160px;
}

.weather-chart {
  width: 100%;
  height: 100%;
}
</style>
