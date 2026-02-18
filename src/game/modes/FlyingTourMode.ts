import { Vector3, CatmullRomCurve3 } from "three";
import { GameContext, GameMode } from "../types";

export class FlyingTourMode implements GameMode {
    context: GameContext | null = null;
    curve: CatmullRomCurve3;

    constructor() {
        // Define a path that explores both outer and inner streets.
        // Coordinates correspond to street locations (multiples of 190) or midpoints.
        // Heights are kept safe (>= 140) to avoid building collisions while providing a good view.
        this.curve = new CatmullRomCurve3([
            new Vector3(760, 300, 760),   // Start high at outer corner
            new Vector3(760, 150, 190),   // South along outer street, drop height
            new Vector3(190, 140, 190),   // West into inner street
            new Vector3(190, 140, -190),  // North along inner street
            new Vector3(-190, 150, -190), // West across center
            new Vector3(-190, 200, -760), // North to outer edge, rise
            new Vector3(380, 250, -760),  // East along outer edge
            new Vector3(380, 150, 0),     // South to center-ish
            new Vector3(760, 300, 0)      // East back to start area
        ]);
        this.curve.closed = true;
        this.curve.tension = 0.5;
    }

    init(context: GameContext) {
        this.context = context;
    }

    update(dt: number, time: number) {
        if (!this.context) return;
        const { camera } = this.context;

        const loopTime = 60; // 60 seconds for a full loop
        const t = (time % loopTime) / loopTime;

        // Get position on curve
        // getPointAt ensures constant speed along the path
        const position = this.curve.getPointAt(t);
        camera.position.copy(position);

        // Look ahead
        const lookAhead = 0.05; // Look 5% ahead
        const lookAtT = (t + lookAhead) % 1;
        const target = this.curve.getPointAt(lookAtT);

        camera.lookAt(target);
    }

    cleanup() { }

    onKeyDown(event: KeyboardEvent) { }
    onKeyUp(event: KeyboardEvent) { }
    onClick(event: MouseEvent) { }
    onMouseMove(event: MouseEvent) { }
}
