const STORAGE_KEY = 'city-background-enabled';

class CityBackgroundManager {
  isEnabled = ref(true);
  private initialized = false;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.initialized) {
      this.initialized = true;
      watch(this.isEnabled, (val) => {
        localStorage.setItem(STORAGE_KEY, String(val));
      });
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      this.isEnabled.value = stored === 'true';
    }
  }

  toggle() {
    this.isEnabled.value = !this.isEnabled.value;
  }
}

export const cityBackground = new CityBackgroundManager();
