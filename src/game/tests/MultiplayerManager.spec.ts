import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scene, Group } from 'three';
import { ref, type Ref } from 'vue';
import { MultiplayerManager } from '../MultiplayerManager';

let mockMqttClient: {
  on: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
  publish: ReturnType<typeof vi.fn>;
  end: ReturnType<typeof vi.fn>;
  connected: boolean;
};
let onConnectCallback: () => void;
let onDisconnectCallback: () => void;
let onMessageCallback: (topic: string, message: Buffer) => void;

vi.mock('mqtt', () => ({
  default: {
    connect: vi.fn(() => {
      mockMqttClient = {
        on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
          if (event === 'connect') onConnectCallback = cb as () => void;
          if (event === 'disconnect') onDisconnectCallback = cb as () => void;
          if (event === 'message')
            onMessageCallback = cb as (topic: string, message: Buffer) => void;
        }),
        subscribe: vi.fn(),
        publish: vi.fn(),
        end: vi.fn(() => {
          mockMqttClient.connected = false;
        }),
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

  let onlineCount: Ref<number>;

  beforeEach(() => {
    scene = {
      add: vi.fn(),
      remove: vi.fn(),
    } as unknown as Scene;
    onlineCount = ref(0);
    manager = new MultiplayerManager(scene, onlineCount);
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

  it('tracks online count on connect and disconnect', () => {
    manager.connect();
    expect(onlineCount.value).toBe(0);
    mockMqttClient.connected = true;
    onConnectCallback();
    expect(onlineCount.value).toBe(1);
    mockMqttClient.connected = false;
    onDisconnectCallback();
    expect(onlineCount.value).toBe(0);
  });

  it('increments online count when remote players join', () => {
    manager.connect();
    mockMqttClient.connected = true;
    onConnectCallback();
    const message = JSON.stringify({
      id: 'remote1',
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      state: 'walking',
      timestamp: Date.now(),
    });
    onMessageCallback('toille-vue/cyberpunk/players', Buffer.from(message));
    expect(onlineCount.value).toBe(2);
  });

  it('decrements online count when remote players time out', () => {
    vi.useFakeTimers();
    manager.connect();
    mockMqttClient.connected = true;
    onConnectCallback();
    const message = JSON.stringify({
      id: 'remote1',
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      state: 'walking',
      timestamp: Date.now(),
    });
    onMessageCallback('toille-vue/cyberpunk/players', Buffer.from(message));
    expect(onlineCount.value).toBe(2);
    vi.advanceTimersByTime(6000);
    manager.update(0);
    expect(onlineCount.value).toBe(1);
    vi.useRealTimers();
  });

  it('dispose resets online count to zero', () => {
    manager.connect();
    mockMqttClient.connected = true;
    onConnectCallback();
    expect(onlineCount.value).toBe(1);
    manager.dispose();
    expect(onlineCount.value).toBe(0);
  });

  it('dispose cleans up', () => {
    manager.connect();
    manager.dispose();
    expect(mockMqttClient.end).toHaveBeenCalled();
  });
});
