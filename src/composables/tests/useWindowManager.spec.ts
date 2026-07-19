import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowManager, type WindowState } from '../useWindowManager';

describe('useWindowManager', () => {
  let wm: ReturnType<typeof useWindowManager>;

  beforeEach(() => {
    wm = useWindowManager();
    wm.closeAll();
  });

  it('opens a window with default dimensions', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    expect(id).toBeDefined();
    expect(wm.windows.value.length).toBe(1);
    expect(wm.windows.value[0].title).toBe('Test');
    expect(wm.windows.value[0].component).toBe('TestComp');
    expect(wm.windows.value[0].width).toBe(600);
    expect(wm.windows.value[0].height).toBe(400);
  });

  it('opens a window with custom dimensions', () => {
    wm.openWindow({
      title: 'Custom',
      component: 'Comp',
      width: 800,
      height: 600,
    });
    expect(wm.windows.value[0].width).toBe(800);
    expect(wm.windows.value[0].height).toBe(600);
  });

  it('closes a window', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    wm.closeWindow(id);
    expect(wm.windows.value.length).toBe(0);
  });

  it('minimizes a window', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    wm.minimizeWindow(id);
    expect(wm.windows.value[0].minimized).toBe(true);
  });

  it('maximizes a window and restores', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    const originalX = wm.windows.value[0].x;
    wm.maximizeWindow(id);
    expect(wm.windows.value[0].maximized).toBe(true);
    expect(wm.windows.value[0].x).toBe(0);
    wm.maximizeWindow(id);
    expect(wm.windows.value[0].maximized).toBe(false);
    expect(wm.windows.value[0].x).toBe(originalX);
  });

  it('focuses a window', () => {
    const id1 = wm.openWindow({ title: 'First', component: 'A' });
    const id2 = wm.openWindow({ title: 'Second', component: 'B' });
    wm.focusWindow(id1);
    expect(wm.windows.value.find((w: WindowState) => w.id === id1)!.zIndex).toBeGreaterThan(
      wm.windows.value.find((w: WindowState) => w.id === id2)!.zIndex
    );
  });

  it('moves a window', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    wm.moveWindow(id, 100, 200);
    expect(wm.windows.value[0].x).toBe(100);
    expect(wm.windows.value[0].y).toBe(200);
  });

  it('does not move a maximized window', () => {
    const id = wm.openWindow({ title: 'Test', component: 'TestComp' });
    wm.maximizeWindow(id);
    wm.moveWindow(id, 100, 200);
    expect(wm.windows.value[0].x).toBe(0);
  });

  it('respects minimum dimensions', () => {
    const id = wm.openWindow({
      title: 'Test',
      component: 'TestComp',
      minWidth: 400,
      minHeight: 300,
    });
    wm.resizeWindow(id, 100, 50);
    expect(wm.windows.value[0].width).toBe(400);
    expect(wm.windows.value[0].height).toBe(300);
  });

  it('closeAll removes all windows', () => {
    wm.openWindow({ title: 'A', component: 'A' });
    wm.openWindow({ title: 'B', component: 'B' });
    wm.closeAll();
    expect(wm.windows.value.length).toBe(0);
  });

  it('does not open duplicate windows with same component and props', () => {
    wm.openWindow({ title: 'Test', component: 'TestComp', props: { id: 1 } });
    wm.openWindow({ title: 'Test', component: 'TestComp', props: { id: 1 } });
    expect(wm.windows.value.length).toBe(1);
  });
});
