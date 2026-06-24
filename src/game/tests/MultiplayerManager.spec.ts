import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scene, Group } from 'three';
import { MultiplayerManager } from '../MultiplayerManager';

let mockMqttClient: {
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
  publish: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  connected: boolean;
};
let onConnectCallback: () => void;
let onMessageCallback: (topic: string, message: Buffer) => void;

vi.mock('mqtt', () => ({
  default: {
    connect: vi.fn(() => {
      mockMqttClient = {
        on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'connect') onConnectCallback = cb as () => void;
          if (event === 'message')
            onMessageCallback = cb as (topic: string, message: Buffer) => void;
        }),
        subscribe: vi.fn(),
        publish: vi.fn(),
        end: vi.fn(),
        connected: false,
      };
      return mockMqttClient;
    }),
  },
}));

vi.mock('../CarFactory', () => ({
  CarFactory: class {
    createCar = vi.fn(() => new Group());
  },
}));

describe('MultiplayerManager', () => {
  let scene: Scene;
  let manager: MultiplayerManager;

  beforeEach(() => {
    scene = {
      add: vi.fn(),
      remove: vi.fn(),
    } as unknown as Scene;
    manager = new MultiplayerManager(scene);
  });

  afterEach(() => {
    manager.dispose();
  });

  it('connects to MQTT broker', () => {
    manager.connect();
    expect(mockMqttClient.on).toHaveBeenCalled();
  });

  it('subscribes to topic on connect', () => {
    manager.connect();
    onConnectCallback();
    expect(mockMqttClient.subscribe).toHaveBeenCalledWith('toille-vue/cyberpunk/players');
  });

  it('handles remote player messages', () => {
    manager.connect();
    const message = JSON.stringify({
      id: 'remote123',
      x: 100,
      y: 50,
      z: 200,
      heading: 1.5,
      state: 'walking',
      timestamp: Date.now(),
    });
    onMessageCallback('toille-vue/cyberpunk/players', Buffer.from(message));
    expect(scene.add).toHaveBeenCalled();
  });

  it('ignores own messages', () => {
    manager.connect();
    const myId = (manager as unknown as { myId: string }).myId;
    const message = JSON.stringify({
      id: myId,
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      state: 'walking',
      timestamp: Date.now(),
    });
    onMessageCallback('toille-vue/cyberpunk/players', Buffer.from(message));
    expect(scene.add).not.toHaveBeenCalled();
  });

  it('ignores malformed messages', () => {
    manager.connect();
    onMessageCallback('toille-vue/cyberpunk/players', Buffer.from('invalid json'));
  });

  it('broadcasts player state', () => {
    manager.connect();
    onConnectCallback();
    mockMqttClient.connected = true;
    manager.broadcast(10, 20, 30, 0, 'walking');
    expect(mockMqttClient.publish).toHaveBeenCalled();
  });

  it('does not broadcast when not connected', () => {
    manager.connect();
    manager.broadcast(10, 20, 30, 0, 'walking');
    expect(mockMqttClient.publish).not.toHaveBeenCalled();
  });

  it('dispose cleans up', () => {
    manager.connect();
    manager.dispose();
    expect(mockMqttClient.end).toHaveBeenCalled();
  });
});
