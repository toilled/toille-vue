import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrafficSystem } from '../TrafficSystem';
import { Scene } from 'three';

describe('TrafficSystem', () => {
  let scene: Scene;
  let trafficSystem: TrafficSystem;
  let occupiedGrids: Map<string, { halfW: number; halfD: number }>;
  let spawnSparks: any;

  beforeEach(() => {
    scene = new Scene();
    occupiedGrids = new Map();
    spawnSparks = vi.fn();
    trafficSystem = new TrafficSystem(scene, 10, occupiedGrids, spawnSparks);
  });

  it('should initialize cars including police cars', () => {
    const cars = trafficSystem.getCars();
    // 10 cars + 3 police cars = 13
    expect(cars.length).toBe(13);

    const policeCars = cars.filter(c => c.userData.isPolice);
    expect(policeCars.length).toBe(3);

    // Check police car setup
    const policeCar = policeCars[0];
    let hasRedLight = false;
    let hasBlueLight = false;

    policeCar.traverse((child: any) => {
        if (child.userData.isPoliceFlasher && child.color) {
            if (child.color.getHex() === 0xff0000) hasRedLight = true;
            if (child.color.getHex() === 0x0000ff) hasBlueLight = true;
        }
    });

    expect(hasRedLight).toBe(true);
    expect(hasBlueLight).toBe(true);
  });

  it('should update and flash lights', () => {
      const policeCar = trafficSystem.getCars().find(c => c.userData.isPolice);
      expect(policeCar).toBeDefined();

      // Mock Date.now to control flashing
      const initialTime = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(initialTime);

      trafficSystem.update();

      // Check initial state
      // time 1000 / 150 = 6.66 -> 6 % 2 = 0 -> isRedOn = true
      // Red light should be visible, Blue light hidden

      let redLight: any;
      let blueLight: any;

      policeCar!.traverse((child: any) => {
          if (child.userData.isPoliceFlasher && child.color) {
              if (child.color.getHex() === 0xff0000) redLight = child;
              if (child.color.getHex() === 0x0000ff) blueLight = child;
          }
      });

      expect(redLight.visible).toBe(true);
      expect(blueLight.visible).toBe(false);

      // Advance time to toggle
      // 1000 + 150 = 1150. 1150/150 = 7.66 -> 7 % 2 = 1 -> isRedOn = false
      vi.spyOn(Date, 'now').mockReturnValue(initialTime + 155);

      trafficSystem.update();

      expect(redLight.visible).toBe(false);
      expect(blueLight.visible).toBe(true);
  });

  it('should execute update without errors', () => {
      expect(() => trafficSystem.update()).not.toThrow();
  });
});
