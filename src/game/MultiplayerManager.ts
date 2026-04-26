import mqtt from "mqtt";
import {
  Scene,
  Group,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector3,
  Sprite,
  SpriteMaterial,
  CanvasTexture,
} from "three";
import { CarFactory } from "./CarFactory";

interface PlayerState {
  x: number;
  y: number;
  z: number;
  heading: number;
  state: "walking" | "driving";
  timestamp: number;
  message?: string;
  messageTimestamp?: number;
}

interface RemotePlayer {
  group: Group;
  targetPos: Vector3;
  targetHeading: number;
  lastUpdate: number;
  currentState: "walking" | "driving";
  messageSprite?: Sprite;
  messageTimeout?: number;
}

export class MultiplayerManager {
  private client: mqtt.MqttClient | null = null;
  private scene: Scene;
  private players: Map<string, RemotePlayer> = new Map();
  private myId: string;
  private topic = "toille-vue/cyberpunk/players";
  private carFactory: CarFactory;

  private lastBroadcastTime = 0;
  private broadcastInterval = 100; // max 10Hz

  constructor(scene: Scene) {
    this.scene = scene;
    this.myId = Math.random().toString(36).substring(2, 10);
    this.carFactory = new CarFactory();
  }

  public connect() {
    this.client = mqtt.connect("wss://broker.emqx.io:8084/mqtt");

    this.client.on("connect", () => {
      this.client?.subscribe(this.topic);
    });

    this.client.on("message", (topic, message) => {
      if (topic === this.topic) {
        try {
          const data = JSON.parse(message.toString());
          if (data.id && data.id !== this.myId) {
            this.handleRemotePlayerUpdate(data.id, data);
          }
        } catch {
          // ignore parsing errors
        }
      }
    });
  }

  private handleRemotePlayerUpdate(id: string, data: PlayerState) {
    const now = Date.now();
    let player = this.players.get(id);

    if (!player || player.currentState !== data.state) {
      // Create or Recreate player
      if (player) {
        this.removePlayerGroup(player.group);
      }

      let group: Group;
      if (data.state === "driving") {
        group = this.carFactory.createCar(false);
      } else {
        group = new Group();
        const bodyGeo = new BoxGeometry(2, 4, 2);
        const bodyMat = new MeshStandardMaterial({ color: 0x00ffcc });
        const body = new Mesh(bodyGeo, bodyMat);
        body.position.y = 2; // Half height
        group.add(body);
      }

      group.position.set(data.x, data.y, data.z);
      group.rotation.y = data.heading;
      this.scene.add(group);

      player = {
        group,
        targetPos: new Vector3(data.x, data.y, data.z),
        targetHeading: data.heading,
        lastUpdate: now,
        currentState: data.state,
      };
      this.players.set(id, player);
    } else {
      // Update target
      player.targetPos.set(data.x, data.y, data.z);
      player.targetHeading = data.heading;
      player.lastUpdate = now;
    }

    // Handle message display
    if (data.message && data.messageTimestamp) {
      if (player.messageTimeout) {
        clearTimeout(player.messageTimeout);
      }
      if (player.messageSprite) {
        player.group.remove(player.messageSprite);
        player.messageSprite.material.map?.dispose();
        player.messageSprite.material.dispose();
      }

      player.messageSprite = this.createMessageSprite(data.message);
      player.group.add(player.messageSprite);

      player.messageTimeout = window.setTimeout(() => {
        if (player.messageSprite) {
          player.group.remove(player.messageSprite);
          player.messageSprite.material.map?.dispose();
          player.messageSprite.material.dispose();
          player.messageSprite = undefined;
        }
      }, 4000);
    }
  }

  public broadcast(x: number, y: number, z: number, heading: number, state: "walking" | "driving") {
    if (!this.client || !this.client.connected) return;

    const now = Date.now();
    if (now - this.lastBroadcastTime > this.broadcastInterval) {
      const payload = {
        id: this.myId,
        x,
        y,
        z,
        heading,
        state,
        timestamp: now,
      };
      this.client.publish(this.topic, JSON.stringify(payload), { qos: 0 });
      this.lastBroadcastTime = now;
    }
  }

  public broadcastMessage(message: string) {
    if (!this.client || !this.client.connected) return;

    const now = Date.now();
    const payload = {
      id: this.myId,
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      state: "walking",
      timestamp: now,
      message,
      messageTimestamp: now,
    };
    this.client.publish(this.topic, JSON.stringify(payload), { qos: 0 });
  }

  private createMessageSprite(message: string): Sprite {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 256;
    canvas.height = 64;

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, 256, 64);

    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 255, 63);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Courier New";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const maxWidth = 240;
    let text = message;
    if (ctx.measureText(text).width > maxWidth) {
      text = text.substring(0, Math.floor(message.length * 0.7)) + "...";
    }
    ctx.fillText(text, 128, 32);

    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture });
    const sprite = new Sprite(material);
    sprite.scale.set(6, 1.5, 1);
    sprite.position.y = 5;

    return sprite;
  }

  public update(_dt: number) {
    const now = Date.now();
    const timeout = 5000;

    for (const [id, player] of this.players.entries()) {
      if (now - player.lastUpdate > timeout) {
        this.removePlayerGroup(player.group);
        this.players.delete(id);
        continue;
      }

      // Interpolate position
      player.group.position.lerp(player.targetPos, 0.2);

      // Interpolate rotation smoothly
      const currentH = player.group.rotation.y;
      const targetH = player.targetHeading;

      // shortest path angle wrap
      let diff = targetH - currentH;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      player.group.rotation.y += diff * 0.2;
    }
  }

  public dispose() {
    if (this.client) {
      this.client.end();
    }
    for (const player of this.players.values()) {
      if (player.messageTimeout) {
        clearTimeout(player.messageTimeout);
      }
      if (player.messageSprite) {
        player.messageSprite.material.map?.dispose();
        player.messageSprite.material.dispose();
      }
      this.removePlayerGroup(player.group);
    }
    this.players.clear();
  }

  private removePlayerGroup(group: Group) {
    this.scene.remove(group);
    group.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      } else if (child instanceof Sprite) {
        if (child.material) {
          if ((child.material as SpriteMaterial).map) {
            ((child.material as SpriteMaterial).map as CanvasTexture)?.dispose();
          }
          child.material.dispose();
        }
      }
    });
  }
}
