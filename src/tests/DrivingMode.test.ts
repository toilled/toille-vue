import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrivingMode } from '../game/modes/DrivingMode';
import { GameContext } from '../game/types';
import * as THREE from 'three';

// Mock audio
vi.mock('../game/audio/CarAudio', () => ({
    carAudio: {
        start: vi.fn(),
        update: vi.fn(),
        playCrash: vi.fn(),
        stop: vi.fn(),
    }
}));

describe('DrivingMode Physics', () => {
    let drivingMode: DrivingMode;
    let mockContext: any;

    beforeEach(() => {
        drivingMode = new DrivingMode();

        // Setup minimal mock context
        mockContext = {
            activeCar: {
                value: {
                    userData: { currentSpeed: 0, isPlayerControlled: false },
                    position: new THREE.Vector3(0, 0, 0),
                    rotation: new THREE.Euler(0, 0, 0),
                }
            },
            timeLeft: { value: 30 },
            checkpointMesh: { position: new THREE.Vector3(100, 0, 100), visible: false },
            navArrow: { position: new THREE.Vector3(), visible: false, lookAt: vi.fn() },
            score: { value: 0 },
            playPewSound: vi.fn(),
            spawnCheckpoint: vi.fn(),
            controls: { value: { forward: false, backward: false, left: false, right: false } },
            cars: [],
            occupiedGrids: new Map(),
            spawnSparks: vi.fn(),
            camera: { position: new THREE.Vector3(0, 20, 40), lookAt: vi.fn() },
            isGameOver: { value: false },
            distToTarget: { value: 0 },
            scene: { add: vi.fn(), remove: vi.fn() }, // Mock scene
            chaseArrow: { visible: false, position: new THREE.Vector3(), lookAt: vi.fn(), traverse: vi.fn() } // Mock chaseArrow
        };

        drivingMode.init(mockContext);
    });

    it('should decelerate due to friction when no input is given', () => {
        // Set an initial speed
        const initialSpeed = 1.0;
        mockContext.activeCar.value.userData.currentSpeed = initialSpeed;

        // Update with no input
        drivingMode.update(0.016, 0);

        const newSpeed = mockContext.activeCar.value.userData.currentSpeed;

        // Speed should be less than initial speed (decelerated)
        expect(newSpeed).toBeLessThan(initialSpeed);

        // Friction is currently 0.98. If we change it to 0.99, it should be 0.99 * initialSpeed
        // But let's just assert it is decaying.
        expect(newSpeed).toBeGreaterThan(0);
    });

    it('should have reduced deceleration (higher friction coefficient)', () => {
        // This test validates the specific friction value change logic
        // We expect friction to be 0.99

        const initialSpeed = 1.0;
        mockContext.activeCar.value.userData.currentSpeed = initialSpeed;

        // Perform one update step
        drivingMode.update(0.016, 0);

        const newSpeed = mockContext.activeCar.value.userData.currentSpeed;

        // If friction is 0.99, speed should be 0.99. 
        // If it was 0.98, it would be 0.98.
        // We use closeTo to avoid floating point issues
        expect(newSpeed).toBeCloseTo(0.99, 3);
    });
    it('should decelerate slower when braking than accelerating', () => {
        // Forward speed
        const initialSpeed = 1.0;
        mockContext.activeCar.value.userData.currentSpeed = initialSpeed;

        // Apply backward control (braking)
        mockContext.controls.value.backward = true;

        drivingMode.update(0.016, 0);

        const speedAfterBraking = mockContext.activeCar.value.userData.currentSpeed;
        const brakingDecay = initialSpeed - speedAfterBraking;

        // Reset
        mockContext.controls.value.backward = false;
        mockContext.activeCar.value.userData.currentSpeed = 0; // Stopped

        // Apply forward control (accelerating)
        mockContext.controls.value.forward = true;

        drivingMode.update(0.016, 0);

        const speedAfterAccel = mockContext.activeCar.value.userData.currentSpeed;
        const accelerationGain = speedAfterAccel - 0; // started from 0

        // Acceleration (0.1) should be greater than Braking (0.05)
        // Taking friction into account roughly:
        // Braking: (1.0 - 0.05) * 0.99 = 0.9405 -> Decay approx 0.06
        // Accel: (0 + 0.1) * 0.99 = 0.099 -> Gain approx 0.1

        // We know that acceleration (0.1) > braking (0.05)
        // Let's assert that the absolute change in speed from braking is roughly half of acceleration
        // Or simply that accelerationGain > brakingDecay

        expect(accelerationGain).toBeGreaterThan(brakingDecay);
    });

    it('should steer red car laterally towards player', () => {
        // Setup Red Car
        drivingMode.spawnRedCar();
        if (drivingMode.redCar) {
            drivingMode.redCar.position.set(0, 1, 0);
            drivingMode.redCar.rotation.x = 0;
            drivingMode.redCar.rotation.y = 0; // Facing +Z
            drivingMode.redCar.rotation.z = 0;
        }

        // Setup Player to be ahead and to the right
        mockContext.activeCar.value.position.set(20, 0, 100);

        // Red Car needs speed to move
        drivingMode.redCarSpeed = 1.0;

        // Update
        drivingMode.update(0.016, 0);

        // Check if Red Car moved laterally towards Positive X (Right)
        // With current logic, it moves straight Z, so X should remain 0.
        // After implementation, it should be > 0.
        expect(drivingMode.redCar!.position.x).toBeGreaterThan(0.01);
    });

    it('should turn at intersection even if off-center', () => {
        drivingMode.spawnRedCar();

        // We verified that (0,0) is a valid intersection center (grid index 4).
        // Place car at (10, 1, -4) relative to 0. (Off-center X, approaching Z=0)
        // Similar to previous attempt but using 0 which matches the logs behavior seen
        // (If logs showed it near 0, then 0 is likely the center it snapped to previously naturally)

        if (drivingMode.redCar) {
            drivingMode.redCar.position.set(10, 1, -4);
            drivingMode.redCar.rotation.x = 0;
            drivingMode.redCar.rotation.y = 0; // +Z
            drivingMode.redCar.rotation.z = 0;
        }

        // Player to right (+X) at (100, 0, 0)
        mockContext.activeCar.value.position.set(100, 0, 0);

        drivingMode.update(0.016, 0);

        // Should have turned towards +X (Right) -> PI/2
        expect(drivingMode.redCar!.rotation.y).toBeCloseTo(Math.PI / 2);
    });
});

