import { ref } from "vue";

const showWarning = ref(false);
const warningMessage = ref("");
let resolver: ((value: boolean) => void) | null = null;

export function useEpilepsyWarning() {
  function confirm(message: string): Promise<boolean> {
    warningMessage.value = message;
    showWarning.value = true;
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function resolveConfirm(value: boolean) {
    showWarning.value = false;
    warningMessage.value = "";
    resolver?.(value);
    resolver = null;
  }

  return { showWarning, warningMessage, confirm, resolveConfirm };
}
