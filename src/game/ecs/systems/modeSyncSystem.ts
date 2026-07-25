import type { GameWorld } from '../world';

export function modeSyncSystem(_world: GameWorld) {
  // Mode tags are managed by modeManager.ts.
  // This system syncs the active mode to Vue refs if needed.
  // Currently the mode switching in modeManager.ts handles this directly.
}
