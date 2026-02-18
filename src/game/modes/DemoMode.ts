import { GameMode, GameContext } from "../types";
import { Vector3, MathUtils } from "three";
import { cyberpunkAudio } from "../../utils/CyberpunkAudio";

export class DemoMode implements GameMode {
    private context!: GameContext;
    private sceneIndex: number = 0;
    private sceneTime: number = 0;
    private originalBloomStrength: number = 1.5;
    private bloomPass: any;

    // Camera state
    private cameraBasePosition: Vector3 = new Vector3();
    private cameraShake: Vector3 = new Vector3();

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
        }

        cyberpunkAudio.addListener(this.onAudioNoteBound);
        cyberpunkAudio.play();

        this.sceneIndex = 0;
        this.sceneTime = 0;

        // Initial Camera Setup
        this.setCameraForScene(0);
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
    }

    cleanup(): void {
        cyberpunkAudio.pause();
        cyberpunkAudio.removeListener(this.onAudioNoteBound);

        if (this.bloomPass) {
            this.bloomPass.strength = this.originalBloomStrength;
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
        }

        if (type === 'snare') {
             if (this.bloomPass) {
                 this.bloomPass.strength = 2.5;
             }
             // Camera shake horizontal
             this.cameraShake.x += (Math.random() - 0.5) * 5;
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
                break;
            case 1: // Street Level Rush
                this.cameraBasePosition.z -= 600 * dt;
                if (this.cameraBasePosition.z < -2000) this.cameraBasePosition.z = 2000;

                // Wiggle
                this.cameraBasePosition.x = Math.sin(time * 5) * 50;

                const targetZ = this.cameraBasePosition.z - 200;
                cam.lookAt(0, 20, targetZ);
                break;
            case 2: // Spiral
                 const radius = 800;
                 const speed = 0.5;
                 const angle = time * speed;
                 this.cameraBasePosition.x = Math.sin(angle) * radius;
                 this.cameraBasePosition.z = Math.cos(angle) * radius;
                 this.cameraBasePosition.y = 300 + Math.sin(time) * 100;
                 cam.lookAt(0, 0, 0);
                 break;
            case 3: // Top Down glitchy
                 this.cameraBasePosition.x = Math.sin(time * 2) * 200;
                 this.cameraBasePosition.z = Math.cos(time * 2) * 200;
                 this.cameraBasePosition.y = 1000 + Math.sin(time) * 200;
                 cam.lookAt(0, 0, 0);
                 cam.rotation.z = time * 0.5;
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
