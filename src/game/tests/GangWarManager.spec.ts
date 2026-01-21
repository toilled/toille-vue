import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GangWarManager } from '../GangWarManager';
import { Scene, Vector3, Mesh } from 'three';

// Mock Three.js classes that aren't fully mocked in setupThree
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    CylinderGeometry: class {
        rotateX = vi.fn();
    },
    SphereGeometry: class {},
    BoxGeometry: class {},
    MeshBasicMaterial: class {},
    Mesh: class {
      position = new Vector3();
      rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
      material = { color: { setHex: vi.fn() } };
      add = vi.fn();
      lookAt = vi.fn();
      userData = {};
      constructor() {}
    },
    Group: class {
      position = new Vector3();
      rotation = { x: 0, y: 0, z: 0, set: vi.fn() };
      add = vi.fn();
      lookAt = vi.fn();
    },
    Vector3: class {
      x = 0; y = 0; z = 0;
      constructor(x=0, y=0, z=0) { this.x = x; this.y = y; this.z = z; }
      set(x: any, y: any, z: any) { this.x = x; this.y = y; this.z = z; return this; }
      clone() { return new (this.constructor as any)(this.x, this.y, this.z); }
      copy(v: any) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
      add(v: any) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
      sub(v: any) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
      multiplyScalar(s: any) { this.x *= s; this.y *= s; this.z *= s; return this; }
      divideScalar(s: any) { this.x /= s; this.y /= s; this.z /= s; return this; }
      normalize() { return this; }
      distanceToSquared(v: any) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx*dx + dy*dy + dz*dz;
      }
    }
  };
});

describe('GangWarManager', () => {
  let scene: Scene;
  let manager: GangWarManager;
  let spawnSparks: any;
  let playPewSound: any;

  beforeEach(() => {
    scene = {
      add: vi.fn(),
      remove: vi.fn(),
    } as any;
    spawnSparks = vi.fn();
    playPewSound = vi.fn();

    manager = new GangWarManager(scene, spawnSparks, playPewSound);
  });

  it('should initialize with warriors', () => {
    // 4 gangs * 20 warriors = 80
    expect(manager.warriors.length).toBe(80);
    expect(scene.add).toHaveBeenCalledTimes(80); // Groups added to scene
  });

  it('should update warriors and create projectiles', () => {
    // Force warriors close to each other
    manager.warriors[0].group.position.set(0, 0, 0);
    manager.warriors[1].group.position.set(10, 0, 0);
    manager.warriors[1].gangId = (manager.warriors[0].gangId + 1) % 4; // Ensure enemy

    // Update to trigger target finding and shooting
    manager.update(0.1);

    // Check if target found
    expect(manager.warriors[0].target).toBeDefined();

    // Force cooldown to 0 to ensure shooting
    manager.warriors[0].cooldown = 0;
    manager.updateCombat(manager.warriors[0], 0.1);

    expect(manager.projectiles.length).toBeGreaterThan(0);
    expect(scene.add).toHaveBeenCalled(); // Projectile added
  });

  it('should respawn warriors when count is low', () => {
     // Kill all warriors of gang 0
     const gang0Warriors = manager.warriors.filter(w => w.gangId === 0);
     gang0Warriors.forEach(w => w.state = "DEAD");

     const initialCount = manager.warriors.length;

     manager.checkReinforcements();

     expect(manager.warriors.length).toBeGreaterThan(initialCount);

     // Should have added 10 new ones
     const newGang0Warriors = manager.warriors.filter(w => w.gangId === 0 && w.state !== "DEAD");
     expect(newGang0Warriors.length).toBe(10);
  });

  it('should create fight markers for combat clusters', () => {
      // Setup a cluster of 4 warriors in COMBAT
      manager.warriors[0].group.position.set(0,0,0);
      manager.warriors[1].group.position.set(5,0,0);
      manager.warriors[2].group.position.set(0,0,5);
      manager.warriors[3].group.position.set(5,0,5);

      [0,1,2,3].forEach(i => {
          manager.warriors[i].state = "COMBAT";
          manager.warriors[i].hp = 3;
      });

      // Force update markers
      manager.lastMarkerUpdate = 10;
      manager.updateFightMarkers(0.1);

      expect(manager.fightMarkers.length).toBe(1);
      const marker = manager.fightMarkers[0];
      expect(marker.userData.isFightMarker).toBe(true);

      // Centroid should be around 2.5, 0, 2.5
      expect(marker.position.x).toBeCloseTo(2.5);
      expect(marker.position.z).toBeCloseTo(2.5);
      expect(scene.add).toHaveBeenCalled();
  });

  it('should handle damage and death', () => {
      const w1 = manager.warriors[0];
      const w2 = manager.warriors[1];
      w2.gangId = (w1.gangId + 1) % 4;

      w1.group.position.set(0,0,0);
      w2.group.position.set(2,0,0); // Close

      // Manually trigger a shoot to ensure projectile exists
      // We need to mock Math.random to ensure it shoots sound (probability 0.3)
      // Actually code says if (Math.random() > 0.7)

      // Spy on Math.random
      const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9); // Ensure > 0.7

      manager.shoot(w2, w1);

      // Should play sound with position of SHOOTER (w2)
      // w2 is at 2,0,0 ?
      // In setup: w2.group.position.set(2,0,0);
      // shoot uses startPos = shooter.group.position.clone() and adds gun height (y+=0.8)
      expect(playPewSound).toHaveBeenCalledWith(expect.objectContaining({ x: 2, y: 0.8, z: 0 }));

      const proj = manager.projectiles[0];

      randSpy.mockRestore();

      // Move projectile to hit w1
      // Need to move it enough so that during update loop it is detected
      // The update loop adds velocity * dt to position
      // So set position so that next frame it is close

      // Override velocity to be zero for test control or just position it right
      proj.mesh.position.set(0,0,0);
      proj.velocity.set(0,0,0);

      // Force update to check collision
      manager.update(0.1);

      expect(spawnSparks).toHaveBeenCalled();
      // HP starts at 3, damage is 1
      expect(w1.hp).toBe(2);

      // Kill
      manager.damageWarrior(w1, 10);
      expect(w1.state).toBe("DEAD");
      expect(w1.group.rotation.x).toBe(Math.PI/2);
  });
});
