import { GameContext, GameMode } from "../types";

export class FlyingTourMode implements GameMode {
    context: GameContext | null = null;

    init(context: GameContext) {
        this.context = context;
    }

    update(dt: number, time: number) {
        if (!this.context) return;
        const { camera } = this.context;

        // Flying Tour Mode
        const tourSpeed = 0.15;

        // More complex path: Figure-8ish / weaving
        // Main circular orbit
        const xBase = Math.sin(time * tourSpeed) * 1200;
        const zBase = Math.cos(time * tourSpeed) * 800;

        // Secondary wave for weaving
        const xWeave = Math.sin(time * tourSpeed * 3) * 300;

        camera.position.x = xBase + xWeave;
        camera.position.z = zBase;

        // Dynamic height: Dive down and up
        // Base height 250, amplitude 150. Go between 100 and 400.
        camera.position.y = 250 + Math.sin(time * tourSpeed * 2) * 150;

        // Look ahead logic
        // Calculate derivative (approx velocity direction)
        const delta = 0.1;
        const futureTime = time + delta;

        const fxBase = Math.sin(futureTime * tourSpeed) * 1200;
        const fzBase = Math.cos(futureTime * tourSpeed) * 800;
        const fxWeave = Math.sin(futureTime * tourSpeed * 3) * 300;

        const nextX = fxBase + fxWeave;
        const nextZ = fzBase;
        const nextY = 250 + Math.sin(futureTime * tourSpeed * 2) * 150;

        camera.lookAt(nextX, nextY, nextZ);
    }

    cleanup() { }

    onKeyDown(event: KeyboardEvent) { }
    onKeyUp(event: KeyboardEvent) { }
    onClick(event: MouseEvent) { }
    onMouseMove(event: MouseEvent) { }
}
