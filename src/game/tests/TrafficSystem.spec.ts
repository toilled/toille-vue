import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrafficSystem } from "../TrafficSystem";
import { Scene, Mesh } from "three";

describe("TrafficSystem", () => {
  let scene: Scene;
  let trafficSystem: TrafficSystem;
  let spawnSparks: (pos: { x: number; y: number; z: number }) => void;

  beforeEach(() => {
    scene = new Scene();
    spawnSparks = vi.fn();
    trafficSystem = new TrafficSystem(scene, 10, spawnSparks);
  });

  it("should initialize cars including police cars", () => {
    const cars = trafficSystem.getCars();
    // 10 cars + 3 police cars = 13
    expect(cars.length).toBe(13);

    const policeCars = cars.filter((c) => c.userData.isPolice);
    expect(policeCars.length).toBe(3);

    // Check police car setup
    const policeCar = policeCars[0];
    let hasRedLight = false;
    let hasBlueLight = false;

    policeCar.traverse((child) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = child as any;
      if (c.userData?.isPoliceFlasher && c.color) {
        if (c.color.getHex() === 0xff0000) hasRedLight = true;
        if (c.color.getHex() === 0x0000ff) hasBlueLight = true;
      }
    });

    expect(hasRedLight).toBe(true);
    expect(hasBlueLight).toBe(true);
  });

  it("should update and flash lights", () => {
    const policeCar = trafficSystem.getCars().find((c) => c.userData.isPolice);
    expect(policeCar).toBeDefined();

    // Mock Date.now to control flashing
    const initialTime = 1000;
    vi.spyOn(Date, "now").mockReturnValue(initialTime);

    trafficSystem.update();

    // Check initial state
    // time 1000 / 150 = 6.66 -> 6 % 2 = 0 -> isRedOn = true
    // Red light should be visible, Blue light hidden

    let redLight: Mesh | undefined;
    let blueLight: Mesh | undefined;

    policeCar!.traverse((child) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = child as any;
      if (c.userData?.isPoliceFlasher && c.color) {
        if (c.color.getHex() === 0xff0000) redLight = c;
        if (c.color.getHex() === 0x0000ff) blueLight = c;
      }
    });

    expect(redLight).toBeDefined();
    expect(blueLight).toBeDefined();
    expect(redLight!.visible).toBe(true);
    expect(blueLight!.visible).toBe(false);

    // Advance time to toggle
    // 1000 + 150 = 1150. 1150/150 = 7.66 -> 7 % 2 = 1 -> isRedOn = false
    vi.spyOn(Date, "now").mockReturnValue(initialTime + 155);

    trafficSystem.update();

    expect(redLight!.visible).toBe(false);
    expect(blueLight!.visible).toBe(true);
  });

  it("should execute update without errors", () => {
    expect(() => trafficSystem.update()).not.toThrow();
  });
});
