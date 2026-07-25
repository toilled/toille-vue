import type { Ref } from 'vue';
import type { GameWorldContext } from './ecs/components';
import type { Group } from 'three';

export interface Controls {
  left: boolean;
  right: boolean;
  forward: boolean;
  backward: boolean;
}

export interface LookControls {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export interface GameContext
  extends Omit<GameWorldContext, 'input' | 'activeMode' | 'playerEid' | 'redCarEid'> {
  cars: Group[];
  controls: Ref<Controls>;
  lookControls: Ref<LookControls>;
}

export interface StoryObjective {
  id: string;
  type: 'goto' | 'collect' | 'interact';
  label: string;
  x: number;
  z: number;
  completed: boolean;
  description: string;
}

export interface StoryMission {
  id: string;
  title: string;
  brief: string;
  dialogue: string[];
  objectives: StoryObjective[];
  completeMessage?: string;
}

export interface StoryState {
  active: boolean;
  currentMissionIndex: number;
  currentDialogueIndex: number;
  showingDialogue: boolean;
  showingBriefing: boolean;
  missionComplete: boolean;
  missions: StoryMission[];
}

export interface MinimapData {
  playerX: number;
  playerZ: number;
  playerRotation: number;
  objectives: { x: number; z: number; completed: boolean; label: string; type: string }[];
}

export interface GameMode {
  init(context: GameContext): void;
  update(dt: number, time: number): void;
  cleanup(): void;

  onKeyDown(event: KeyboardEvent): void;
  onKeyUp(event: KeyboardEvent): void;
  onClick(event: MouseEvent): void;
  onMouseMove(event: MouseEvent): void;
}
