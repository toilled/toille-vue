import { createSignal, onMount, createMemo, Show, For } from 'solid-js';
import { Portal } from 'solid-js/web';

interface HourlyData {
  time: string;
  temp: number;
  rain: number;
}

export default function WeatherIcon() {
  const [iconType, setIconType] = createSignal<string>('');
  const [description, setDescription] = createSignal<string>('Loading weather...');
  const [showModal, setShowModal] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);
  const [hourlyForecast, setHourlyForecast] = createSignal<HourlyData[]>([]);

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
      setDescription('Weather data unavailable');
      setIconType('');
    }
  };

  const processHourlyData = (hourly: any) => {
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13);

    let startIndex = hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));

    if (startIndex === -1) {
      const nowTime = now.getTime();
      let minDiff = Infinity;
      startIndex = 0;
      for (let i = 0; i < hourly.time.length; i++) {
        const t = new Date(hourly.time[i]).getTime();
        const diff = Math.abs(t - nowTime);
        if (diff < minDiff) {
          minDiff = diff;
          startIndex = i;
        }
      }
    }

    const next6 = [];
    for (let i = startIndex; i < startIndex + 6; i++) {
      if (hourly.time[i]) {
        next6.push({
          time: hourly.time[i].slice(11, 16),
          temp: hourly.temperature_2m[i],
          rain: hourly.rain ? hourly.rain[i] : 0
        });
      }
    }
    setHourlyForecast(next6);
  };

  const updateIcon = (code: number, temp: number) => {
    let weatherDesc = '';

    if (code === 0) {
      setIconType('sun');
      weatherDesc = 'Clear Sky';
    } else if ([1, 2, 3].includes(code)) {
      setIconType('cloud');
      weatherDesc = 'Partly Cloudy';
    } else if ([45, 48].includes(code)) {
      setIconType('cloud');
      weatherDesc = 'Fog';
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
      setIconType('rain');
      weatherDesc = 'Rain';
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
      setIconType('snow');
      weatherDesc = 'Snow';
    } else if ([95, 96, 99].includes(code)) {
      setIconType('thunder');
      weatherDesc = 'Thunderstorm';
    } else {
      setIconType('cloud');
      weatherDesc = 'Unknown';
    }

    setDescription(`${weatherDesc} (${temp}°C) in Cheltenham, UK`);
  };

  const toggleModal = () => {
    if (hourlyForecast().length > 0) {
      setShowModal(true);
    }
  };

  const computedPoints = createMemo(() => {
    if (hourlyForecast().length === 0) return [];
    const temps = hourlyForecast().map(d => d.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const padding = 2;
    const range = (max - min) + (padding * 2) || 1;
    const bottomVal = min - padding;

    const width = 300;
    const height = 130;
    const stepX = width / (hourlyForecast().length - 1 || 1);

    const rains = hourlyForecast().map(d => d.rain);
    const maxRain = Math.max(...rains, 5);

    return hourlyForecast().map((d, i) => {
      const rainHeight = (d.rain / maxRain) * (height * 0.4);

      return {
        x: i * stepX,
        y: height - ((d.temp - bottomVal) / range) * height,
        temp: d.temp,
        time: d.time,
        rain: d.rain,
        rainHeight,
        rainY: 135 - rainHeight
      };
    });
  });

  const graphPoints = createMemo(() => {
    return computedPoints().map(p => `${p.x},${p.y}`).join(' ');
  });

  onMount(() => {
    setIsMounted(true);
    fetchWeather();
  });

  return (
    <div class="icon-wrapper" title={description()} onClick={toggleModal}>
      <Show when={iconType() === 'sun'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364l-1.414 1.414M6.05 17.95l-1.414 1.414M17.95 17.95l1.414 1.414M6.05 6.05L4.636 4.636" stroke="black" stroke-width="2" stroke-linecap="round" />
        </svg>
      </Show>

      <Show when={iconType() === 'cloud'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <path d="M17.5 19C19.985 19 22 16.985 22 14.5C22 12.185 20.25 10.3 18 10.05C17.5 6.65 14.5 4 11 4C7.134 4 4 7.134 4 11C1.75 11.25 0 13.185 0 15.5C0 17.985 2.015 20 4.5 20H17.5V19Z" />
        </svg>
      </Show>

      <Show when={iconType() === 'rain'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <path d="M16 11h-1.26A8 8 0 1 0 7 21h9a5 5 0 0 0 0-10z" />
          <path d="M12 14v5m-3-4v5m6-6v5" stroke="black" stroke-width="2" stroke-linecap="round" />
        </svg>
      </Show>

      <Show when={iconType() === 'snow'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          <path d="M12 14v4m0 0l-1.5-1.5M12 18l1.5-1.5M9.5 15.5l3 1.5-3 1.5M14.5 15.5l-3 1.5 3 1.5" stroke="black" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </Show>

      <Show when={iconType() === 'thunder'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          <path d="M13 14l-2 4h3l-1 4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </Show>

      <Show when={!iconType()}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" class="icon">
          <text x="50%" y="75%" text-anchor="middle" font-size="20" font-weight="bold" fill="black">?</text>
        </svg>
      </Show>

      <Show when={isMounted() && showModal()}>
        <Portal>
          <div class="weather-modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) setShowModal(false) }}>
            <article class="weather-modal">
              <header class="modal-header">
                <h3>Weather Forecast</h3>
                <button class="close-btn" onClick={() => setShowModal(false)} aria-label="Close">&times;</button>
              </header>
              <div class="chart-container">
                <svg viewBox="0 0 300 150" class="weather-chart">
                  <line x1="0" y1="135" x2="300" y2="135" stroke="#444" stroke-width="1" />

                  <For each={computedPoints()}>
                    {(point) => (
                      <g>
                         <rect
                            x={point.x - 5}
                            y={point.rainY}
                            width="10"
                            height={point.rainHeight}
                            fill="rgba(0, 100, 255, 0.4)"
                            class="rain-bar"
                         />
                         <Show when={point.rain > 0}>
                          <text
                            x={point.x}
                            y={point.rainY - 4}
                            text-anchor="middle"
                            fill="#3399ff"
                            font-size="9"
                          >{point.rain}mm</text>
                         </Show>
                      </g>
                    )}
                  </For>

                  <polyline
                    points={graphPoints()}
                    fill="none"
                    stroke="#00ff9d"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <For each={computedPoints()}>
                    {(point) => (
                      <g>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#111"
                          stroke="#00ff9d"
                          stroke-width="2"
                          class="data-point"
                        />
                         <text
                          x={point.x}
                          y="148"
                          text-anchor="middle"
                          fill="#ccc"
                          font-size="10"
                        >{point.time}</text>
                         <text
                          x={point.x}
                          y={point.y - 10}
                          text-anchor="middle"
                          fill="#fff"
                          font-size="12"
                          font-weight="bold"
                        >{point.temp}°</text>
                      </g>
                    )}
                  </For>
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
        </Portal>
      </Show>
      <style>{`
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
      `}</style>
    </div>
  );
}
