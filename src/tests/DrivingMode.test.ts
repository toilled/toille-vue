import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrivingMode } from '../game/modes/DrivingMode';
import * as THREE from 'three';
import { GameState } from '../game/GameState';
import type { GameContext } from '../game/types';

const { mockCarAudio } = vi.hoisted(() => {
  return {
    mockCarAudio: {
      start: vi.fn(),
      update: vi.fn(),
      playCrash: vi.fn(),
      stop: vi.fn(),
    },
  };
});

vi.mock('../game/audio/CarAudio', () => {
  return {
    carAudio: mockCarAudio,
  };
});

describe('DrivingMode Physics', () => {
  let drivingMode: DrivingMode;
  let context: GameContext;
  let gameState: GameState;

  beforeEach(() => {
    drivingMode = new DrivingMode();

    const car = new THREE.Group();
    car.userData = { currentSpeed: 0, isPlayerControlled: false, heading: 0 };
    car.position.set(0, 0, 0);

    gameState = new GameState(
      new THREE.Scene(),
      new THREE.PerspectiveCamera(),
      new THREE.WebGLRenderer(),
      null,
      [],
      [],
      new Map(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      undefined,
      new THREE.Group(),
      new THREE.Group(),
    );
    gameState.activeCar = car;
    gameState.timeLeft = 30;
    gameState.checkpointMesh = undefined;
    gameState.navArrow = new THREE.Group();
    gameState.chaseArrow = new THREE.Group();
    gameState.isGameOver = false;
    gameState.distToTarget = 0;
    gameState.controls = { left: false, right: false, forward: false, backward: false };
    gameState.cars = [];
    gameState.occupiedGrids = new Map();
    gameState.spawnSparks = vi.fn();
    gameState.playPewSound = vi.fn();
    gameState.spawnCheckpoint = vi.fn();

    context = {
      gameState,
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(),
      renderer: new THREE.WebGLRenderer(),
      composer: null,
      cars: [],
      occupiedGrids: new Map(),
      buildings: [],
      spawnSparks: vi.fn(),
      playPewSound: vi.fn(),
      spawnCheckpoint: vi.fn(),
      reportCheckpoint: vi.fn(),
      checkpointMesh: undefined,
      navArrow: new THREE.Group(),
      chaseArrow: new THREE.Group(),
    };

    drivingMode.init(context);
  });

  it('should decelerate due to friction when no input is given', () => {
    const initialSpeed = 1.0;
    gameState.activeCar!.userData.currentSpeed = initialSpeed;

    drivingMode.update(0.016, 0);

    const newSpeed = gameState.activeCar!.userData.currentSpeed;
    expect(newSpeed).toBeLessThan(initialSpeed);
    expect(newSpeed).toBeGreaterThan(0);
  });

  it('should have friction of 0.99', () => {
    const initialSpeed = 1.0;
    gameState.activeCar!.userData.currentSpeed = initialSpeed;

    drivingMode.update(0.016, 0);

    const newSpeed = gameState.activeCar!.userData.currentSpeed;
    expect(newSpeed).toBeCloseTo(0.99, 3);
  });

  it('should decelerate slower when braking than accelerating', () => {
    const initialSpeed = 1.0;
    gameState.activeCar!.userData.currentSpeed = initialSpeed;
    gameState.controls.backward = true;

    drivingMode.update(0.016, 0);

    const speedAfterBraking = gameState.activeCar!.userData.currentSpeed;
    const brakingDecay = initialSpeed - speedAfterBraking;

    gameState.controls.backward = false;
    gameState.activeCar!.userData.currentSpeed = 0;
    gameState.controls.forward = true;

    drivingMode.update(0.016, 0);

    const speedAfterAccel = gameState.activeCar!.userData.currentSpeed;
    const accelerationGain = speedAfterAccel - 0;

    expect(accelerationGain).toBeGreaterThan(brakingDecay);
  });

  it('should steer red car laterally towards player', () => {
    drivingMode.spawnRedCar();
    if (drivingMode.redCar) {
      drivingMode.redCar.position.set(0, 1, 0);
      drivingMode.redCar.userData.heading = 0;
    }

    gameState.activeCar!.position.set(20, 0, 100);

    drivingMode.redCarSpeed = 1.0;

    drivingMode.update(0.016, 0);

    expect(drivingMode.redCar!.position.x).toBeGreaterThan(0.01);
  });

  it('should turn at intersection even if off-center', () => {
    drivingMode.spawnRedCar();

    if (drivingMode.redCar) {
      drivingMode.redCar.position.set(10, 1, -4);
      drivingMode.redCar.userData.heading = 0;
    }

    gameState.activeCar!.position.set(100, 0, 0);

    drivingMode.update(0.016, 0);

    expect(drivingMode.redCar!.userData.heading).toBeCloseTo(Math.PI / 2);
  });
});