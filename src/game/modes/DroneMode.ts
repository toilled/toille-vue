import { GameContext, GameMode } from "../types";
import { Raycaster, Vector2, Vector3, BufferAttribute } from "three";
import { BOUNDS, DRONE_COUNT } from "../config";

export class DroneMode implements GameMode {
    context: GameContext | null = null;
    droneVelocities: Float32Array | null = null;
    deadDrones = new Set<number>();
    raycaster = new Raycaster();
    pointer = new Vector2();
    currentLookAt = new Vector3(0, 0, 0); // For camera smoothing

    init(context: GameContext) {
        this.context = context;

        const droneCount = DRONE_COUNT; // Hardcoded in original component
        this.droneVelocities = new Float32Array(droneCount * 3);

        for (let i = 0; i < droneCount; i++) {
            this.droneVelocities[i * 3] = (Math.random() - 0.5) * 8; // vx
            this.droneVelocities[i * 3 + 1] = (Math.random() - 0.5) * 4; // vy
            this.droneVelocities[i * 3 + 2] = (Math.random() - 0.5) * 8; // vz
        }

        // Reset dead drones just in case
        this.deadDrones.clear();
    }

    update(dt: number, time: number) {
        if (!this.context || !this.context.drones || !this.droneVelocities) return;

        const { drones, camera, isMobile } = this.context;
        const positions = drones.geometry.attributes.position.array as Float32Array;

        const count = positions.length / 3;
        const range = BOUNDS;

        for (let i = 0; i < count; i++) {
            if (this.deadDrones.has(i)) continue;

            positions[i * 3] += this.droneVelocities[i * 3];
            positions[i * 3 + 1] += this.droneVelocities[i * 3 + 1];
            positions[i * 3 + 2] += this.droneVelocities[i * 3 + 2];

            // Bounds check (wrap around)
            if (positions[i * 3] > range) positions[i * 3] = -range;
            if (positions[i * 3] < -range) positions[i * 3] = range;

            if (positions[i * 3 + 1] > 1000) positions[i * 3 + 1] = 0;
            if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 1000;

            if (positions[i * 3 + 2] > range) positions[i * 3 + 2] = -range;
            if (positions[i * 3 + 2] < -range) positions[i * 3 + 2] = range;
        }
        drones.geometry.attributes.position.needsUpdate = true;

        // Camera Orbit
        // Standard Orbit around 0, 500, 0
        const orbitRadius = isMobile.value ? 1400 : 800;
        // We use time * 0.1 from original code
        // The passed 'time' is usually seconds? Or raw timestamp?
        // In animate(): const time = now * 0.0005;
        // So 'time' passed to update should be this scaled time.

        camera.position.x = Math.sin(time * 0.1) * orbitRadius;
        camera.position.z = Math.cos(time * 0.1) * orbitRadius;

        const targetY = isMobile.value ? 350 : 250;
        if (Math.abs(camera.position.y - targetY) > 1) {
            camera.position.y += (targetY - camera.position.y) * 0.05;
        }

        const targetLookAt = new Vector3(0, 500, 0);
        this.currentLookAt.lerp(targetLookAt, 0.02);
        camera.lookAt(this.currentLookAt);
    }

    cleanup() {
        if (!this.context || !this.context.drones) return;

        // Restore dead drones (although in original code, they are restored and positions reset to targets)
        // We don't have access to `droneTargetPositions` here easily unless we pass it in Context.
        // Ideally, the standard "Idle" mode (no mode) handles the target/oscillation logic.
        // When we exit DroneMode, we should probably reset positions to something safe or let the next mode handle it.
        // For now, just clear the dead set.
        this.deadDrones.clear();

        // Note: The original code resets positions to `droneTargetPositions` on exit.
        // We might need `droneTargetPositions` in GameContext if we want to perfectly replicate behavior.
    }

    onKeyDown(event: KeyboardEvent) { }
    onKeyUp(event: KeyboardEvent) { }

    onClick(event: MouseEvent) {
        if (!this.context || !this.context.drones) return;
        const { camera, drones, score, playPewSound, spawnSparks } = this.context;

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, camera);
        this.raycaster.params.Points.threshold = 20;

        const intersects = this.raycaster.intersectObject(drones);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const index = intersect.index;

            if (index !== undefined && !this.deadDrones.has(index)) {
                const posAttribute = drones.geometry.attributes.position;
                const x = posAttribute.getX(index);
                const y = posAttribute.getY(index);
                const z = posAttribute.getZ(index);

                // Spawn explosion
                spawnSparks(new Vector3(x, y, z));

                // Hide drone
                posAttribute.setXYZ(index, 0, -99999, 0);
                posAttribute.needsUpdate = true;

                this.deadDrones.add(index);

                playPewSound();
                score.value += 100;
            }
        }
    }

    onMouseMove(event: MouseEvent) { }
}
