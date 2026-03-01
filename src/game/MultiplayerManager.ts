import { Scene, Group } from "three";
import { CarFactory } from "./CarFactory";
import { getHeight, getNormal } from "../utils/HeightMap";

export class MultiplayerManager {
    private scene: Scene;
    private ws: WebSocket | null = null;
    private myId: string | null = null;
    private otherPlayers = new Map<string, { group: Group, targetPos: {x: number, z: number}, targetHeading: number, lastUpdate: number }>();
    private carFactory: CarFactory;

    constructor(scene: Scene) {
        this.scene = scene;
        this.carFactory = new CarFactory();
        this.connect();
    }

    private connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/api/multiplayer`;

        try {
            this.ws = new WebSocket(url);

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'init') {
                        this.myId = data.id;
                    } else if (data.type === 'update') {
                        this.handlePlayerUpdate(data);
                    } else if (data.type === 'disconnect') {
                        this.handlePlayerDisconnect(data.id);
                    }
                } catch (e) {
                    console.error("Error parsing multiplayer message", e);
                }
            };

            this.ws.onclose = () => {
                setTimeout(() => this.connect(), 5000);
            };
        } catch (e) {
            console.error("Failed to connect to multiplayer server", e);
        }
    }

    private handlePlayerUpdate(data: any) {
        if (!data.id || data.id === this.myId) return;

        const { id, x, z, heading } = data;

        if (!this.otherPlayers.has(id)) {
            // Create a new car for this player
            const group = this.carFactory.createCar(false); // Default to regular car
            group.position.set(x, getHeight(x, z) + 1, z);
            group.rotation.y = heading;
            group.userData.isOtherPlayer = true;
            group.userData.id = id;

            // Replicate player's specific color/look? Default car generation gives a random color.
            // This is good enough to distinguish.

            this.scene.add(group);

            this.otherPlayers.set(id, { group, targetPos: { x, z }, targetHeading: heading, lastUpdate: Date.now() });
        } else {
            const player = this.otherPlayers.get(id);
            if (player) {
                player.targetPos = { x, z };
                player.targetHeading = heading;
                player.lastUpdate = Date.now();
            }
        }
    }

    private handlePlayerDisconnect(id: string) {
        const player = this.otherPlayers.get(id);
        if (player) {
            this.scene.remove(player.group);
            this.otherPlayers.delete(id);
        }
    }

    public sendUpdate(activeCar: Group | null) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.myId || !activeCar) return;

        const data = {
            type: 'update',
            id: this.myId,
            x: activeCar.position.x,
            z: activeCar.position.z,
            heading: activeCar.userData.heading ?? activeCar.rotation.y
        };

        this.ws.send(JSON.stringify(data));
    }

    public update(dt: number) {
        const now = Date.now();
        for (const [id, player] of this.otherPlayers.entries()) {
            if (now - player.lastUpdate > 10000) {
                // Remove player if no update for 10 seconds
                this.handlePlayerDisconnect(id);
                continue;
            }

            // Interpolate position
            const lerpFactor = Math.min(dt * 10, 1);
            player.group.position.x += (player.targetPos.x - player.group.position.x) * lerpFactor;
            player.group.position.z += (player.targetPos.z - player.group.position.z) * lerpFactor;

            // Re-calculate Y based on height map
            player.group.position.y = getHeight(player.group.position.x, player.group.position.z) + 1;

            // Interpolate rotation (shortest path)
            let diff = player.targetHeading - player.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            player.group.rotation.y += diff * lerpFactor;

            // Apply normal
            const normal = getNormal(player.group.position.x, player.group.position.z);
            player.group.up.set(normal.x, normal.y, normal.z);

            // Maintain car orientation
            const lookDist = 5;
            const tx = player.group.position.x + Math.sin(player.group.rotation.y) * lookDist;
            const tz = player.group.position.z + Math.cos(player.group.rotation.y) * lookDist;
            const ty = getHeight(tx, tz) + 1;
            player.group.lookAt(tx, ty, tz);
        }
    }

    public getOtherPlayersCars(): Group[] {
        return Array.from(this.otherPlayers.values()).map(p => p.group);
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
