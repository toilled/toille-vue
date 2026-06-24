import { describe, it, expect, vi } from 'vitest';
import { CarFactory } from '../CarFactory';
import { Group, Mesh } from 'three';

vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
  };
});

describe('CarFactory', () => {
  let factory: CarFactory;

  beforeEach(() => {
    factory = new CarFactory();
  });

  it('creates a regular car', () => {
    const car = factory.createCar(false);
    expect(car).toBeInstanceOf(Group);
    const meshes = car.children.filter((c) => c instanceof Mesh);
    expect(meshes.length).toBeGreaterThan(0);
  });

  it('creates a police car with flashers', () => {
    const car = factory.createCar(true);
    expect(car).toBeInstanceOf(Group);
    expect(car.userData.isPolice).toBe(true);
    const hasFlasher = car.children.some((c) => (c as Mesh).userData?.isPoliceFlasher);
    expect(hasFlasher).toBe(true);
  });

  it('creates a truck sometimes', () => {
    let foundTruck = false;
    for (let i = 0; i < 50; i++) {
      const car = factory.createCar(false);
      if (car.userData.isTruck) {
        foundTruck = true;
        break;
      }
    }
    expect(foundTruck).toBe(true);
  });

  it('each car has userData with isPolice and isTruck', () => {
    const car = factory.createCar(true);
    expect(car.userData).toHaveProperty('isPolice');
    expect(car.userData).toHaveProperty('isTruck');
  });
});
