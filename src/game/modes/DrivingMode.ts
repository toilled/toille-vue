import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET } from "../config";
import { Vector3 } from "three";

export class DrivingMode implements GameMode {
    context: GameContext | null = null;

    init(context: GameContext) {
        this.context = context;
        if (!context.activeCar.value && context.cars.length > 0) {
            // Find a car to control (e.g. first one)
            // In original code, it was set by clicking.
            // If we switch to this mode, we assume a car is already selected OR we select one.
            // If triggered by click, activeCar is already set in CyberpunkCity before switching?
            // Or we pass the car to init?
            // Let's assume activeCar is set by the trigger mechanism (click)
        }

        if (context.activeCar.value) {
            context.activeCar.value.userData.isPlayerControlled = true;
            context.activeCar.value.userData.currentSpeed = 0;
            context.timeLeft.value = 30;
            context.isGameOver.value = false;
            context.spawnCheckpoint();
            carAudio.start();
        }
    }

    update(dt: number, time: number) {
        if (!this.context) return;
        const { activeCar, timeLeft, checkpointMesh, navArrow, score, playPewSound, spawnCheckpoint, controls, cars, occupiedGrids, spawnSparks, camera, isGameOver, distToTarget } = this.context;

        if (!activeCar.value) return;

        const car = activeCar.value;

        if (isGameOver.value) {
            // Force stop if game over
            car.userData.currentSpeed *= 0.95; // Decelerate quickly
            if (Math.abs(car.userData.currentSpeed) < 0.01) car.userData.currentSpeed = 0;
            carAudio.update(car.userData.currentSpeed);

            // Still update position based on momentum
            const speed = car.userData.currentSpeed;
            car.position.x += Math.sin(car.rotation.y) * speed;
            car.position.z += Math.cos(car.rotation.y) * speed;

            // Still follow camera
             const angle = car.rotation.y;
            const dist = 40;
            const height = 20;
            const targetX = car.position.x - Math.sin(angle) * dist;
            const targetZ = car.position.z - Math.cos(angle) * dist;
            const targetY = car.position.y + height;

            camera.position.x += (targetX - camera.position.x) * 0.1;
            camera.position.z += (targetZ - camera.position.z) * 0.1;
            camera.position.y += (targetY - camera.position.y) * 0.1;
            camera.lookAt(car.position.x, car.position.y, car.position.z);

            return;
        }

        // Timer
        timeLeft.value -= dt;
        if (timeLeft.value <= 0) {
            timeLeft.value = 0;
            isGameOver.value = true;
            // Hide nav arrow
            navArrow.visible = false;
        } else {
            // Checkpoint Logic
            const cx = car.position.x;
            const cz = car.position.z;
            const tx = checkpointMesh.position.x;
            const tz = checkpointMesh.position.z;

            const distSq = (cx - tx) ** 2 + (cz - tz) ** 2;
            distToTarget.value = Math.sqrt(distSq);

            if (distSq < 20 * 20) {
                score.value += 500;
                timeLeft.value += 15;
                playPewSound();
                spawnCheckpoint();
            }

            // Update Nav Arrow
            navArrow.visible = true;
            navArrow.position.copy(car.position);
            navArrow.position.y += 15;
            navArrow.lookAt(
                checkpointMesh.position.x,
                navArrow.position.y,
                checkpointMesh.position.z
            );
        }

        // Car Physics
        let speed = car.userData.currentSpeed || 0;
        const maxSpeed = 2;
        const acceleration = 0.1;
        const braking = 0.05;
        const friction = 0.99;

        if (controls.value.forward) {
            if (speed < 0) {
                speed += braking;
            } else {
                speed += acceleration;
            }
        } else if (controls.value.backward) {
            if (speed > 0) {
                speed -= braking;
            } else {
                speed -= acceleration;
            }
        }

        speed *= friction;
        if (speed > maxSpeed) speed = maxSpeed;
        if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

        car.userData.currentSpeed = speed;
        carAudio.update(speed);

        if (Math.abs(speed) > 0.1) {
            const dir = speed > 0 ? 1 : -1;
            const turnSpeed = 0.04 / (Math.sqrt(Math.abs(speed)) + 1);
            if (controls.value.left) car.rotation.y += turnSpeed * dir;
            if (controls.value.right) car.rotation.y -= turnSpeed * dir;
        }

        car.position.x += Math.sin(car.rotation.y) * speed;
        car.position.z += Math.cos(car.rotation.y) * speed;

        // Bounds
        if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
        if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
        if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
        if (car.position.z < -BOUNDS) car.position.z = BOUNDS;

        // Building Collision
        const ix = Math.round((car.position.x - START_OFFSET) / CELL_SIZE);
        const iz = Math.round((car.position.z - START_OFFSET) / CELL_SIZE);

        if (occupiedGrids.has(`${ix},${iz}`)) {
            const cX = START_OFFSET + ix * CELL_SIZE;
            const cZ = START_OFFSET + iz * CELL_SIZE;
            const dims = occupiedGrids.get(`${ix},${iz}`);

            if (dims &&
                Math.abs(car.position.x - cX) < dims.halfW + 5 &&
                Math.abs(car.position.z - cZ) < dims.halfD + 5
            ) {
                car.userData.currentSpeed *= -0.5;
                carAudio.playCrash();
                const dx = car.position.x - cX;
                const dz = car.position.z - cZ;
                car.position.x += Math.sign(dx) * 2;
                car.position.z += Math.sign(dz) * 2;
                spawnSparks(car.position);
            }
        }

        // Camera Follow
        const angle = car.rotation.y;
        const dist = 40;
        const height = 20;
        const targetX = car.position.x - Math.sin(angle) * dist;
        const targetZ = car.position.z - Math.cos(angle) * dist;
        const targetY = car.position.y + height;

        camera.position.x += (targetX - camera.position.x) * 0.1;
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        camera.position.y += (targetY - camera.position.y) * 0.1;
        camera.lookAt(car.position.x, car.position.y, car.position.z);
    }

    cleanup() {
        if (this.context) {
            if (this.context.activeCar.value) {
                this.context.activeCar.value.userData.isPlayerControlled = false;
                // Don't null it here immediately if we want to reset it properly or reuse logic
                // But originally `exitGameMode` set it to null.
                this.context.activeCar.value = null;
            }
            this.context.navArrow.visible = false;
            if (this.context.checkpointMesh) this.context.checkpointMesh.visible = false;

            // Reset controls
            const c = this.context.controls.value;
            c.forward = false;
            c.backward = false;
            c.left = false;
            c.right = false;

            carAudio.stop();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.context || this.context.isGameOver.value) return;
        const c = this.context.controls.value;
        switch (event.key.toLowerCase()) {
            case "w": case "arrowup": c.forward = true; break;
            case "s": case "arrowdown": c.backward = true; break;
            case "a": case "arrowleft": c.left = true; break;
            case "d": case "arrowright": c.right = true; break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        if (!this.context || this.context.isGameOver.value) return;
        const c = this.context.controls.value;
        switch (event.key.toLowerCase()) {
            case "w": case "arrowup": c.forward = false; break;
            case "s": case "arrowdown": c.backward = false; break;
            case "a": case "arrowleft": c.left = false; break;
            case "d": case "arrowright": c.right = false; break;
        }
    }

    onClick(event: MouseEvent) { }
    onMouseMove(event: MouseEvent) { }
}
