import { GameContext, GameMode } from "./types";

export class GameModeManager {
    private currentMode: GameMode | null = null;
    private context: GameContext;

    constructor(context: GameContext) {
        this.context = context;
    }

    setMode(mode: GameMode) {
        if (this.currentMode) {
            this.currentMode.cleanup();
        }
        this.currentMode = mode;
        this.currentMode.init(this.context);
    }

    getMode(): GameMode | null {
        return this.currentMode;
    }

    clearMode() {
        if (this.currentMode) {
            this.currentMode.cleanup();
        }
        this.currentMode = null;
    }

    update(dt: number, time: number) {
        if (this.currentMode) {
            this.currentMode.update(dt, time);
        }
    }

    // Input Forwarding
    onKeyDown(event: KeyboardEvent) {
        if (this.currentMode) this.currentMode.onKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent) {
        if (this.currentMode) this.currentMode.onKeyUp(event);
    }

    onClick(event: MouseEvent) {
        if (this.currentMode) this.currentMode.onClick(event);
    }

    onMouseMove(event: MouseEvent) {
        if (this.currentMode) this.currentMode.onMouseMove(event);
    }
}
