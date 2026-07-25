import { pipe } from 'bitecs';
import { inputSystem } from './systems/inputSystem';
import { carPhysicsSystem } from './systems/carPhysicsSystem';
import { cameraFollowSystem } from './systems/cameraFollowSystem';
import { timerSystem } from './systems/timerSystem';
import { redCarChaseSystem } from './systems/redCarChaseSystem';
import {
  explorationMovementSystem,
  explorationJumpSystem,
} from './systems/explorationMovementSystem';
import { storyProximitySystem, updateExplorationMinimap } from './systems/storyProximitySystem';
import { warriorAISystem } from './systems/warriorAISystem';
import { modeSyncSystem } from './systems/modeSyncSystem';

export const drivingPipeline = pipe(
  inputSystem,
  carPhysicsSystem,
  cameraFollowSystem,
  timerSystem,
  redCarChaseSystem
);

export const explorationPipeline = pipe(
  inputSystem,
  explorationMovementSystem,
  explorationJumpSystem,
  storyProximitySystem,
  updateExplorationMinimap
);

export const alwaysPipeline = pipe(warriorAISystem, modeSyncSystem);
