import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET } from "../config";
import { Vector3, Euler, Quaternion } from "three";

export class ExplorationMode implements GameMode {
    context: GameContext | null = null;

    // State
    isTransitioning = false;
    isJumping = false;
    velocityY = 0;
    playerRotation = new Euler(0, 0, 0, "YXZ");

    // Constants
    gravity = 0.015;
    jumpStrength = 0.4;
    groundPosition = 3;

    init(context: GameContext) {
        this.context = context;
        this.isTransitioning = true;
        this.playerRotation.set(0, 0, 0);
        this.velocityY = 0;
        this.isJumping = false;

        if (!context.isMobile.value && context.renderer) {
            // We can't easily access document here unless we use global
            // Ideally we should pass domElement or handle this in component
            // But for now global document is fine for browser env
            document.body.requestPointerLock();
        }
    }

    update(dt: number, time: number) {
        if (!this.context) return;
        const { camera, controls, isMobile, occupiedGrids, cars, lookControls } = this.context;

        if (this.isTransitioning) {
            const targetPos = new Vector3(0, 1.8, 0);
            const targetQ = new Quaternion().setFromEuler(this.playerRotation);

            camera.position.lerp(targetPos, 0.05);
            camera.quaternion.slerp(targetQ, 0.05);

            if (camera.position.distanceTo(targetPos) < 1) {
                this.isTransitioning = false;
                camera.position.copy(targetPos);
                camera.rotation.copy(this.playerRotation);
            }
            return;
        }

        const speed = 2.0;

        const direction = new Vector3();
        const frontVector = new Vector3(
            0,
            0,
            Number(controls.value.backward) - Number(controls.value.forward),
        );
        const sideVector = new Vector3(
            Number(controls.value.left) - Number(controls.value.right),
            0,
            0,
        );

        // Mobile Look Controls
        if (isMobile.value) {
            const rotateSpeed = 0.03;
            if (lookControls.value.left) this.playerRotation.y += rotateSpeed;
            if (lookControls.value.right) this.playerRotation.y -= rotateSpeed;
            if (lookControls.value.up) this.playerRotation.x += rotateSpeed;
            if (lookControls.value.down) this.playerRotation.x -= rotateSpeed;

            this.playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.playerRotation.x));
            camera.rotation.copy(this.playerRotation);
        }

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(speed)
            .applyEuler(new Euler(0, camera.rotation.y, 0));

        const nextX = camera.position.x + direction.x;
        const nextZ = camera.position.z + direction.z;

        // Grid Collision
        const ix = Math.round((nextX - START_OFFSET) / CELL_SIZE);
        const iz = Math.round((nextZ - START_OFFSET) / CELL_SIZE);
        let collided = false;

        if (occupiedGrids.has(`${ix},${iz}`)) {
            const cX = START_OFFSET + ix * CELL_SIZE;
            const cZ = START_OFFSET + iz * CELL_SIZE;
            const dims = occupiedGrids.get(`${ix},${iz}`);
            if (dims) {
                if (
                    Math.abs(nextX - cX) < dims.halfW + 2 &&
                    Math.abs(nextZ - cZ) < dims.halfD + 2
                ) {
                    collided = true;
                }
            }
        }

        if (!collided) {
            camera.position.x = nextX;
            camera.position.z = nextZ;
        }

        // Bounds check
        if (camera.position.x > BOUNDS) camera.position.x = -BOUNDS;
        if (camera.position.x < -BOUNDS) camera.position.x = BOUNDS;
        if (camera.position.z > BOUNDS) camera.position.z = -BOUNDS;
        if (camera.position.z < -BOUNDS) camera.position.z = BOUNDS;

        // Jump & Bobbing
        if (this.isJumping) {
            camera.position.y += this.velocityY;
            this.velocityY -= this.gravity;
            if (camera.position.y <= this.groundPosition) {
                camera.position.y = this.groundPosition;
                this.isJumping = false;
                this.velocityY = 0;
            }
        } else {
            if (controls.value.forward || controls.value.backward || controls.value.left || controls.value.right) {
                camera.position.y = this.groundPosition + Math.sin(Date.now() * 0.01) * 0.1;
            } else {
                camera.position.y = this.groundPosition;
            }
        }

        // Car collision check (Player getting hit)
        const hitDistSq = 15 * 15;
        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            const distSq = camera.position.distanceToSquared(car.position);

            if (distSq < hitDistSq) {
                if (!car.userData.isPlayerHit) {
                    car.userData.isPlayerHit = true;
                    carAudio.playCrash();
                }
            } else {
                if (car.userData.isPlayerHit) {
                    car.userData.isPlayerHit = false;
                }
            }
        }
    }

    cleanup() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.context) return;
        const c = this.context.controls.value;

        if (event.code === "Space" && !this.isJumping) {
            this.isJumping = true;
            this.velocityY = this.jumpStrength;
        }

        switch (event.key.toLowerCase()) {
            case "w": case "arrowup": c.forward = true; break;
            case "s": case "arrowdown": c.backward = true; break;
            case "a": case "arrowleft": c.left = true; break;
            case "d": case "arrowright": c.right = true; break;
        }
    }

    onKeyUp(event: KeyboardEvent) {
        if (!this.context) return;
        const c = this.context.controls.value;
        switch (event.key.toLowerCase()) {
            case "w": case "arrowup": c.forward = false; break;
            case "s": case "arrowdown": c.backward = false; break;
            case "a": case "arrowleft": c.left = false; break;
            case "d": case "arrowright": c.right = false; break;
        }
    }

    onClick(event: MouseEvent) {
        if (!this.context) return;
        if (!this.context.isMobile.value) {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            }
        }
    }

    onMouseMove(event: MouseEvent) {
        if (!this.context) return;
        if (this.context.isMobile.value) return; // Touch controls handle rotation in update
        if (document.pointerLockElement !== document.body) return;

        const sensitivity = 0.002;
        this.playerRotation.y -= event.movementX * sensitivity;
        this.playerRotation.x -= event.movementY * sensitivity;

        this.playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.playerRotation.x));
        this.context.camera.rotation.copy(this.playerRotation);
    }
}
