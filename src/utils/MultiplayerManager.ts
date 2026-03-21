import type { Scene } from "three";
import {
  Group,
  Vector3,
  Color,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  SpriteMaterial,
  Sprite,
  CanvasTexture,
} from "three";
import Peer, { DataConnection } from "peerjs";

const PEERJS_CONFIG = {
  host: "0.peerjs.com",
  port: 443,
  secure: true,
  path: "/",
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  },
};

export interface PlayerState {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  mode: "exploring" | "driving" | "idle";
  carId?: string;
  heading?: number;
  speed?: number;
  color: string;
  lastUpdate: number;
}

export interface MultiplayerMessage {
  type:
    | "join"
    | "leave"
    | "update"
    | "state"
    | "init"
    | "host"
    | "request-state"
    | "ping"
    | "pong"
    | "new-host";
  playerId?: string;
  player?: PlayerState;
  players?: PlayerState[];
  peerIds?: string[];
}

export type PlayerUpdateCallback = (players: Map<string, RemotePlayer>) => void;
export type ConnectionCallback = (connected: boolean) => void;

export class RemotePlayer {
  public mesh: Group | null = null;
  public sprite: Sprite | null = null;
  public carMesh: Group | null = null;
  public state: PlayerState;
  public targetPosition: Vector3 = new Vector3();
  public targetRotation: number = 0;
  public currentPosition: Vector3 = new Vector3();
  public currentRotation: number = 0;
  public interpolationFactor: number = 0.15;

  constructor(state: PlayerState) {
    this.state = state;
    this.targetPosition = new Vector3(state.x, state.y, state.z);
    this.targetRotation = state.rotation;
    this.currentPosition = this.targetPosition.clone();
    this.currentRotation = this.targetRotation;
  }

  update(_dt: number) {
    this.currentPosition.lerp(this.targetPosition, this.interpolationFactor);
    const rotDiff = this.targetRotation - this.currentRotation;
    const wrappedDiff = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
    this.currentRotation += wrappedDiff * this.interpolationFactor;

    if (this.mesh) {
      this.mesh.position.copy(this.currentPosition);
      if (this.state.mode === "exploring") {
        this.mesh.rotation.y = this.currentRotation;
      }
    }
    if (this.sprite) {
      this.sprite.position.set(
        this.currentPosition.x,
        this.currentPosition.y + 8,
        this.currentPosition.z,
      );
    }
    if (this.carMesh) {
      this.carMesh.position.copy(this.currentPosition);
      if (this.state.heading !== undefined) {
        this.carMesh.rotation.y = this.state.heading;
      }
    }
  }

  updateState(newState: Partial<PlayerState>) {
    this.state = { ...this.state, ...newState };
    this.targetPosition = new Vector3(this.state.x, this.state.y, this.state.z);
    this.targetRotation = this.state.rotation;
  }
}

const PLAYER_COLORS = [
  "#ff00ff",
  "#00ffff",
  "#ffff00",
  "#ff6600",
  "#66ff00",
  "#0066ff",
  "#ff0066",
  "#00ff66",
  "#6600ff",
  "#ff3333",
];

function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

export class MultiplayerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private playerId: string | null = null;
  private playerColor: string = getRandomColor();
  private players: Map<string, RemotePlayer> = new Map();
  private scene: Scene | null = null;
  private updateCallbacks: Set<PlayerUpdateCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private roomId: string = "cyberpunk-city";
  private isConnected: boolean = false;
  private playerName: string = "Player";
  private lastPosition: Vector3 = new Vector3();
  private lastRotation: number = 0;
  private lastMode: string = "idle";
  private lastCarId: string | undefined = undefined;
  private isHost: boolean = false;
  private connectedPeerIds: Set<string> = new Set();
  private peerLastSeen: Map<string, number> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {}

  async connect(
    _serverUrl: string,
    roomId: string = "cyberpunk-city",
    playerName?: string,
  ): Promise<boolean> {
    this.roomId = roomId;
    if (playerName) this.playerName = playerName;

    const hostPeerId = `${this.roomId}-host`;

    return new Promise((resolve) => {
      try {
        this.peer = new Peer(hostPeerId, {
          ...PEERJS_CONFIG,
          debug: 0,
        });

        this.peer.on("open", (id) => {
          this.playerId = id;
          this.isHost = true;
          this.isConnected = true;
          this.notifyConnection(true);
          this.notifyUpdate();
          this.startHeartbeat();
          resolve(true);
        });

        this.peer.on("connection", (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on("error", (err) => {
          if (err.type === "unavailable-id") {
            this.isHost = false;
            this.connectWithRandomId(resolve);
          }
        });

        this.peer.on("disconnected", () => {
          this.isConnected = false;
          this.notifyConnection(false);
        });

        setTimeout(() => {
          if (!this.isConnected) {
            this.connectWithRandomId(resolve);
          }
        }, 3000);
      } catch {
        resolve(false);
      }
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 8000;

      if (this.isHost) {
        this.broadcast({ type: "ping" } as MultiplayerMessage);

        this.peerLastSeen.forEach((lastSeen, peerId) => {
          if (now - lastSeen > timeout) {
            this.connections.delete(peerId);
            this.connectedPeerIds.delete(peerId);
            this.peerLastSeen.delete(peerId);
            if (this.players.has(peerId)) {
              this.removePlayer(peerId);
              this.broadcast({ type: "leave", playerId: peerId }, peerId);
              this.notifyUpdate();
            }
          }
        });
      } else {
        const hostKey = `${this.roomId}-host`;
        const hostConn = this.connections.get(hostKey);
        const lastSeen = this.peerLastSeen.get(hostKey) || 0;
        const timeSinceLastData = now - lastSeen;

        if (!hostConn || timeSinceLastData > timeout) {
          if (hostConn) {
            try {
              hostConn.close();
            } catch {}
            this.connections.delete(hostKey);
          }
          this.connectedPeerIds.delete(hostKey);
          this.peerLastSeen.delete(hostKey);
          this.becomeNewHost();
        }
      }
    }, 3000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private connectWithRandomId(resolve: (value: boolean) => void) {
    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = new Peer({
      ...PEERJS_CONFIG,
      debug: 0,
    });

    this.peer.on("open", (id) => {
      this.playerId = id;
      this.isHost = false;
      this.isConnected = true;
      this.notifyConnection(true);
      this.notifyUpdate();

      const hostPeerId = `${this.roomId}-host`;
      this.connectToHost(hostPeerId, resolve);
    });

    this.peer.on("connection", (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on("error", () => {
      // Ignore errors during fallback connection
    });
  }

  private connectToHost(hostPeerId: string, resolve: (value: boolean) => void) {
    const conn = this.peer!.connect(hostPeerId, {
      reliable: true,
      metadata: { roomId: this.roomId },
    });

    conn.on("open", () => {
      this.handleIncomingConnection(conn);
      this.isConnected = true;
      this.notifyConnection(true);
      this.notifyUpdate();
      this.startHeartbeat();

      setTimeout(() => {
        if (conn.open) {
          conn.send({
            type: "join",
            playerId: this.playerId!,
            player: this.createPlayerState(),
          } as MultiplayerMessage);
        }
      }, 50);

      setTimeout(() => {
        if (conn.open) {
          conn.send({
            type: "request-state",
            playerId: this.playerId!,
          } as MultiplayerMessage);
        }
      }, 150);

      resolve(true);
    });

    conn.on("data", (data) => {
      this.peerLastSeen.set(conn.peer, Date.now());
      this.handleMessage(data as MultiplayerMessage, conn.peer);
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.connectedPeerIds.delete(conn.peer);
      this.peerLastSeen.delete(conn.peer);

      if (this.players.has(conn.peer)) {
        this.removePlayer(conn.peer);
        this.notifyUpdate();
      }

      if (
        !this.isHost &&
        this.connections.size === 0 &&
        this.players.size > 0
      ) {
        this.becomeNewHost();
      }
    });

    conn.on("error", () => {
      this.becomeNewHost();
      resolve(true);
    });
  }

  private becomeNewHost() {
    const oldPlayerId = this.playerId;
    const hostPeerId = `${this.roomId}-host`;

    this.peer = new Peer(hostPeerId, {
      ...PEERJS_CONFIG,
      debug: 0,
    });

    this.peer.on("open", (id) => {
      this.playerId = id;
      this.isHost = true;
      this.startHeartbeat();

      this.broadcast({
        type: "new-host",
        playerId: oldPlayerId,
      } as MultiplayerMessage);

      this.notifyConnection(true);
      this.notifyUpdate();
    });

    this.peer.on("connection", (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on("error", () => {});
  }

  private handleIncomingConnection(conn: DataConnection) {
    const peerId = conn.peer;

    if (this.connections.has(peerId)) {
      return;
    }

    if (!this.isHost && this.players.size > 0) {
      this.becomeNewHost();
    }

    this.connections.set(peerId, conn);
    this.connectedPeerIds.add(peerId);
    this.peerLastSeen.set(peerId, Date.now());

    conn.on("data", (data) => {
      const now = Date.now();
      this.peerLastSeen.set(peerId, now);

      if (this.isHost && (data as MultiplayerMessage).type === "ping") {
        this.sendTo(peerId, {
          type: "pong",
          playerId: this.playerId,
        } as MultiplayerMessage);
      }

      this.handleMessage(data as MultiplayerMessage, peerId);
    });

    conn.on("close", () => {
      this.connections.delete(conn.peer);
      this.connectedPeerIds.delete(conn.peer);
      this.peerLastSeen.delete(conn.peer);
      this.removePlayer(conn.peer);
      this.broadcast({ type: "leave", playerId: conn.peer }, conn.peer);
      this.notifyUpdate();

      if (
        !this.isHost &&
        this.connections.size === 0 &&
        this.players.size > 0
      ) {
        this.becomeNewHost();
      }
    });

    if (this.isHost) {
      const allPlayers = Array.from(this.players.values()).map((p) => p.state);
      setTimeout(() => {
        if (conn.open) {
          conn.send({
            type: "state",
            players: allPlayers,
          } as MultiplayerMessage);
        }
      }, 100);
    }

    if (this.isHost && conn.open) {
      const peerList = Array.from(this.connectedPeerIds);
      setTimeout(() => {
        if (conn.open) {
          conn.send({
            type: "state",
            peerIds: peerList,
          } as MultiplayerMessage);
        }
      }, 100);

      setTimeout(() => {
        if (conn.open) {
          if (!this.players.has(this.playerId!)) {
            const myState = this.createPlayerState();
            const player = new RemotePlayer(myState);
            this.players.set(this.playerId!, player);
          }
          conn.send({
            type: "join",
            playerId: this.playerId!,
            player: this.createPlayerState(),
          } as MultiplayerMessage);
        }
      }, 200);
    }
  }

  private createPlayerState(): PlayerState {
    return {
      id: this.playerId!,
      name: this.playerName,
      x: 0,
      y: 3,
      z: 0,
      rotation: 0,
      mode: "idle",
      color: this.playerColor,
      lastUpdate: Date.now(),
    };
  }

  disconnect() {
    this.stopHeartbeat();
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    this.connectedPeerIds.clear();
    this.peerLastSeen.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.clearPlayers();
    this.isConnected = false;
    this.isHost = false;
    this.notifyConnection(false);
  }

  setScene(scene: Scene) {
    this.scene = scene;
  }

  setPlayerName(name: string) {
    this.playerName = name;
  }

  onPlayerUpdate(callback: PlayerUpdateCallback) {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  private notifyConnection(connected: boolean) {
    this.connectionCallbacks.forEach((cb) => cb(connected));
  }

  private handleMessage(data: MultiplayerMessage, fromPeerId: string) {
    try {
      switch (data.type) {
        case "request-state":
          if (this.isHost) {
            this.sendTo(fromPeerId, {
              type: "join",
              playerId: this.playerId!,
              player: this.createPlayerState(),
            } as MultiplayerMessage);

            const allPlayers = Array.from(this.players.values()).map(
              (p) => p.state,
            );
            this.sendTo(fromPeerId, {
              type: "state",
              players: allPlayers,
            } as MultiplayerMessage);
          }
          break;

        case "state":
          if (!this.isHost) {
            if (data.peerIds) {
              data.peerIds.forEach((peerId) => {
                if (peerId !== this.playerId && !this.connections.has(peerId)) {
                  setTimeout(() => {
                    this.connectToPeer(peerId);
                  }, Math.random() * 1000);
                }
              });
            }
            if (data.players) {
              data.players.forEach((playerState) => {
                this.addPlayer(playerState);
              });
            }
          }
          break;

        case "join":
          if (data.player && data.playerId) {
            this.addPlayer(data.player);

            if (this.isHost) {
              this.broadcast(
                {
                  type: "join",
                  playerId: data.playerId,
                  player: data.player,
                } as MultiplayerMessage,
                fromPeerId,
              );

              this.sendTo(fromPeerId, {
                type: "state",
                peerIds: Array.from(this.connectedPeerIds),
              } as MultiplayerMessage);
            }
          }
          break;

        case "leave":
          if (data.playerId) {
            this.removePlayer(data.playerId);
            this.notifyUpdate();
          }
          break;

        case "update":
          if (data.playerId && data.player) {
            const player = this.players.get(data.playerId);
            if (player) {
              player.updateState(data.player);
            }
          }
          break;

        case "host":
          if (this.isHost && data.player) {
            this.addPlayer(data.player);
            this.broadcast(
              {
                type: "join",
                playerId: data.playerId,
                player: data.player,
              } as MultiplayerMessage,
              fromPeerId,
            );
          }
          break;

        case "ping":
          this.sendTo(fromPeerId, {
            type: "pong",
            playerId: this.playerId,
          } as MultiplayerMessage);
          break;

        case "pong":
          if (data.playerId) {
            this.peerLastSeen.set(data.playerId, Date.now());
          }
          break;

        case "new-host":
          if (data.playerId) {
            this.isHost = false;
          }
          break;
      }

      this.notifyUpdate();
    } catch {
      // Silently ignore message parsing errors
    }
  }

  private connectToPeer(peerId: string) {
    if (
      !this.peer ||
      this.connections.has(peerId) ||
      peerId === this.playerId
    ) {
      return;
    }

    const conn = this.peer.connect(peerId, { reliable: true });

    conn.on("open", () => {
      if (this.connections.has(peerId)) {
        conn.close();
        return;
      }
      this.handleIncomingConnection(conn);
      setTimeout(() => {
        if (conn.open) {
          conn.send({
            type: "join",
            playerId: this.playerId!,
            player: this.createPlayerState(),
          } as MultiplayerMessage);
        }
      }, 100);
    });

    conn.on("error", () => {
      // Silently ignore peer connection errors
    });
  }

  private addPlayer(state: PlayerState) {
    if (state.id === this.playerId) return;
    if (this.players.has(state.id)) return;

    const player = new RemotePlayer(state);
    this.players.set(state.id, player);

    if (this.scene) {
      this.createPlayerMesh(player, state);
    }

    this.notifyUpdate();
  }

  private removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (player && this.scene) {
      if (player.mesh) this.scene.remove(player.mesh);
      if (player.sprite) this.scene.remove(player.sprite);
      if (player.carMesh) this.scene.remove(player.carMesh);
    }
    this.players.delete(playerId);
    this.notifyUpdate();
  }

  private createPlayerMesh(player: RemotePlayer, state: PlayerState) {
    const color = new Color(state.color);

    const group = new Group();

    const bodyGeo = new BoxGeometry(3, 6, 3);
    const bodyMat = new MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const body = new Mesh(bodyGeo, bodyMat);
    body.position.y = 3;
    body.castShadow = true;
    group.add(body);

    const headGeo = new BoxGeometry(2, 2, 2);
    const headMat = new MeshStandardMaterial({ color: 0x222222 });
    const head = new Mesh(headGeo, headMat);
    head.position.y = 7;
    head.castShadow = true;
    group.add(head);

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = state.color;
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText(state.name, 128, 40);

      const texture = new CanvasTexture(canvas);
      const spriteMat = new SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new Sprite(spriteMat);
      sprite.scale.set(16, 4, 1);
      sprite.position.set(state.x, state.y + 12, state.z);
      this.scene!.add(sprite);
      player.sprite = sprite;
    }

    this.scene!.add(group);
    player.mesh = group;
    player.currentPosition = new Vector3(state.x, state.y, state.z);
  }

  update(
    dt: number,
    position: Vector3,
    rotation: number,
    mode: "exploring" | "driving" | "idle",
    carId?: string,
    heading?: number,
    speed?: number,
  ) {
    const hasMoved =
      position.distanceTo(this.lastPosition) > 0.1 ||
      Math.abs(rotation - this.lastRotation) > 0.01 ||
      mode !== this.lastMode ||
      carId !== this.lastCarId;

    if (hasMoved && this.isConnected) {
      const playerUpdate: PlayerState = {
        id: this.playerId!,
        name: this.playerName,
        x: position.x,
        y: position.y,
        z: position.z,
        rotation: rotation,
        mode: mode,
        color: this.playerColor,
        lastUpdate: Date.now(),
      };
      if (carId) playerUpdate.carId = carId;
      if (heading !== undefined) playerUpdate.heading = heading;
      if (speed !== undefined) playerUpdate.speed = speed;

      const message: MultiplayerMessage = {
        type: "update",
        playerId: this.playerId!,
        player: playerUpdate,
      };
      this.broadcast(message);

      this.lastPosition = position.clone();
      this.lastRotation = rotation;
      this.lastMode = mode;
      this.lastCarId = carId;
    }

    this.players.forEach((player) => player.update(dt));
    this.notifyUpdate();
  }

  private sendTo(peerId: string, message: MultiplayerMessage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      try {
        conn.send(message);
      } catch {
        // Silently ignore send errors
      }
    }
  }

  private broadcast(message: MultiplayerMessage, excludePeerId?: string) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        try {
          conn.send(message);
        } catch {
          // Silently ignore broadcast errors
        }
      }
    });
  }

  getPlayers(): Map<string, RemotePlayer> {
    return this.players;
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  isNetworkConnected(): boolean {
    return this.isConnected;
  }

  getPlayerCount(): number {
    return this.players.size + (this.playerId ? 1 : 0);
  }

  private clearPlayers() {
    this.players.forEach((player) => {
      if (this.scene) {
        if (player.mesh) this.scene.remove(player.mesh);
        if (player.sprite) this.scene.remove(player.sprite);
        if (player.carMesh) this.scene.remove(player.carMesh);
      }
    });
    this.players.clear();
    this.notifyUpdate();
  }

  private notifyUpdate() {
    this.updateCallbacks.forEach((cb) => cb(this.players));
  }
}

export const multiplayerManager = new MultiplayerManager();
