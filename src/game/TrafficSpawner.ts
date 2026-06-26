import {
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Scene,
  SpotLight,
} from 'three';
import { CELL_SIZE, CITY_SIZE, GRID_SIZE, ROAD_WIDTH, START_OFFSET } from './config';
import { getHeight } from '../utils/HeightMap';
import { CarFactory } from './CarFactory';

const _matrix = new Matrix4();
const _color = new Color();
const invisibleParts = new Set(['hitbox', 'underglow', 'lightbar', 'flasher']);

export class TrafficSpawner {
  private scene: Scene;
  private carFactory: CarFactory;
  public cars: Group[];
  private carCount: number;
  public spawnSparks: (pos: { x: number; y: number; z: number }) => void;

  private bodyMesh!: InstancedMesh;
  private cabMesh!: InstancedMesh;
  private trailerMesh!: InstancedMesh;
  private wheelMesh!: InstancedMesh;
  private tailLightMesh!: InstancedMesh;
  private headLightMesh!: InstancedMesh;

  constructor(
    scene: Scene,
    carFactory: CarFactory,
    cars: Group[],
    carCount: number,
    spawnSparks: (pos: { x: number; y: number; z: number }) => void
  ) {
    this.scene = scene;
    this.carFactory = carFactory;
    this.cars = cars;
    this.carCount = carCount;
    this.spawnSparks = spawnSparks;
  }

  public initCars() {
    const policeCount = 3;
    const totalCars = this.carCount + policeCount;

    for (let i = 0; i < totalCars; i++) {
      const isPolice = i >= this.carCount;
      const carGroup = this.carFactory.createCar(isPolice);

      this.resetCar(carGroup);
      this.scene.add(carGroup);
      this.cars.push(carGroup);
    }
  }

  public createInstanceMeshes() {
    const total = this.cars.length;
    const f = this.carFactory;

    const instanceBodyMat = new MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.7,
    });

    this.bodyMesh = new InstancedMesh(f.carGeo, instanceBodyMat, total);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.frustumCulled = false;
    this.scene.add(this.bodyMesh);

    this.cabMesh = new InstancedMesh(f.truckCabGeo, instanceBodyMat, total);
    this.cabMesh.castShadow = true;
    this.cabMesh.frustumCulled = false;
    this.scene.add(this.cabMesh);

    this.trailerMesh = new InstancedMesh(f.truckTrailerGeo, instanceBodyMat, total);
    this.trailerMesh.castShadow = true;
    this.trailerMesh.frustumCulled = false;
    this.scene.add(this.trailerMesh);

    this.wheelMesh = new InstancedMesh(f.wheelGeo, f.wheelMat, total * 6);
    this.wheelMesh.castShadow = true;
    this.wheelMesh.frustumCulled = false;
    this.scene.add(this.wheelMesh);

    this.tailLightMesh = new InstancedMesh(f.tailLightGeo, f.tailLightMat, total * 2);
    this.tailLightMesh.frustumCulled = false;
    this.scene.add(this.tailLightMesh);

    this.headLightMesh = new InstancedMesh(f.headLightGeo, f.headLightMat, total * 2);
    this.headLightMesh.frustumCulled = false;
    this.scene.add(this.headLightMesh);
  }

  private processCarPart(
    child: Mesh,
    car: Group,
    renderAsGroup: boolean,
    counters: Record<string, number>
  ) {
    const partType = child.userData.partType as string | undefined;
    if (!partType) return;

    if (invisibleParts.has(partType)) {
      child.visible = renderAsGroup;
      return;
    }

    if (renderAsGroup) {
      child.visible = true;
      return;
    }

    child.visible = false;
    _matrix.copy(child.matrixWorld);
    const color = car.userData.bodyColor || 0x222222;
    _color.copy(color);

    const handler = this.partDispatch[partType as keyof typeof this.partDispatch];
    if (handler) handler(counters);
  }

  private partDispatch: Record<string, (counters: Record<string, number>) => void> = {
    body: (c) => {
      this.bodyMesh.setMatrixAt(c.bodyIdx++, _matrix);
      this.bodyMesh.setColorAt(c.bodyIdx - 1, _color);
    },
    cab: (c) => {
      this.cabMesh.setMatrixAt(c.cabIdx++, _matrix);
      this.cabMesh.setColorAt(c.cabIdx - 1, _color);
    },
    trailer: (c) => {
      this.trailerMesh.setMatrixAt(c.trailerIdx++, _matrix);
      this.trailerMesh.setColorAt(c.trailerIdx - 1, _color);
    },
    wheel: (c) => {
      this.wheelMesh.setMatrixAt(c.wheelIdx++, _matrix);
    },
    taillight: (c) => {
      this.tailLightMesh.setMatrixAt(c.tlIdx++, _matrix);
    },
    headlight: (c) => {
      this.headLightMesh.setMatrixAt(c.hlIdx++, _matrix);
    },
  };

  private updateInstanceCount(mesh: InstancedMesh, count: number) {
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  public syncCarInstances(activeCar: Group | null) {
    const counters = { bodyIdx: 0, cabIdx: 0, trailerIdx: 0, wheelIdx: 0, tlIdx: 0, hlIdx: 0 };

    for (const car of this.cars) {
      const renderAsGroup =
        car === activeCar || car.userData.fading || car.userData.isPlayerControlled;
      car.updateWorldMatrix(true, true);

      car.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        this.processCarPart(child, car, renderAsGroup, counters);
      });
    }

    this.updateInstanceCount(this.bodyMesh, counters.bodyIdx);
    this.updateInstanceCount(this.cabMesh, counters.cabIdx);
    this.updateInstanceCount(this.trailerMesh, counters.trailerIdx);
    this.updateInstanceCount(this.wheelMesh, counters.wheelIdx);
    this.updateInstanceCount(this.tailLightMesh, counters.tlIdx);
    this.updateInstanceCount(this.headLightMesh, counters.hlIdx);
  }

  public addLightsToCar(car: Group) {
    const isTruck = !!car.userData.isTruck;
    const yPos = isTruck ? 4 : 2;
    const zFront = isTruck ? 8 : 4;
    const zBack = isTruck ? -10 : -4;
    const xOffset = isTruck ? 2 : 1.5;

    this.addHeadlights(car, xOffset, yPos, zFront);
    this.addTaillights(car, xOffset, yPos, zBack);
  }

  private addHeadlights(car: Group, xOffset: number, yPos: number, zFront: number) {
    const hlColor = 0xffffaa;
    const hlIntensity = 800;
    const hlDist = 800;
    const hlAngle = Math.PI / 4.5;
    const hlPenumbra = 0.2;
    const hlTargetZ = 36;

    this.createSpotLight(
      car,
      xOffset,
      yPos,
      zFront,
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      hlTargetZ
    );
    this.createSpotLight(
      car,
      -xOffset,
      yPos,
      zFront,
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      hlTargetZ
    );
  }

  private addTaillights(car: Group, xOffset: number, yPos: number, zBack: number) {
    const tlColor = 0xff0000;
    const tlIntensity = 50;
    const tlDist = 50;
    const tlAngle = Math.PI / 2.5;
    const tlTargetZ = -16;

    this.createSpotLight(
      car,
      xOffset,
      yPos,
      zBack,
      tlColor,
      tlIntensity,
      tlDist,
      tlAngle,
      0.5,
      tlTargetZ
    );
    this.createSpotLight(
      car,
      -xOffset,
      yPos,
      zBack,
      tlColor,
      tlIntensity,
      tlDist,
      tlAngle,
      0.5,
      tlTargetZ
    );
  }

  private createSpotLight(
    car: Group,
    x: number,
    y: number,
    z: number,
    color: number,
    intensity: number,
    distance: number,
    angle: number,
    penumbra: number,
    targetZOffset: number
  ) {
    const light = new SpotLight(color, intensity, distance, angle, penumbra, 1);
    light.position.set(x, y, z);
    light.castShadow = false;
    light.userData.isCarLight = true;

    const target = new Object3D();
    target.position.set(x, -10, z + targetZOffset);
    car.add(target);
    light.target = target;
    car.add(light);
  }

  public removeLightsFromCar(car: Group) {
    const lightsToRemove: Object3D[] = [];
    const targetsToRemove: Object3D[] = [];

    car.traverse((child) => {
      if (child.userData.isCarLight) {
        lightsToRemove.push(child);
        if (child instanceof SpotLight) {
          targetsToRemove.push(child.target);
        }
      }
    });

    lightsToRemove.forEach((l) => {
      car.remove(l);
      if (l instanceof SpotLight) {
        l.dispose();
      }
    });

    targetsToRemove.forEach((t) => car.remove(t));
  }

  private cleanupFadingMaterials(carGroup: Group) {
    if (!carGroup.userData._fadeInitialized) return;
    carGroup.traverse((child) => {
      if (child instanceof Mesh) {
        const mat = child.material;
        const orig = child.userData._originalMaterial as import('three').Material | undefined;
        if (!Array.isArray(mat) && orig) {
          mat.dispose();
          child.material = orig;
          delete child.userData._originalMaterial;
        }
      }
    });
    carGroup.userData._fadeInitialized = false;
  }

  private chooseRoadPosition(): {
    axis: string;
    dir: number;
    x: number;
    z: number;
    laneOffset: number;
  } {
    const axis = Math.random() > 0.5 ? 'x' : 'z';
    const dir = Math.random() > 0.5 ? 1 : -1;
    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0,
      z = 0;
    if (axis === 'x') {
      z = roadCoordinate + laneOffset;
      x = (Math.random() - 0.5) * CITY_SIZE;
    } else {
      x = roadCoordinate + laneOffset;
      z = (Math.random() - 0.5) * CITY_SIZE;
    }
    return { axis, dir, x, z, laneOffset };
  }

  private setCarHeading(carGroup: Group, axis: string, dir: number) {
    if (axis === 'x') {
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }
    carGroup.userData.heading = carGroup.rotation.y;
  }

  public resetCar(carGroup: Group, activeCar?: Group | null) {
    const wasActive = activeCar && carGroup.uuid === activeCar.uuid;
    const isPolice = !!carGroup.userData.isPolice;

    this.cleanupFadingMaterials(carGroup);
    this.removeLightsFromCar(carGroup);

    const { axis, dir, x, z, laneOffset } = this.chooseRoadPosition();
    this.setCarHeading(carGroup, axis, dir);

    carGroup.position.set(x, getHeight(x, z) + 1, z);

    Object.assign(carGroup.userData, {
      speed: isPolice ? 2.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0,
      dir,
      axis,
      laneOffset,
      collided: false,
      fading: false,
      isPlayerHit: false,
      opacity: 1.0,
      isPlayerControlled: false,
      currentSpeed: 0,
      isPolice,
      turnCooldown: 0,
    });

    carGroup.visible = true;
    this.restoreOpacity(carGroup);

    if (wasActive) {
      this.addLightsToCar(carGroup);
    }
  }

  private restoreOpacity(carGroup: Group) {
    carGroup.traverse((child) => {
      if (child instanceof Mesh) {
        const mat = child.material;
        if (!Array.isArray(mat) && child.userData.originalOpacity !== undefined) {
          mat.opacity = child.userData.originalOpacity;
        }
      }
    });
  }
}
