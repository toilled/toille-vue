import { ref } from "vue";

class CityBackgroundManager {
  isEnabled = ref(true);

  toggle() {
    this.isEnabled.value = !this.isEnabled.value;
  }
}

export const cityBackground = new CityBackgroundManager();
