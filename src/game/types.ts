import { Scene, PerspectiveCamera, WebGLRenderer, Group, Points, Vector3 } from "three";
import type { Ref } from "vue";

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

export interface GameContext {
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;

    // Game Objects
    cars: Group[];
    drones: Points | undefined;
    occupiedGrids: Map<string, { halfW: number; halfD: number }>;

    // State
    score: Ref<number>; // Kept for backward compatibility or computed
    droneScore: Ref<number>;
    drivingScore: Ref<number>;
    timeLeft: Ref<number>;
    activeCar: Ref<Group | null>;
    isMobile: Ref<boolean>;
    isGameOver: Ref<boolean>;
    distToTarget: Ref<number>;

    // Inputs
    controls: Ref<Controls>;
    lookControls: Ref<LookControls>;

    // Helpers
    spawnSparks: (position: Vector3) => void;
    playPewSound: () => void;
    spawnCheckpoint: () => void;

    // Shared Objects
    checkpointMesh: any; // Mesh but typing might differ
    navArrow: Group;
    chaseArrow: Group;
}

export interface GameMode {
    init(context: GameContext): void;
    update(dt: number, time: number): void;
    cleanup(): void;

    // Input Events
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    onClick(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
}
