import { System } from '../types';
import { ECSWorld, ECSEntity } from '../types';
import { GameModeType } from '../../game/types';

export interface GameModeComponent {
  type: GameModeType;
  init: (world: ECSWorld, entity: ECSEntity) => void;
  update: (world: ECSWorld, entity: ECSEntity, dt: number, time: number) => void;
  cleanup: (world: ECSWorld, entity: ECSEntity) => void;
  onKeyDown?: (world: ECSWorld, entity: ECSEntity, event: KeyboardEvent) => void;
  onKeyUp?: (world: ECSWorld, entity: ECSEntity, event: KeyboardEvent) => void;
  onClick?: (world: ECSWorld, entity: ECSEntity, event: MouseEvent) => void;
  onMouseMove?: (world: ECSWorld, entity: ECSEntity, event: MouseEvent) => void;
}

export class GameModeSystem extends System {
  private currentModeEntity: ECSEntity | null = null;
  private modeComponents: Map<GameModeType, GameModeComponent> = new Map();

  registerMode(type: GameModeType, component: GameModeComponent) {
    this.modeComponents.set(type, component);
  }

  update(world: ECSWorld, dt: number, time: number): void {
    const gameModeState = world.resources.gameMode;

    if (gameModeState.currentMode && gameModeState.currentMode !== gameModeState.previousMode) {
      this.switchMode(world, gameModeState.currentMode);
      gameModeState.previousMode = gameModeState.currentMode;
    }

    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component) {
          component.update(world, this.currentModeEntity, dt, time);
        }
      }
    }
  }

  private switchMode(world: ECSWorld, newMode: GameModeType) {
    if (this.currentModeEntity) {
      const oldModeComponent = this.currentModeEntity.gameModeEntity;
      if (oldModeComponent) {
        const component = this.modeComponents.get(oldModeComponent.type);
        if (component) {
          component.cleanup(world, this.currentModeEntity);
        }
      }
      world.remove(this.currentModeEntity);
    }

    const component = this.modeComponents.get(newMode);
    if (!component) {
      console.warn(`Game mode "${newMode}" not registered`);
      return;
    }

    const entity = world.add({ gameModeEntity: { type: newMode, entity: null as any } } as any);
    entity.gameModeEntity!.entity = entity;
    this.currentModeEntity = entity;

    component.init(world, entity);
  }

  onKeyDown(world: ECSWorld, event: KeyboardEvent) {
    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component?.onKeyDown) {
          component.onKeyDown(world, this.currentModeEntity, event);
        }
      }
    }
  }

  onKeyUp(world: ECSWorld, event: KeyboardEvent) {
    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component?.onKeyUp) {
          component.onKeyUp(world, this.currentModeEntity, event);
        }
      }
    }
  }

  onClick(world: ECSWorld, event: MouseEvent) {
    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component?.onClick) {
          component.onClick(world, this.currentModeEntity, event);
        }
      }
    }
  }

  onMouseMove(world: ECSWorld, event: MouseEvent) {
    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component?.onMouseMove) {
          component.onMouseMove(world, this.currentModeEntity, event);
        }
      }
    }
  }

  setMode(world: ECSWorld, mode: GameModeType) {
    world.resources.gameMode.currentMode = mode;
  }

  clearMode(world: ECSWorld) {
    if (this.currentModeEntity) {
      const modeComponent = this.currentModeEntity.gameModeEntity;
      if (modeComponent) {
        const component = this.modeComponents.get(modeComponent.type);
        if (component) {
          component.cleanup(world, this.currentModeEntity);
        }
      }
      world.remove(this.currentModeEntity);
      this.currentModeEntity = null;
    }
    world.resources.gameMode.currentMode = null;
    world.resources.gameMode.previousMode = null;
  }
}
