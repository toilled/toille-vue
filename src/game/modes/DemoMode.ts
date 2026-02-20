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
             this.bloomPass = this.context.composer.passes.find((pass: any) =>
                pass.strength !== undefined && pass.radius !== undefined && pass.threshold !== undefined
             );

             if (!this.bloomPass && this.context.composer.passes.length > 1) {
                 this.bloomPass = this.context.composer.passes[1];
             }

             if (this.bloomPass) {
                 this.originalBloomStrength = this.bloomPass.strength;
             }

             this.afterimagePass = new AfterimagePass();
             this.afterimagePass.uniforms["damp"].value = 0.8;
             this.afterimagePass.enabled = false;
             this.context.composer.addPass(this.afterimagePass);

             this.glitchPass = new GlitchPass();
             this.glitchPass.goWild = false;
             this.glitchPass.enabled = false;
             this.context.composer.addPass(this.glitchPass);
        }

        // Identify Spark Targets (Building Spires and Antennae)
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

        this.context.buildings.forEach((buildingGroup: Group | any) => {
            // Find the highest point in the building group
            let highestPoint = new Vector3();
            let maxY = -Infinity;
            let foundSpire = false;

            buildingGroup.traverse((child: any) => {
                if (child instanceof Mesh) {
                    const worldPos = new Vector3();
                    child.getWorldPosition(worldPos);

                    // Check for ConeGeometry which indicates a spire
                    // Using constructor name as a heuristic since instanceOf might fail if imports differ in tests/runtime
                    const isCone = child.geometry && (child.geometry.type === 'ConeGeometry' || child.geometry.constructor.name === 'ConeGeometry');

                    // Check for thin BoxGeometry at the top (Antenna)
                    const isAntenna = child.geometry &&
                                      child.geometry.type === 'BoxGeometry' &&
                                      child.scale.x < 5 && child.scale.z < 5 && child.scale.y > 20;

                    let topY = worldPos.y;

                    // Add half height
                    if (child.geometry && child.geometry.parameters && child.geometry.parameters.height) {
                         // Scaled height
                         topY += (child.geometry.parameters.height * child.scale.y) / 2;
                    } else if (child.geometry && child.geometry.boundingBox) {
                         topY = child.geometry.boundingBox.max.y * child.scale.y + worldPos.y;
                    }

                    if (isCone || isAntenna) {
                         // Prefer spires and antennas
                         if (topY > maxY) {
                             maxY = topY;
                             highestPoint.copy(worldPos);
                             highestPoint.y = topY;
                             foundSpire = true;
                         }
                    } else if (!foundSpire) {
                         // Fallback to highest general mesh if no spire found yet
                         if (topY > maxY) {
                             maxY = topY;
                             highestPoint.copy(worldPos);
                             highestPoint.y = topY;
                         }
                    }
                }
            });

            // Filter for only tall buildings to avoid ground clutter
            if (maxY > 100) {
                this.sparkTargets.push(highestPoint);
            }
        });

        // Fallback
        if (this.sparkTargets.length === 0) {
            for(let i=0; i<20; i++) {
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

        const sceneDuration = 8.0;
        if (this.sceneTime > sceneDuration) {
            this.sceneIndex = (this.sceneIndex + 1) % 4;
            this.sceneTime = 0;
            this.setCameraForScene(this.sceneIndex);
        }

        this.updateScene(dt, time);

        this.context.camera.position.copy(this.cameraBasePosition).add(this.cameraShake);

        this.cameraShake.lerp(new Vector3(0, 0, 0), dt * 5);

        if (this.bloomPass) {
            this.bloomPass.strength = MathUtils.lerp(this.bloomPass.strength, this.originalBloomStrength, dt * 5);
        }

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
                this.bloomPass.strength = 3.0;
            }
             this.cameraShake.y += (Math.random() - 0.5) * 5;

             if (this.glitchPass && Math.random() < 0.3) {
                 this.glitchPass.enabled = true;
             }
        }

        if (type === 'snare') {
             if (this.bloomPass) {
                 this.bloomPass.strength = 2.5;
             }
             this.cameraShake.x += (Math.random() - 0.5) * 5;

             // Emit from spires
             if (this.sparkTargets.length > 0) {
                 // Pick a few random spires
                 for (let k=0; k<3; k++) {
                     const target = this.sparkTargets[Math.floor(Math.random() * this.sparkTargets.length)];
                     // Burst upwards/outwards from the tip
                     for(let i=0; i<5; i++) {
                         this.context.spawnSparks(target.clone());
                     }
                 }
             }
        }

        if (type === 'hihat') {
             this.cameraShake.z += (Math.random() - 0.5) * 2;
        }
    }

    private updateScene(dt: number, time: number) {
        const cam = this.context.camera;

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

                this.cameraBasePosition.x = Math.sin(time * 5) * 50;

                const targetZ = this.cameraBasePosition.z - 200;
                cam.lookAt(0, 20, targetZ);

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
                     this.afterimagePass.uniforms["damp"].value = 0.7;
                 }
                 break;
            case 3: // Top Down glitchy
                 this.cameraBasePosition.x = Math.sin(time * 2) * 200;
                 this.cameraBasePosition.z = Math.cos(time * 2) * 200;
                 this.cameraBasePosition.y = 1000 + Math.sin(time) * 200;
                 cam.lookAt(0, 0, 0);
                 cam.rotation.z = time * 0.5;

                 if (this.afterimagePass) this.afterimagePass.enabled = false;

                 if (this.glitchPass && Math.random() < 0.05) {
                     this.glitchPass.enabled = true;
                 }
                 break;
        }
    }

    private setCameraForScene(index: number) {
        const cam = this.context.camera;
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
        cam.position.copy(this.cameraBasePosition);
    }
}
