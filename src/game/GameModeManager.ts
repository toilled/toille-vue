import { GameContext, GameMode, GameModeType } from "./types";

export class GameModeManager {
    private currentMode: GameMode | null = null;
    private currentType: GameModeType | null = null;
    private context: GameContext;
    private onModeChange: ((type: GameModeType | null) => void) | null = null;

    constructor(context: GameContext, onModeChange?: (type: GameModeType | null) => void) {
        this.context = context;
        this.onModeChange = onModeChange ?? null;
    }

    setMode(mode: GameMode, type?: GameModeType) {
        if (this.currentMode) {
            this.currentMode.cleanup();
        }
        this.currentMode = mode;
        this.currentType = type ?? null;
        this.currentMode.init(this.context);
        if (this.onModeChange) {
            this.onModeChange(this.currentType);
        }
    }

    getMode(): GameMode | null {
        return this.currentMode;
    }

    clearMode() {
        if (this.currentMode) {
            this.currentMode.cleanup();
        }
        this.currentMode = null;
        this.currentType = null;
        if (this.onModeChange) {
            this.onModeChange(null);
        }
    }

    update(dt: number, time: number) {
        if (this.currentMode) {
            this.currentMode.update(dt, time);
        }
    }

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
