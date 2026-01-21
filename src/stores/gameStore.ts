import { atom } from 'nanostores';

export const isGameMode = atom(false);
export const requestedMode = atom<string | null>(null);
export const isContentVisible = atom(true);
export const currentPath = atom('/');

export function setGameMode(active: boolean) {
  isGameMode.set(active);
  if (active) {
    document.body.classList.add('game-mode-active');
  } else {
    document.body.classList.remove('game-mode-active');
    requestedMode.set(null);
  }
}

export function requestMode(mode: string) {
  requestedMode.set(mode);
  setGameMode(true); // This also adds the class
}

export function toggleContent() {
  const current = isContentVisible.get();
  isContentVisible.set(!current);
  if (!current) {
    document.body.classList.remove('content-hidden');
  } else {
    document.body.classList.add('content-hidden');
  }
}

export function setPath(path: string) {
  currentPath.set(path);
}
