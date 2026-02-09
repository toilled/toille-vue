import { GameContext, GameMode } from "../types";
import { carAudio } from "../audio/CarAudio";
import { BOUNDS, CELL_SIZE, START_OFFSET, GRID_SIZE, CITY_SIZE } from "../config";
import { Vector3, Group, BoxGeometry, MeshStandardMaterial, Mesh, SpotLight, Object3D } from "three";
import { getHeight } from "../../utils/HeightMap";

export class DrivingMode implements GameMode {
    context: GameContext | null = null;
    redCar: Group | null = null;
    redCarSpeed: number = 0;
    redCarDir: Vector3 = new Vector3(0, 0, 0);

    init(context: GameContext) {
        this.context = context;
        if (!context.activeCar.value && context.cars.length > 0) {
            // Find a car to control (e.g. first one)
        }

        if (context.activeCar.value) {
            context.activeCar.value.userData.isPlayerControlled = true;
            context.activeCar.value.userData.currentSpeed = 0;
            context.timeLeft.value = 30;
            context.isGameOver.value = false;
            context.spawnCheckpoint();
            carAudio.start();

            // Init Red Car Speed
            this.redCarSpeed = 1.4;

            // Spawn Red Car
            this.spawnRedCar();
        }
    }

    spawnRedCar() {
        if (!this.context) return;

        // Create Red Car Mesh
        const carGroup = new Group();

        // Car Body
        const bodyGeo = new BoxGeometry(14, 4, 30);
        const bodyMat = new MeshStandardMaterial({ color: 0xff0000, roughness: 0.2, metalness: 0.6 });
        const body = new Mesh(bodyGeo, bodyMat);
        body.position.y = 3;
        body.castShadow = true;
        carGroup.add(body);

        // Cabin
        const cabinGeo = new BoxGeometry(12, 3, 16);
        const cabinMat = new MeshStandardMaterial({ color: 0x330000, roughness: 0.2, metalness: 0.8 });
        const cabin = new Mesh(cabinGeo, cabinMat);
        cabin.position.y = 6.5;
        cabin.position.z = -2;
        carGroup.add(cabin);

        // Add Lights (Red Glow)
        const light = new SpotLight(0xff0000, 200, 100, Math.PI / 3, 0.5, 1);
        light.position.set(0, 10, 0);
        const target = new Object3D();
        target.position.set(0, 0, 10);
        carGroup.add(target);
        light.target = target;
        carGroup.add(light);

        this.redCar = carGroup;
        this.context.scene.add(this.redCar);

        // Position it far away
        this.respawnRedCar();
    }

    respawnRedCar() {
        if (!this.context || !this.redCar) return;
        const player = this.context.activeCar.value;
        if (!player) return;

        // Find a valid road position far from player
        let spawned = false;
        let attempts = 0;
        while (!spawned && attempts < 20) {
            const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
            const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
            const otherCoord = (Math.random() - 0.5) * CITY_SIZE;

            const axis = Math.random() > 0.5 ? 'x' : 'z';
            let x, z;

            if (axis === 'x') {
                z = roadCoordinate; // Road runs x-axis
                x = otherCoord;
                this.redCar.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
            } else {
                x = roadCoordinate; // Road runs z-axis
                z = otherCoord;
                this.redCar.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
            }

            // Check dist
            const dist = Math.sqrt((x - player.position.x) ** 2 + (z - player.position.z) ** 2);
            if (dist > 500) {
                const h = getHeight(x, z);
                this.redCar.position.set(x, h + 1, z);
                spawned = true;
            }
            attempts++;
        }
    }

    update(dt: number, time: number) {
        if (!this.context) return;
        const { activeCar, timeLeft, checkpointMesh, navArrow, drivingScore, playPewSound, spawnCheckpoint, controls, occupiedGrids, spawnSparks, camera, isGameOver, distToTarget } = this.context;

        if (!activeCar.value) return;

        const car = activeCar.value;

        if (isGameOver.value) {
            // Force stop if game over
            car.userData.currentSpeed *= 0.95;
            if (Math.abs(car.userData.currentSpeed) < 0.01) car.userData.currentSpeed = 0;
            carAudio.update(car.userData.currentSpeed);

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
                drivingScore.value += 500;
                timeLeft.value += 15;
                playPewSound();
                spawnCheckpoint();

                // Increase Difficulty
                this.redCarSpeed = Math.min(this.redCarSpeed + 0.1, 2.2);
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

        car.position.y = getHeight(car.position.x, car.position.z) + 1;

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

        // Update Red Car
        this.updateRedCar(car);
    }

    updateRedCar(playerCar: Group) {
        if (!this.redCar) return;

        const redSpeed = this.redCarSpeed;
        const currentRotation = this.redCar.rotation.y;

        // Move Forward
        this.redCar.position.x += Math.sin(currentRotation) * redSpeed;
        this.redCar.position.z += Math.cos(currentRotation) * redSpeed;

        this.redCar.position.y = getHeight(this.redCar.position.x, this.redCar.position.z) + 1;

        // Lateral Movement Logic relative to road
        // Determine primary axis of movement (if cos is high, it's Z axis)
        const isZAxis = Math.abs(Math.cos(currentRotation)) > 0.5;

        // Find road center
        const roadHalf = CELL_SIZE / 2;
        const gridX = Math.round((this.redCar.position.x - START_OFFSET - roadHalf) / CELL_SIZE);
        const gridZ = Math.round((this.redCar.position.z - START_OFFSET - roadHalf) / CELL_SIZE);

        const roadCenterX = START_OFFSET + gridX * CELL_SIZE + roadHalf;
        const roadCenterZ = START_OFFSET + gridZ * CELL_SIZE + roadHalf;

        // Steering towards player
        const lateralSpeed = redSpeed * 0.3; // Slower lateral movement
        const maxOffset = 18; // Slightly less than ROAD_WIDTH/2 (20)

        if (isZAxis) {
            // Driving North/South (Z-axis). Steer X towards player.
            let targetX = playerCar.position.x;
            // Clamp target to road bounds
            targetX = Math.max(roadCenterX - maxOffset, Math.min(roadCenterX + maxOffset, targetX));

            const diff = targetX - this.redCar.position.x;
            if (Math.abs(diff) > 0.1) {
                this.redCar.position.x += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
            }
        } else {
            // Driving East/West (X-axis). Steer Z towards player.
            let targetZ = playerCar.position.z;
            targetZ = Math.max(roadCenterZ - maxOffset, Math.min(roadCenterZ + maxOffset, targetZ));

            const diff = targetZ - this.redCar.position.z;
            if (Math.abs(diff) > 0.1) {
                this.redCar.position.z += Math.sign(diff) * Math.min(Math.abs(diff), lateralSpeed);
            }
        }

        // Wrap Bounds for Red Car
        if (this.redCar.position.x > BOUNDS) this.redCar.position.x = -BOUNDS;
        if (this.redCar.position.x < -BOUNDS) this.redCar.position.x = BOUNDS;
        if (this.redCar.position.z > BOUNDS) this.redCar.position.z = -BOUNDS;
        if (this.redCar.position.z < -BOUNDS) this.redCar.position.z = BOUNDS;

        // Interaction Logic: Intersections
        const interX = roadCenterX;
        const interZ = roadCenterZ;

        // Determine longitudinal distance and lateral distance
        let longDist = 0;
        let latDist = 0;

        if (isZAxis) {
            longDist = Math.abs(this.redCar.position.z - interZ);
            latDist = Math.abs(this.redCar.position.x - interX);
        } else {
            longDist = Math.abs(this.redCar.position.x - interX);
            latDist = Math.abs(this.redCar.position.z - interZ);
        }

        // Allow turn if close to intersection center longitudinally, 
        // regardless of lateral offset (as long as within road)
        if (longDist < 5 && latDist < 25) {
            const directions = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

            let bestDir = this.redCar.rotation.y;
            let minDst = Infinity;

            const curDirX = Math.sin(this.redCar.rotation.y);
            const curDirZ = Math.cos(this.redCar.rotation.y);

            for (const dir of directions) {
                const dx = Math.sin(dir);
                const dz = Math.cos(dir);

                const dot = dx * curDirX + dz * curDirZ;
                if (dot < -0.9) continue; // Don't turn 180

                // Look ahead
                const px = this.redCar.position.x + dx * 100;
                const pz = this.redCar.position.z + dz * 100;

                const d = (px - playerCar.position.x) ** 2 + (pz - playerCar.position.z) ** 2;

                if (d < minDst) {
                    minDst = d;
                    bestDir = dir;
                }
            }

            // Apply turn
            this.redCar.rotation.y = bestDir;

            // Push car forward in new direction to clear intersection trigger
            this.redCar.position.x += Math.sin(bestDir) * 6;
            this.redCar.position.z += Math.cos(bestDir) * 6;
        }

        // Check Collision with Player
        const distToPlayer = this.redCar.position.distanceTo(playerCar.position);
        if (distToPlayer < 10) {
            if (this.context && this.context.isGameOver) {
                this.context.isGameOver.value = true;
            }
        }

        // Update Chase Arrow
        if (this.context && this.context.chaseArrow) {
            const arrow = this.context.chaseArrow;
            arrow.visible = true;
            arrow.position.copy(playerCar.position);
            arrow.position.y += 3; // Approx same level as car body
            arrow.lookAt(this.redCar.position);

            const dist = this.redCar.position.distanceTo(playerCar.position);
            let op = 0;
            if (dist < 200) op = 1;
            else if (dist > 600) op = 0;
            else op = 1 - (dist - 200) / 400;

            arrow.traverse((c: any) => {
                if (c.material) c.material.opacity = op;
            });
        }
    }

    cleanup() {
        if (this.context) {
            if (this.context.activeCar.value) {
                this.context.activeCar.value.userData.isPlayerControlled = false;
                this.context.activeCar.value = null;
            }
            this.context.navArrow.visible = false;
            if (this.context.chaseArrow) this.context.chaseArrow.visible = false;
            if (this.context.checkpointMesh) this.context.checkpointMesh.visible = false;

            if (this.redCar) {
                this.context.scene.remove(this.redCar);
                this.redCar = null;
            }

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
