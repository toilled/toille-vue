import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET } from "../config";
import { Vector3, BoxGeometry, MeshStandardMaterial, Mesh } from "three";
import { getHeight, getNormal } from "../../utils/HeightMap";

export class SnakeMode implements GameMode {
    context: GameContext | null = null;
    trailers: Mesh[] = [];
    trailerDistance = 12; // Distance between trailers

    init(context: GameContext) {
        this.context = context;

        // Reset state
        this.trailers = [];

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

        // --- Trailer Constraint Physics ---
        for (let i = 0; i < this.trailers.length; i++) {
            const trailer = this.trailers[i];
            const leader = i === 0 ? car : this.trailers[i - 1];

            const p1 = leader.position;
            const p2 = trailer.position;

            // Calculate vector from trailer to leader
            const diff = new Vector3().subVectors(p1, p2);
            // Ignore Y for length calculation to prevent weird aerial behavior initially,
            // but we need to respect 3D distance if terrain is steep.
            // For stability, 2D distance is often better for ground vehicles.
            const diff2D = new Vector3(diff.x, 0, diff.z);

            let dist = diff2D.length();

            if (dist < 0.001) {
                // Too close, push back arbitrarily (e.g. along -Z of leader)
                const pushDir = new Vector3(0, 0, 1).applyQuaternion(leader.quaternion);
                diff2D.copy(pushDir).multiplyScalar(0.1);
                dist = 0.1;
            }

            // Constraint: Maintain exactly 'trailerDistance'
            // New position for trailer = LeaderPos - (DirectionToLeader * Distance)
            const dir = diff2D.normalize();
            const newPos = p1.clone().sub(dir.multiplyScalar(this.trailerDistance));

            trailer.position.x = newPos.x;
            trailer.position.z = newPos.z;
            trailer.position.y = getHeight(newPos.x, newPos.z) + 2.5; // Lift slightly to avoid z-fighting with ground

            // Orientation: Look at leader
            // But we want to look at the leader's HITCH point?
            // Car center is leader.position.
            // Simple lookAt works well for snake.
            const lookTarget = leader.position.clone();
            lookTarget.y = trailer.position.y; // Look horizontally to avoid tilting up/down too much
            trailer.lookAt(lookTarget);
        }


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
        // Start from index 2 (3rd trailer) to avoid false positives with immediate neighbors
        // Immediate neighbors are constrained to distance 12, so they can't collide (dist < 6).
        for (let i = 2; i < this.trailers.length; i++) {
             if (car.position.distanceTo(this.trailers[i].position) < 8) {
                 isGameOver.value = true;
                 carAudio.playCrash();
                 spawnSparks(car.position);
             }
        }

        // 3. Building Collision (Car Only)
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

        // Position behind last element
        const last = this.trailers.length > 0 ? this.trailers[this.trailers.length - 1] : this.context.activeCar.value;
        if (last) {
            // Place it 'spacing' units behind the leader, assuming leader is facing forward (-Z)
            // Actually, we can just use the reverse of the leader's forward vector.
            // Leader forward is -Z (local). So backward is +Z (local).
            const backward = new Vector3(0, 0, 1).applyQuaternion(last.quaternion);
            trailer.position.copy(last.position).add(backward.multiplyScalar(this.trailerDistance));
            trailer.quaternion.copy(last.quaternion);
        }

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
