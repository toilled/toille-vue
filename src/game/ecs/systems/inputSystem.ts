import type { GameWorld } from '../world';

export function inputSystem(_world: GameWorld) {
  // Input is set externally via window event listeners that write to world.ctx.input.
  // Mode-specific input handling (jump, story interaction) is done in their respective systems.
}
