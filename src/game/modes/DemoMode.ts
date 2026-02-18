import { GameMode, GameContext } from "../types";
import { Vector3, MathUtils, Group, Mesh } from "three";
import { cyberpunkAudio } from "../../utils/CyberpunkAudio";
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';

export class DemoMode implements GameMode {
    private context!: GameContext;
    private sceneIndex: number = 0;
    private sceneTime: number = 0;
    private originalBloomStrength: number = 1.5;
    private bloomPass: any;

    // Additional Passes
    private afterimagePass: AfterimagePass | null = null;
    private glitchPass: GlitchPass | null = null;

    // Camera state
    private cameraBasePosition: Vector3 = new Vector3();
    private cameraShake: Vector3 = new Vector3();

    // Spark Targets
    private sparkTargets: Vector3[] = [];

    // Bind the listener
    private onAudioNoteBound = (type: string, data?: any) => this.onAudioNote(type, data);

    init(context: GameContext): void {
        this.context = context;

        // Find Bloom Pass
        if (this.context.composer && this.context.composer.passes) {
             // Look for a pass with 'strength', 'radius', 'threshold' which are typical for UnrealBloomPass
             this.bloomPass = this.context.composer.passes.find((pass: any) =>
                pass.strength !== undefined && pass.radius !== undefined && pass.threshold !== undefined
             );

             // Fallback to index 1 if not found
             if (!this.bloomPass && this.context.composer.passes.length > 1) {
                 this.bloomPass = this.context.composer.passes[1];
             }

             if (this.bloomPass) {
                 this.originalBloomStrength = this.bloomPass.strength;
             }

             // Initialize Afterimage Pass (Motion Blur)
             this.afterimagePass = new AfterimagePass();
             this.afterimagePass.uniforms["damp"].value = 0.8;
             this.afterimagePass.enabled = false;
             this.context.composer.addPass(this.afterimagePass);

             // Initialize Glitch Pass
             this.glitchPass = new GlitchPass();
             this.glitchPass.goWild = false;
             this.glitchPass.enabled = false;
             this.context.composer.addPass(this.glitchPass);
        }

        // Identify Spark Targets (Tall Buildings with Antennae/Poles)
        this.identifySparkTargets();

        cyberpunkAudio.addListener(this.onAudioNoteBound);
        cyberpunkAudio.play();

        this.sceneIndex = 0;
        this.sceneTime = 0;

        // Initial Camera Setup
        this.setCameraForScene(0);
    }

    private identifySparkTargets() {
        this.sparkTargets = [];
        if (!this.context.buildings) return;

        this.context.buildings.forEach((building: Group | any) => {
            // Traverse to find the highest point
            let maxY = 0;
            // Assuming building position is at base
            const buildingBaseY = building.position.y;

            // Heuristic: Check for neon strips or just use bounding box top
            // Since we don't have bounding boxes pre-calculated, let's look for children
            if (building.children) {
                building.children.forEach((child: any) => {
                     // If it's a mesh, check geometry or position
                     if (child instanceof Mesh) {
                         // This is rough estimation.
                         // For Twisted buildings, they are stacks of boxes.
                         // For Cylindrical, it's a cylinder.
                         // Let's just use the building's position + some height estimation
                         // Or better, if we can find specific "antenna" geometry if implemented.
                         // Given memory says "applies neon strip decorations to tall structures",
                         // we can target those.

                         // Simple approach: Use building position + a hardcoded offset based on scale/type?
                         // No, let's use the object's position if it's high up.
                     }
                });
            }

            // Better approach: Iterate over all buildings, if userData.height is available (it might be), use that.
            // Looking at CityBuilder memory: "Buildings... vertically positioned...".

            // Let's assume high buildings have y > 100.
            // Let's try to find the top center.
            // Since we can't easily compute bbox here without Three.js Box3 which might be heavy for all,
            // let's rely on the fact that buildings are generated around their origin (usually bottom center).
            // We need the height.

            // Let's just pick random spots high up above buildings for now if we can't get exact geometry.
            // Wait, I can iterate children and find the one with highest world position.

            let topPoint = new Vector3();
            let highestY = -Infinity;

            building.traverse((obj: any) => {
                if (obj instanceof Mesh) {
                    const worldPos = new Vector3();
                    obj.getWorldPosition(worldPos);
                    // This gets the center of the mesh.
                    // If it's a tall block, center is middle.
                    // We want the top.
                    // Approximating: center.y + geometry.parameters.height/2
                    let height = 0;
                    if (obj.geometry && obj.geometry.parameters && obj.geometry.parameters.height) {
                        height = obj.geometry.parameters.height;
                    }

                    const topY = worldPos.y + height / 2;
                    if (topY > highestY) {
                        highestY = topY;
                        topPoint.copy(worldPos);
                        topPoint.y = topY;
                    }
                }
            });

            if (highestY > 200) { // Only tall buildings
                this.sparkTargets.push(topPoint);
            }
        });

        // If no targets found (e.g. empty city or logic fail), fallback to random high points
        if (this.sparkTargets.length === 0) {
            for(let i=0; i<50; i++) {
                this.sparkTargets.push(new Vector3(
                    (Math.random() - 0.5) * 2000,
                    300 + Math.random() * 200,
                    (Math.random() - 0.5) * 2000
                ));
            }
        }
    }

    update(dt: number, time: number): void {
        this.sceneTime += dt;

        // Scene management
        const sceneDuration = 8.0;
        if (this.sceneTime > sceneDuration) {
            this.sceneIndex = (this.sceneIndex + 1) % 4;
            this.sceneTime = 0;
            this.setCameraForScene(this.sceneIndex);
        }

        // Scene specific updates
        this.updateScene(dt, time);

        // Apply Shake to Camera
        this.context.camera.position.copy(this.cameraBasePosition).add(this.cameraShake);

        // Decay effects
        // Shake decay
        this.cameraShake.lerp(new Vector3(0, 0, 0), dt * 5);

        // Bloom decay
        if (this.bloomPass) {
            this.bloomPass.strength = MathUtils.lerp(this.bloomPass.strength, this.originalBloomStrength, dt * 5);
        }

        // Turn off glitch pass after a short burst
        if (this.glitchPass && this.glitchPass.enabled && Math.random() > 0.95) {
             this.glitchPass.enabled = false;
        }
    }

    cleanup(): void {
        cyberpunkAudio.pause();
        cyberpunkAudio.removeListener(this.onAudioNoteBound);

        if (this.bloomPass) {
            this.bloomPass.strength = this.originalBloomStrength;
        }

        if (this.context.composer) {
            if (this.afterimagePass) {
                this.context.composer.removePass(this.afterimagePass);
            }
            if (this.glitchPass) {
                this.context.composer.removePass(this.glitchPass);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {}
    onKeyUp(event: KeyboardEvent): void {}
    onClick(event: MouseEvent): void {}
    onMouseMove(event: MouseEvent): void {}

    private onAudioNote(type: string, data?: any) {
        if (type === 'kick') {
            if (this.bloomPass) {
                this.bloomPass.strength = 3.0; // Bloom flash
            }
            // Camera shake vertical
             this.cameraShake.y += (Math.random() - 0.5) * 5;

             // Trigger Glitch occasionally on kick
             if (this.glitchPass && Math.random() < 0.3) {
                 this.glitchPass.enabled = true;
             }
        }

        if (type === 'snare') {
             if (this.bloomPass) {
                 this.bloomPass.strength = 2.5;
             }
             // Camera shake horizontal
             this.cameraShake.x += (Math.random() - 0.5) * 5;

             // Spawn sparks at random building top
             if (this.sparkTargets.length > 0) {
                 const target = this.sparkTargets[Math.floor(Math.random() * this.sparkTargets.length)];
                 // Spawn a burst
                 for(let i=0; i<8; i++) {
                     this.context.spawnSparks(target.clone().add(new Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10)));
                 }
             }
        }

        if (type === 'hihat') {
             // Subtle shake depth
             this.cameraShake.z += (Math.random() - 0.5) * 2;
        }
    }

    private updateScene(dt: number, time: number) {
        const cam = this.context.camera;
        // NOTE: We modify cameraBasePosition here, NOT cam.position directly

        switch (this.sceneIndex) {
            case 0: // Intro Flyover
                this.cameraBasePosition.z -= 100 * dt;
                this.cameraBasePosition.y = 400 + Math.sin(time * 0.5) * 50;
                cam.lookAt(0, 0, 0);
                if (this.afterimagePass) this.afterimagePass.enabled = false;
                break;
            case 1: // Street Level Rush
                this.cameraBasePosition.z -= 600 * dt;
                if (this.cameraBasePosition.z < -2000) this.cameraBasePosition.z = 2000;

                // Wiggle
                this.cameraBasePosition.x = Math.sin(time * 5) * 50;

                const targetZ = this.cameraBasePosition.z - 200;
                cam.lookAt(0, 20, targetZ);

                // Motion blur enabled for speed
                if (this.afterimagePass) {
                    this.afterimagePass.enabled = true;
                    this.afterimagePass.uniforms["damp"].value = 0.85;
                }
                break;
            case 2: // Spiral
                 const radius = 800;
                 const speed = 0.5;
                 const angle = time * speed;
                 this.cameraBasePosition.x = Math.sin(angle) * radius;
                 this.cameraBasePosition.z = Math.cos(angle) * radius;
                 this.cameraBasePosition.y = 300 + Math.sin(time) * 100;
                 cam.lookAt(0, 0, 0);
                 if (this.afterimagePass) {
                     this.afterimagePass.enabled = true;
                     this.afterimagePass.uniforms["damp"].value = 0.7; // lighter blur
                 }
                 break;
            case 3: // Top Down glitchy
                 this.cameraBasePosition.x = Math.sin(time * 2) * 200;
                 this.cameraBasePosition.z = Math.cos(time * 2) * 200;
                 this.cameraBasePosition.y = 1000 + Math.sin(time) * 200;
                 cam.lookAt(0, 0, 0);
                 cam.rotation.z = time * 0.5;

                 if (this.afterimagePass) this.afterimagePass.enabled = false;

                 // More frequent glitches
                 if (this.glitchPass && Math.random() < 0.05) {
                     this.glitchPass.enabled = true;
                 }
                 break;
        }
    }

    private setCameraForScene(index: number) {
        const cam = this.context.camera;
        // Reset rotation
        cam.rotation.set(0, 0, 0);

        switch (index) {
            case 0:
                this.cameraBasePosition.set(0, 400, 1000);
                cam.lookAt(0, 0, 0);
                break;
            case 1:
                this.cameraBasePosition.set(0, 30, 2000);
                cam.lookAt(0, 20, 1900);
                break;
            case 2:
                 this.cameraBasePosition.set(600, 300, 0);
                 cam.lookAt(0, 0, 0);
                 break;
            case 3:
                 this.cameraBasePosition.set(0, 1000, 0);
                 cam.lookAt(0, 0, 0);
                 break;
        }
        // Update actual camera immediately to prevent jump
        cam.position.copy(this.cameraBasePosition);
    }
}
