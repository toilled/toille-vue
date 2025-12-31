import { IGameMode } from "../GameModeManager";
import { GameContext } from "../types";
import { Vector3 } from "three";

export class WatchFightMode implements IGameMode {
    private target: Vector3 = new Vector3();
    private currentLookAt: Vector3 = new Vector3();
    private orbitAngle: number = 0;

    // We need to track which warrior/fight we are watching
    private targetWarrior: any = null; // Typing 'any' for now, ideally Warrior

    enter(context: GameContext): void {
        console.log("Entering Watch Fight Mode");
        // Initial find
        this.findNewTarget(context);
    }

    update(context: GameContext, dt: number): void {
        const { camera } = context;

        if (!this.targetWarrior || this.targetWarrior.state === 'DEAD') {
            this.findNewTarget(context);
        }

        if (this.targetWarrior && this.targetWarrior.group) {
            // Safe check for group position
            if (this.targetWarrior.group.position) {
                this.target.copy(this.targetWarrior.group.position);
            }

            // If they are in combat, maybe center between them and their target?
            if (this.targetWarrior.state === 'COMBAT' && this.targetWarrior.target && this.targetWarrior.target.group) {
                const p1 = this.targetWarrior.group.position;
                const p2 = this.targetWarrior.target.group.position;
                if (p1 && p2) {
                    this.target.lerpVectors(p1, p2, 0.5);
                }
            }
        }

        // Camera Orbit
        this.orbitAngle += dt * 0.5;
        const radius = 100;
        const height = 50;

        const tx = this.target.x + Math.sin(this.orbitAngle) * radius;
        const tz = this.target.z + Math.cos(this.orbitAngle) * radius;

        if (camera && camera.position) {
            camera.position.x += (tx - camera.position.x) * 0.1;
            camera.position.z += (tz - camera.position.z) * 0.1;
            camera.position.y += (this.target.y + height - camera.position.y) * 0.1;

            this.currentLookAt.lerp(this.target, 0.1);
            camera.lookAt(this.currentLookAt);
        }
    }

    exit(context: GameContext): void {
       // Reset or cleanup if needed
    }

    onKeyDown(event: KeyboardEvent): void {}
    onKeyUp(event: KeyboardEvent): void {}
    onClick(event: MouseEvent): void {}
    onMouseMove(event: MouseEvent): void {}

    private findNewTarget(context: GameContext) {
        const manager = context.gangWarManager;
        if (!manager) return;

        // 1. Try to find active fight
        const active = manager.getActiveFight();
        if (active) {
            this.targetWarrior = active;
            return;
        }

        // 2. Find potential fight
        const potential = manager.getPotentialFight();
        if (potential) {
            this.targetWarrior = potential;
            return;
        }

        // 3. Fallback? Just random warrior?
        if (manager.warriors.length > 0) {
             this.targetWarrior = manager.warriors[Math.floor(Math.random() * manager.warriors.length)];
        }
    }
}
