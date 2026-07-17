export interface WindowState {
  id: string;
  title: string;
  component: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  props: Record<string, unknown> | undefined;
  icon: string | undefined;
  minWidth: number | undefined;
  minHeight: number | undefined;
  userResized: boolean;
  _prevX?: number;
  _prevY?: number;
  _prevWidth?: number;
  _prevHeight?: number;
}

const windows = ref<WindowState[]>([]);
let nextZIndex = 100;
let windowCounter = 0;

export function useWindowManager() {
  function openWindow(opts: {
    title: string;
    component: string;
    icon?: string;
    props?: Record<string, unknown>;
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  }) {
    const existing = windows.value.find(
      (w) =>
        w.component === opts.component && JSON.stringify(w.props) === JSON.stringify(opts.props)
    );
    if (existing) {
      focusWindow(existing.id);
      if (existing.minimized) {
        existing.minimized = false;
      }
      return existing.id;
    }

    const offset = (windowCounter % 10) * 30;
    windowCounter++;

    const w: WindowState = {
      id: `window-${windowCounter}`,
      title: opts.title,
      component: opts.component,
      x: 60 + offset,
      y: 40 + offset,
      width: opts.width ?? 600,
      height: opts.height ?? 400,
      minimized: false,
      maximized: false,
      zIndex: nextZIndex++,
      props: opts.props ?? undefined,
      icon: opts.icon ?? undefined,
      minWidth: opts.minWidth ?? undefined,
      minHeight: opts.minHeight ?? undefined,
      userResized: false,
    };

    windows.value.push(w);
    return w.id;
  }

  function closeWindow(id: string) {
    const idx = windows.value.findIndex((w) => w.id === id);
    if (idx !== -1) {
      windows.value.splice(idx, 1);
    }
  }

  function minimizeWindow(id: string) {
    const w = windows.value.find((w) => w.id === id);
    if (w) {
      w.minimized = !w.minimized;
      if (w.minimized) {
        const topNonMinimized = windows.value
          .filter((x) => !x.minimized)
          .sort((a, b) => b.zIndex - a.zIndex);
        if (topNonMinimized.length > 0) {
          focusWindow(topNonMinimized[0].id);
        }
      } else {
        focusWindow(id);
      }
    }
  }

  function maximizeWindow(id: string) {
    const w = windows.value.find((w) => w.id === id);
    if (w) {
      w.maximized = !w.maximized;
      if (w.maximized) {
        w._prevX = w.x;
        w._prevY = w.y;
        w._prevWidth = w.width;
        w._prevHeight = w.height;
        w.x = 0;
        w.y = 0;
        w.width = window.innerWidth;
        w.height = window.innerHeight - 40;
      } else if (w._prevWidth != null) {
        w.x = w._prevX!;
        w.y = w._prevY!;
        w.width = w._prevWidth!;
        w.height = w._prevHeight!;
      }
      focusWindow(id);
    }
  }

  function focusWindow(id: string) {
    const w = windows.value.find((w) => w.id === id);
    if (w) {
      w.zIndex = nextZIndex++;
      w.minimized = false;
    }
  }

  function moveWindow(id: string, x: number, y: number) {
    const w = windows.value.find((w) => w.id === id);
    if (w && !w.maximized) {
      w.x = x;
      w.y = y;
    }
  }

  function resizeWindow(id: string, width: number, height: number) {
    const w = windows.value.find((w) => w.id === id);
    if (w && !w.maximized) {
      w.width = Math.max(w.minWidth ?? 300, width);
      w.height = Math.max(w.minHeight ?? 200, height);
      w.userResized = true;
    }
  }

  function fitContent(id: string, width: number, height: number) {
    const w = windows.value.find((w) => w.id === id);
    if (w && !w.maximized && !w.userResized) {
      w.width = Math.max(w.minWidth ?? 300, width);
      w.height = Math.max(w.minHeight ?? 200, height);
    }
  }

  function closeAll() {
    windows.value.splice(0);
  }

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    fitContent,
    closeAll,
  };
}
