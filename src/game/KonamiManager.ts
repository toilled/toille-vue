import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Points,
    PointsMaterial,
    Scene,
} from "three";

export class KonamiManager {
    private scene: Scene;
    private konamiCode = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
        "b",
        "a",
    ];
    private konamiIndex = 0;

    // Fireworks System
    private fireworkShowActive = false;
    private fireworkShowEndTime = 0;
    private fireworks!: Points;
    private fireworkCount = 1500;
    private fwPositions: Float32Array;
    private fwColors: Float32Array;
    private fwVelocities: Float32Array;
    private fwLifetimes: Float32Array;
    private fwTypes: Float32Array; // 0 = rocket, 1 = explosion

    constructor(scene: Scene) {
        this.scene = scene;

        this.fwPositions = new Float32Array(this.fireworkCount * 3);
        this.fwColors = new Float32Array(this.fireworkCount * 3);
        this.fwVelocities = new Float32Array(this.fireworkCount * 3);
        this.fwLifetimes = new Float32Array(this.fireworkCount);
        this.fwTypes = new Float32Array(this.fireworkCount);

        this.initFireworks();
    }

    private initFireworks() {
        const fwGeo = new BufferGeometry();
        fwGeo.setAttribute("position", new BufferAttribute(this.fwPositions, 3));
        fwGeo.setAttribute("color", new BufferAttribute(this.fwColors, 3));

        const fwMaterial = new PointsMaterial({
            size: 6,
            vertexColors: true,
            transparent: true,
            opacity: 1,
            blending: AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false,
        });

        this.fireworks = new Points(fwGeo, fwMaterial);
        this.fireworks.frustumCulled = false;
        this.scene.add(this.fireworks);
    }

    public onKeyDown(event: KeyboardEvent) {
        if (event.key === this.konamiCode[this.konamiIndex]) {
            this.konamiIndex++;
            if (this.konamiIndex === this.konamiCode.length) {
                this.startFireworkShow();
                this.konamiIndex = 0; // Reset after success
            }
        } else {
            this.konamiIndex = 0;
        }
    }

    private startFireworkShow() {
        this.fireworkShowActive = true;
        this.fireworkShowEndTime = Date.now() + 10000; // 10 seconds
    }

    public update(dt: number) {
        if (!this.fireworks) return;

        const positions = this.fireworks.geometry.attributes.position.array as Float32Array;
        // const colors = this.fireworks.geometry.attributes.color.array; // Not strictly needed unless manipulating directly here
        let needsUpdate = false;

        // Manage Show State
        if (this.fireworkShowActive) {
            if (Date.now() > this.fireworkShowEndTime) {
                this.fireworkShowActive = false;
            } else {
                // Spawn new rockets occasionally
                if (Math.random() < 0.05) {
                    this.spawnFireworkRocket();
                }
            }
        }

        // Physics Update
        for (let i = 0; i < this.fireworkCount; i++) {
            // Only update living particles
            if (this.fwLifetimes[i] > 0) {
                // Update Physics
                this.fwPositions[i * 3] += this.fwVelocities[i * 3]; // X
                this.fwPositions[i * 3 + 1] += this.fwVelocities[i * 3 + 1]; // Y
                this.fwPositions[i * 3 + 2] += this.fwVelocities[i * 3 + 2]; // Z

                if (this.fwTypes[i] === 0) {
                    // ROCKET LOGIC
                    this.fwVelocities[i * 3 + 1] -= 0.05; // Less gravity for rocket

                    this.fwLifetimes[i] -= dt;

                    if (this.fwLifetimes[i] <= 0) {
                        // Explode!
                        this.explodeFirework(i);
                    }
                } else {
                    // EXPLOSION PARTICLE LOGIC
                    this.fwVelocities[i * 3 + 1] -= 0.1; // Standard gravity
                    this.fwVelocities[i * 3] *= 0.98; // Air resistance
                    this.fwVelocities[i * 3 + 1] *= 0.98;
                    this.fwVelocities[i * 3 + 2] *= 0.98;

                    this.fwLifetimes[i] -= dt * 0.5; // Fade out
                }

                // Update Array buffers
                positions[i * 3] = this.fwPositions[i * 3];
                positions[i * 3 + 1] = this.fwPositions[i * 3 + 1];
                positions[i * 3 + 2] = this.fwPositions[i * 3 + 2];

                // Update opacity/color if needed (Particles disappear when lifetime < 0)
                // Note: 'fwLifetimes' is the source of truth. If it was > 0 at start of loop, we updated.
                // If it BECAME <= 0 this frame (e.g. fade out), we need to hide it.
                if (this.fwLifetimes[i] <= 0) {
                    positions[i * 3 + 1] = -9999; // Move out of view
                    this.fwLifetimes[i] = 0;
                }

                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            this.fireworks.geometry.attributes.position.needsUpdate = true;
        }
    }

    private spawnFireworkRocket() {
        // Find a dead particle to use as rocket
        let index = -1;
        for (let i = 0; i < this.fireworkCount; i++) {
            if (this.fwLifetimes[i] <= 0) {
                index = i;
                break;
            }
        }
        if (index === -1) return; // No pool space

        // Random ground position
        const x = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        const y = 0;

        this.fwPositions[index * 3] = x;
        this.fwPositions[index * 3 + 1] = y;
        this.fwPositions[index * 3 + 2] = z;

        this.fwVelocities[index * 3] = 0;
        this.fwVelocities[index * 3 + 1] = 4 + Math.random() * 2; // Launch speed
        this.fwVelocities[index * 3 + 2] = 0;

        this.fwLifetimes[index] = 1.0 + Math.random() * 0.5; // Fuse time
        this.fwTypes[index] = 0; // Rocket

        // White trail color for rocket
        const colors = this.fireworks.geometry.attributes.color;
        colors.setXYZ(index, 1, 1, 0.8);
        colors.needsUpdate = true;
    }

    private explodeFirework(rocketIndex: number) {
        const x = this.fwPositions[rocketIndex * 3];
        const y = this.fwPositions[rocketIndex * 3 + 1];
        const z = this.fwPositions[rocketIndex * 3 + 2];

        // Pick a color for this explosion
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();

        const particleCount = 50;
        // Spawn explosion particles
        let spawned = 0;
        for (let i = 0; i < this.fireworkCount; i++) {
            if (this.fwLifetimes[i] <= 0) {
                this.fwPositions[i * 3] = x;
                this.fwPositions[i * 3 + 1] = y;
                this.fwPositions[i * 3 + 2] = z;

                const speed = 2 + Math.random() * 3;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;

                this.fwVelocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
                this.fwVelocities[i * 3 + 1] = Math.cos(phi) * speed;
                this.fwVelocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

                this.fwLifetimes[i] = 2.0;
                this.fwTypes[i] = 1; // Explosion

                // Set Color
                const colors = this.fireworks.geometry.attributes.color;
                colors.setXYZ(i, r, g, b);

                spawned++;
                if (spawned >= particleCount) break;
            }
        }

        this.fireworks.geometry.attributes.color.needsUpdate = true;
    }

    public dispose() {
        if (this.fireworks) {
            this.scene.remove(this.fireworks);
            this.fireworks.geometry.dispose();
            (this.fireworks.material as PointsMaterial).dispose();
        }
    }
}
