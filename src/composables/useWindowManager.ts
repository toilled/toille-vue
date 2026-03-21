import { reactive } from 'vue';

export interface WindowState {
  id: string;
  title: string;
  component: any;
  props?: Record<string, any>;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullScreen?: boolean;
}

const state = reactive({
  windows: [] as WindowState[],
  activeWindowId: null as string | null,
  nextZIndex: 100
});

export function useWindowManager() {
  const openWindow = (title: string, component: any, props: Record<string, any> = {}, options: Partial<WindowState> = {}) => {
    const id = Math.random().toString(36).substring(2, 9);

    // Default size/pos logic
    const width = options.width || 600;
    const height = options.height || 400;

    // Slight offset for new windows
    const offset = state.windows.length * 30;
    const x = options.x !== undefined ? options.x : 50 + offset;
    const y = options.y !== undefined ? options.y : 50 + offset;

    const newWindow: WindowState = {
      id,
      title,
      component,
      props,
      x,
      y,
      width,
      height,
      zIndex: state.nextZIndex++,
      isMinimized: false,
      isMaximized: false,
      isFullScreen: options.isFullScreen || false,
      ...options
    };

    state.windows.push(newWindow);
    focusWindow(id);
    return id;
  };

  const closeWindow = (id: string) => {
    const index = state.windows.findIndex(w => w.id === id);
    if (index !== -1) {
      state.windows.splice(index, 1);
      if (state.activeWindowId === id) {
        state.activeWindowId = null;
        // Focus top-most window if any remain
        if (state.windows.length > 0) {
           const topWindow = state.windows.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current);
           focusWindow(topWindow.id);
        }
      }
    }
  };

  const focusWindow = (id: string) => {
    const win = state.windows.find(w => w.id === id);
    if (win && win.zIndex < state.nextZIndex - 1) {
      win.zIndex = state.nextZIndex++;
    }
    state.activeWindowId = id;
  };

  const toggleMinimize = (id: string) => {
    const win = state.windows.find(w => w.id === id);
    if (win) {
      win.isMinimized = !win.isMinimized;
      if (!win.isMinimized) focusWindow(id);
    }
  };

  const toggleMaximize = (id: string) => {
    const win = state.windows.find(w => w.id === id);
    if (win) {
      win.isMaximized = !win.isMaximized;
      focusWindow(id);
    }
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
     const win = state.windows.find(w => w.id === id);
     if(win) {
         win.x = x;
         win.y = y;
     }
  }

  const updateWindowSize = (id: string, width: number, height: number) => {
      const win = state.windows.find(w => w.id === id);
      if(win) {
          win.width = width;
          win.height = height;
      }
  }

  return {
    state,
    openWindow,
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    updateWindowPosition,
    updateWindowSize
  };
}
