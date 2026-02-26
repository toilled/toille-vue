import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET } from "../config";
import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh, Quaternion } from "three";
import { getHeight, getNormal } from "../../utils/HeightMap";

export class SnakeMode implements GameMode {
    context: GameContext | null = null;
    trailers: Mesh[] = [];
    pathHistory: { pos: Vector3, rot: Quaternion }[] = [];
    trailerDistance = 12; // Distance between trailers
    lastRecordPos: Vector3 = new Vector3();

    init(context: GameContext) {
        this.context = context;

        // Reset state
        this.trailers = [];
        this.pathHistory = [];

        // Setup Car
        if (!context.activeCar.value && context.cars.length > 0) {
             const car = context.cars.find(c => c.userData.speed !== undefined);
             if (car) {
                 context.activeCar.value = car;
             }
        }

        if (context.activeCar.value) {
            const car = context.activeCar.value;
            car.userData.isPlayerControlled = true;
            car.userData.currentSpeed = 0;
            if (car.userData.heading === undefined) {
                car.userData.heading = car.rotation.y;
            }

            // Reset Score
            context.drivingScore.value = 0;
            context.timeLeft.value = 999;
            context.isGameOver.value = false;

            // Spawn first package
            context.spawnCheckpoint();

            // Audio
            carAudio.start();

            // Init history
            this.lastRecordPos.copy(car.position);
            this.pathHistory.push({
                pos: car.position.clone(),
                rot: new Quaternion().setFromEuler(car.rotation)
            });
        }
    }

    update(dt: number, time: number) {
        if (!this.context || !this.context.activeCar.value) return;

        const car = this.context.activeCar.value;
        const { controls, isGameOver, checkpointMesh, spawnCheckpoint, drivingScore, playPewSound, spawnSparks, camera, occupiedGrids, distToTarget, navArrow } = this.context;

        if (isGameOver.value) {
            car.userData.currentSpeed *= 0.95;
            carAudio.update(car.userData.currentSpeed);
            return;
        }

        // --- Car Physics ---
        let speed = car.userData.currentSpeed || 0;
        const maxSpeed = 1.8;
        const acceleration = 0.08;
        const braking = 0.05;
        const friction = 0.99;

        if (controls.value.forward) speed += acceleration;
        else if (controls.value.backward) speed -= braking;

        speed *= friction;
        if (speed > maxSpeed) speed = maxSpeed;
        if (speed < -maxSpeed / 2) speed = -maxSpeed / 2;

        car.userData.currentSpeed = speed;
        carAudio.update(speed);

        if (Math.abs(speed) > 0.01) {
             const dir = speed > 0 ? 1 : -1;
             const turnSpeed = 0.04 * dir;
             if (controls.value.left) car.userData.heading += turnSpeed;
             if (controls.value.right) car.userData.heading -= turnSpeed;
        }

        const heading = car.userData.heading;

        // Move Car
        car.position.x += Math.sin(heading) * speed;
        car.position.z += Math.cos(heading) * speed;

        // Update Y
        car.position.y = getHeight(car.position.x, car.position.z) + 1;

        // Orientation
        const normal = getNormal(car.position.x, car.position.z);
        car.up.set(normal.x, normal.y, normal.z);
        const lookDist = 5;
        const tx = car.position.x + Math.sin(heading) * lookDist;
        const tz = car.position.z + Math.cos(heading) * lookDist;
        const ty = getHeight(tx, tz) + 1;
        car.lookAt(tx, ty, tz);

        // Bounds
        if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
        if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
        if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
        if (car.position.z < -BOUNDS) car.position.z = BOUNDS;

        // --- Path Recording ---
        // Only record if moved enough (0.5 units)
        const recordDist = 0.5;
        if (car.position.distanceTo(this.lastRecordPos) > recordDist) {
            this.pathHistory.unshift({
                pos: car.position.clone(),
                rot: car.quaternion.clone()
            });
            this.lastRecordPos.copy(car.position);

            // Limit history size
            // We need trailerDistance * numTrailers * (1 / recordDist)
            // trailerDistance = 12, recordDist = 0.5 => 24 steps per trailer
            const stepsPerTrailer = this.trailerDistance / recordDist;
            const maxHistory = (this.trailers.length + 5) * stepsPerTrailer;
            if (this.pathHistory.length > maxHistory) {
                this.pathHistory.length = maxHistory;
            }
        }

        // --- Trailer Updates ---
        const stepsPerTrailer = this.trailerDistance / recordDist;

        this.trailers.forEach((trailer, i) => {
            const index = Math.floor((i + 1) * stepsPerTrailer);
            if (index < this.pathHistory.length) {
                const entry = this.pathHistory[index];
                trailer.position.copy(entry.pos);
                trailer.quaternion.copy(entry.rot);
                trailer.visible = true;
            } else {
                 if (this.pathHistory.length > 0) {
                     const last = this.pathHistory[this.pathHistory.length - 1];
                     trailer.position.copy(last.pos);
                     trailer.quaternion.copy(last.rot);
                     trailer.visible = true;
                 } else {
                     trailer.visible = false;
                 }
            }
        });

        // --- Collision Logic ---

        // 1. Package Collision
        const distToPkg = car.position.distanceTo(checkpointMesh.position);
        distToTarget.value = distToPkg;

        if (distToPkg < 15) { // Hit package
            playPewSound();
            spawnCheckpoint();
            this.addTrailer();
            drivingScore.value += 100;
        }

        // 2. Self Collision (Game Over)
        // Check if car hits any trailer
        // Ignore the first few trailers (e.g., first 2) to prevent immediate collision on tight turns
        for (let i = 4; i < this.trailers.length; i++) {
             if (car.position.distanceTo(this.trailers[i].position) < 6) {
                 isGameOver.value = true;
                 carAudio.playCrash();
                 spawnSparks(car.position);
             }
        }

        // 3. Building Collision
         const ix = Math.round((car.position.x - START_OFFSET) / CELL_SIZE);
         const iz = Math.round((car.position.z - START_OFFSET) / CELL_SIZE);

         if (occupiedGrids.has(`${ix},${iz}`)) {
            const cX = START_OFFSET + ix * CELL_SIZE;
            const cZ = START_OFFSET + iz * CELL_SIZE;
            const dims = occupiedGrids.get(`${ix},${iz}`);

            if (dims) {
                const margin = 5;
                if (dims.isRound) {
                     const radius = Math.max(dims.halfW, dims.halfD);
                     const dx = car.position.x - cX;
                     const dz = car.position.z - cZ;
                     const dist = Math.sqrt(dx * dx + dz * dz);
                     if (dist < radius + margin) {
                         // Hit building
                         car.userData.currentSpeed *= -0.5;
                         carAudio.playCrash();
                         const overlap = (radius + margin) - dist + 2;
                         const nX = dx / dist;
                         const nZ = dz / dist;
                         car.position.x += nX * overlap;
                         car.position.z += nZ * overlap;
                         spawnSparks(car.position);
                     }
                } else {
                    if (
                        Math.abs(car.position.x - cX) < dims.halfW + margin &&
                        Math.abs(car.position.z - cZ) < dims.halfD + margin
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
            }
        }

        // --- Camera Follow ---
        const angle = heading;
        const camDist = 40 + (this.trailers.length * 1.5);
        const clampedCamDist = Math.min(camDist, 180);

        const targetX = car.position.x - Math.sin(angle) * clampedCamDist;
        const targetZ = car.position.z - Math.cos(angle) * clampedCamDist;
        const targetY = car.position.y + 25 + (this.trailers.length * 0.5);

        camera.position.x += (targetX - camera.position.x) * 0.1;
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        camera.position.y += (targetY - camera.position.y) * 0.1;
        camera.lookAt(car.position.x, car.position.y, car.position.z);

        // Update nav arrow
        if (navArrow) {
            navArrow.visible = true;
            navArrow.position.copy(car.position);
            navArrow.position.y += 15;
            navArrow.lookAt(checkpointMesh.position.x, navArrow.position.y, checkpointMesh.position.z);
        }
    }

    addTrailer() {
        if (!this.context) return;

        const geo = new BoxGeometry(5, 5, 8);
        const mat = new MeshStandardMaterial({ color: 0x00ff00, roughness: 0.2, metalness: 0.8 });
        const trailer = new Mesh(geo, mat);
        trailer.castShadow = true;

        this.context.scene.add(trailer);
        this.trailers.push(trailer);
    }

    cleanup() {
        if (this.context) {
            this.trailers.forEach(t => {
                if (t.geometry) t.geometry.dispose();
                if (t.material) (t.material as any).dispose();
                this.context!.scene.remove(t);
            });
            this.trailers = [];
            this.pathHistory = [];

            if (this.context.activeCar.value) {
                this.context.activeCar.value.userData.isPlayerControlled = false;
                this.context.activeCar.value = null;
            }

            if (this.context.navArrow) this.context.navArrow.visible = false;
            if (this.context.checkpointMesh) this.context.checkpointMesh.visible = false;

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

    onClick(event: MouseEvent) {}
    onMouseMove(event: MouseEvent) {}
}
