import { ref, watch } from "vue";

const STORAGE_KEY = "city-background-enabled";

class CityBackgroundManager {
  isEnabled = ref(true);

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        this.isEnabled.value = stored === "true";
      }
      watch(this.isEnabled, (val) => {
        localStorage.setItem(STORAGE_KEY, String(val));
      });
    }
  }

  toggle() {
    this.isEnabled.value = !this.isEnabled.value;
  }
}

export const cityBackground = new CityBackgroundManager();
