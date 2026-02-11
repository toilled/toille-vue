import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
  SpotLight,
  DoubleSide,
  PointLight,
  CylinderGeometry,
} from "three";
import {
  BOUNDS,
  CELL_SIZE,
  CITY_SIZE,
  GRID_SIZE,
  ROAD_WIDTH,
  START_OFFSET,
} from "./config";
import { carAudio } from "./audio/CarAudio";
import { getHeight, getNormal } from "../utils/HeightMap";

export class TrafficSystem {
  private scene: Scene;
  private cars: Group[] = [];
  private carCount: number;
  private occupiedGrids: Map<string, { halfW: number; halfD: number }>;
  private spawnSparks: (pos: any) => void;

  constructor(
    scene: Scene,
    carCount: number,
    occupiedGrids: Map<string, { halfW: number; halfD: number }>,
    spawnSparks: (pos: any) => void
  ) {
    this.scene = scene;
    this.carCount = carCount;
    this.occupiedGrids = occupiedGrids;
    this.spawnSparks = spawnSparks;
    this.initCars();
  }

  public getCars(): Group[] {
    return this.cars;
  }

  private initCars() {
    const carGeo = new BoxGeometry(4, 2, 8);
    const tailLightGeo = new BoxGeometry(0.5, 0.5, 0.1);
    const headLightGeo = new BoxGeometry(0.5, 0.5, 0.1);
    const wheelGeo = new CylinderGeometry(0.8, 0.8, 0.5, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const carBodyMat1 = new MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
    const carBodyMat2 = new MeshStandardMaterial({ color: 0x050505, roughness: 0.3, metalness: 0.7 });
    const carBodyMat3 = new MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.7 });
    const policeBodyMat = new MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 0.5 }); // White-ish

    const wheelMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });

    const lightBarGeo = new BoxGeometry(2, 0.5, 0.5);
    const lightBarMat = new MeshBasicMaterial({ color: 0x000000 });

    const underglowGeo = new PlaneGeometry(5, 9);
    const underglowMat1 = new MeshBasicMaterial({
      color: 0xff00cc,
      opacity: 0.5,
      transparent: true,
      side: DoubleSide,
    });
    const underglowMat2 = new MeshBasicMaterial({
      color: 0x00ccff,
      opacity: 0.5,
      transparent: true,
      side: DoubleSide,
    });

    const tailLightMat = new MeshBasicMaterial({ color: 0xff0000 });
    const headLightMat = new MeshBasicMaterial({ color: 0xffffaa });

    const hitboxGeo = new BoxGeometry(20, 20, 30);
    const hitboxMat = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      visible: true,
    });

    const policeCount = 3;
    const totalCars = this.carCount + policeCount; // Add police cars on top of count

    for (let i = 0; i < totalCars; i++) {
      const isPolice = i >= this.carCount; // Last few are police
      let bodyMat;

      if (isPolice) {
        bodyMat = policeBodyMat.clone();
      } else {
        const isSpecial = Math.random() > 0.8;
        bodyMat = (
          isSpecial
            ? carBodyMat1
            : Math.random() > 0.5
            ? carBodyMat2
            : carBodyMat3
        ).clone();
      }
      bodyMat.transparent = true;

      const carGroup = new Group();

      const carBody = new Mesh(carGeo, bodyMat);
      carBody.userData.originalOpacity = 1.0;
      carBody.castShadow = true;
      carGroup.add(carBody);

      // Wheels
      const w1 = new Mesh(wheelGeo, wheelMat);
      w1.position.set(2, -0.5, 2.5);
      w1.userData.originalOpacity = 1.0;
      w1.castShadow = true;
      carGroup.add(w1);

      const w2 = new Mesh(wheelGeo, wheelMat);
      w2.position.set(-2, -0.5, 2.5);
      w2.userData.originalOpacity = 1.0;
      w2.castShadow = true;
      carGroup.add(w2);

      const w3 = new Mesh(wheelGeo, wheelMat);
      w3.position.set(2, -0.5, -2.5);
      w3.userData.originalOpacity = 1.0;
      w3.castShadow = true;
      carGroup.add(w3);

      const w4 = new Mesh(wheelGeo, wheelMat);
      w4.position.set(-2, -0.5, -2.5);
      w4.userData.originalOpacity = 1.0;
      w4.castShadow = true;
      carGroup.add(w4);

      if (isPolice) {
        // Police Light Bar
        const lb = new Mesh(lightBarGeo, lightBarMat);
        lb.position.set(0, 1.25, 0);
        lb.userData.originalOpacity = 1.0;
        carGroup.add(lb);

        // Flashing Lights
        const flIntensity = 200;
        const flDist = 100;

        const redLight = new PointLight(0xff0000, flIntensity, flDist);
        redLight.position.set(-0.8, 1.5, 0);
        redLight.userData.isPoliceFlasher = true;
        redLight.visible = false;
        carGroup.add(redLight);

        const blueLight = new PointLight(0x0000ff, flIntensity, flDist);
        blueLight.position.set(0.8, 1.5, 0);
        blueLight.userData.isPoliceFlasher = true;
        blueLight.visible = false;
        carGroup.add(blueLight);

        // Emissive meshes for the lightbar
        const redMesh = new Mesh(new BoxGeometry(0.8, 0.4, 0.4), new MeshBasicMaterial({ color: 0xff0000 }));
        redMesh.position.set(-0.8, 1.5, 0);
        redMesh.userData.isPoliceFlasherMesh = true;
        redMesh.visible = false;
        carGroup.add(redMesh);

        const blueMesh = new Mesh(new BoxGeometry(0.8, 0.4, 0.4), new MeshBasicMaterial({ color: 0x0000ff }));
        blueMesh.position.set(0.8, 1.5, 0);
        blueMesh.userData.isPoliceFlasherMesh = true;
        blueMesh.visible = false;
        carGroup.add(blueMesh);
      } else {
        if (Math.random() > 0.3) {
          const underglowMat = (
            Math.random() > 0.5 ? underglowMat1 : underglowMat2
          ).clone();
          const underglow = new Mesh(underglowGeo, underglowMat);
          underglow.userData.originalOpacity = 0.5;
          underglow.rotation.x = Math.PI / 2;
          underglow.position.y = -0.9;
          carGroup.add(underglow);
        }
      }

      const tlMat = tailLightMat.clone();
      tlMat.transparent = true;
      const tl1 = new Mesh(tailLightGeo, tlMat);
      tl1.userData.originalOpacity = 1.0;
      tl1.position.set(1.5, 0, -4);
      carGroup.add(tl1);

      const tl2 = new Mesh(tailLightGeo, tlMat);
      tl2.userData.originalOpacity = 1.0;
      tl2.position.set(-1.5, 0, -4);
      carGroup.add(tl2);

      const hlMat = headLightMat.clone();
      hlMat.transparent = true;
      const hl1 = new Mesh(headLightGeo, hlMat);
      hl1.userData.originalOpacity = 1.0;
      hl1.position.set(1.5, 0, 4);
      carGroup.add(hl1);

      const hl2 = new Mesh(headLightGeo, hlMat);
      hl2.userData.originalOpacity = 1.0;
      hl2.position.set(-1.5, 0, 4);
      carGroup.add(hl2);

      const hitbox = new Mesh(hitboxGeo, hitboxMat);
      hitbox.userData.originalOpacity = 0;
      carGroup.add(hitbox);

      carGroup.userData = { isPolice };
      this.resetCar(carGroup);

      this.scene.add(carGroup);
      this.cars.push(carGroup);
    }
  }

  public addLightsToCar(car: Group) {
    const hlColor = 0xffffaa;
    const hlIntensity = 2000;
    const hlDist = 800;
    const hlAngle = Math.PI / 4.5;
    const hlPenumbra = 0.2;

    const hl1 = new SpotLight(
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      1
    );
    hl1.position.set(1.5, 2, 4);
    hl1.castShadow = false;

    const hl1Target = new Object3D();
    hl1Target.position.set(1.5, -10, 40);
    car.add(hl1Target);
    hl1.target = hl1Target;

    hl1.userData.isCarLight = true;
    car.add(hl1);

    const hl2 = new SpotLight(
      hlColor,
      hlIntensity,
      hlDist,
      hlAngle,
      hlPenumbra,
      1
    );
    hl2.position.set(-1.5, 2, 4);
    hl2.castShadow = false;

    const hl2Target = new Object3D();
    hl2Target.position.set(-1.5, -10, 40);
    car.add(hl2Target);
    hl2.target = hl2Target;

    hl2.userData.isCarLight = true;
    car.add(hl2);

    const tlColor = 0xff0000;
    const tlIntensity = 150;
    const tlDist = 50;
    const tlAngle = Math.PI / 2.5;

    const tl1 = new SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
    tl1.position.set(1.5, 2, -4);

    const tl1Target = new Object3D();
    tl1Target.position.set(1.5, -5, -20);
    car.add(tl1Target);
    tl1.target = tl1Target;

    tl1.userData.isCarLight = true;
    car.add(tl1);

    const tl2 = new SpotLight(tlColor, tlIntensity, tlDist, tlAngle, 0.5, 1);
    tl2.position.set(-1.5, 2, -4);

    const tl2Target = new Object3D();
    tl2Target.position.set(-1.5, -5, -20);
    car.add(tl2Target);
    tl2.target = tl2Target;

    tl2.userData.isCarLight = true;
    car.add(tl2);
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

  public resetCar(carGroup: Group, activeCar?: Group | null) {
    const wasActive = activeCar && carGroup.uuid === activeCar.uuid;
    const isPolice = !!carGroup.userData.isPolice;

    this.removeLightsFromCar(carGroup);

    const axis = Math.random() > 0.5 ? "x" : "z";
    const dir = Math.random() > 0.5 ? 1 : -1;

    const roadIndex = Math.floor(Math.random() * (GRID_SIZE + 1));
    const roadCoordinate = START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

    let x = 0,
      z = 0;

    if (axis === "x") {
      z = roadCoordinate + laneOffset;
      x = (Math.random() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      x = roadCoordinate + laneOffset;
      z = (Math.random() - 0.5) * CITY_SIZE;
      carGroup.rotation.y = dir === 1 ? 0 : Math.PI;
    }
    carGroup.userData.heading = carGroup.rotation.y;

    const h = getHeight(x, z);
    carGroup.position.set(x, h + 1, z);

    carGroup.userData.speed = isPolice ? 2.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0;
    carGroup.userData.dir = dir;
    carGroup.userData.axis = axis;
    carGroup.userData.laneOffset = laneOffset;
    carGroup.userData.collided = false;
    carGroup.userData.fading = false;
    carGroup.userData.isPlayerHit = false;
    carGroup.userData.opacity = 1.0;
    carGroup.userData.isPlayerControlled = false;
    carGroup.userData.currentSpeed = 0;
    carGroup.userData.isPolice = isPolice;
    carGroup.userData.turnCooldown = 0;

    carGroup.visible = true;

    carGroup.traverse((child) => {
      if (child instanceof Mesh) {
        const mat = child.material;
        if (
          !Array.isArray(mat) &&
          child.userData.originalOpacity !== undefined
        ) {
          mat.opacity = child.userData.originalOpacity;
        }
      }
    });

    if (wasActive) {
      this.addLightsToCar(carGroup);
    }
  }

  public update() {
    // Move cars & Handle Collisions
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];

      if (car.userData.isPolice) {
        const time = Date.now();
        const isRedOn = Math.floor(time / 150) % 2 === 0;
        car.traverse((child) => {
          if (child.userData.isPoliceFlasher) {
            const light = child as PointLight;
            const isRed = light.color.getHex() === 0xff0000;
            light.visible = isRed ? isRedOn : !isRedOn;
          }
          if (child.userData.isPoliceFlasherMesh) {
            const mesh = child as Mesh;
            const mat = mesh.material as MeshBasicMaterial;
            const isRed = mat.color.getHex() === 0xff0000;
            mesh.visible = isRed ? isRedOn : !isRedOn;
          }
        });
      }

      if (car.userData.isPlayerControlled) {
        continue;
      }

      if (!car.userData.fading) {
        // AI Movement
        if (!car.userData.isPlayerHit) {
          if (car.userData.turnCooldown > 0) {
            car.userData.turnCooldown--;
          }

          if (car.userData.axis === "x") {
            car.position.x += car.userData.speed * car.userData.dir;

            // Police Aggressive Turning
            if (car.userData.isPolice && car.userData.turnCooldown <= 0) {
              const currentPos = car.position.x;
              const roadIndex = Math.round(
                (currentPos - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE
              );
              const roadCenter =
                START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

              if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
                if (Math.random() < 0.4) {
                  // Turn
                  const newDir = Math.random() > 0.5 ? 1 : -1;
                  const newLaneOffset =
                    (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

                  car.position.x = roadCenter + newLaneOffset;
                  car.userData.axis = "z";
                  car.userData.dir = newDir;
                  car.userData.heading = newDir === 1 ? 0 : Math.PI;
                  car.userData.turnCooldown = 60; // 1 second cooldown
                }
              }
            }

            if (car.position.x > BOUNDS) car.position.x = -BOUNDS;
            if (car.position.x < -BOUNDS) car.position.x = BOUNDS;
          } else {
            car.position.z += car.userData.speed * car.userData.dir;

            // Police Aggressive Turning
            if (car.userData.isPolice && car.userData.turnCooldown <= 0) {
              const currentPos = car.position.z;
              const roadIndex = Math.round(
                (currentPos - (START_OFFSET - CELL_SIZE / 2)) / CELL_SIZE
              );
              const roadCenter =
                START_OFFSET + roadIndex * CELL_SIZE - CELL_SIZE / 2;

              if (Math.abs(currentPos - roadCenter) < car.userData.speed * 1.5) {
                if (Math.random() < 0.4) {
                  // Turn
                  const newDir = Math.random() > 0.5 ? 1 : -1;
                  const newLaneOffset =
                    (Math.random() > 0.5 ? 1 : -1) * (ROAD_WIDTH / 4);

                  car.position.z = roadCenter + newLaneOffset;
                  car.userData.axis = "x";
                  car.userData.dir = newDir;
                  car.userData.heading = newDir === 1 ? Math.PI / 2 : -Math.PI / 2;
                  car.userData.turnCooldown = 60;
                }
              }
            }

            if (car.position.z > BOUNDS) car.position.z = -BOUNDS;
            if (car.position.z < -BOUNDS) car.position.z = BOUNDS;
          }

          car.position.y = getHeight(car.position.x, car.position.z) + 1;

          // Apply orientation
          const normal = getNormal(car.position.x, car.position.z);
          car.up.set(normal.x, normal.y, normal.z);
          const heading = car.userData.heading ?? 0;
          const lookDist = 5;
          const targetX = car.position.x + Math.sin(heading) * lookDist;
          const targetZ = car.position.z + Math.cos(heading) * lookDist;
          const targetY = getHeight(targetX, targetZ) + 1;
          car.lookAt(targetX, targetY, targetZ);
        }
      } else {
        // Fading out logic
        if (car.userData.axis === "x") {
          car.position.x += car.userData.speed * 0.5 * car.userData.dir;
        } else {
          car.position.z += car.userData.speed * 0.5 * car.userData.dir;
        }

        car.position.y = getHeight(car.position.x, car.position.z) + 1;

        // Apply orientation for fading cars too
        const normal = getNormal(car.position.x, car.position.z);
        car.up.set(normal.x, normal.y, normal.z);
        const heading = car.userData.heading ?? 0;
        const lookDist = 5;
        const targetX = car.position.x + Math.sin(heading) * lookDist;
        const targetZ = car.position.z + Math.cos(heading) * lookDist;
        const targetY = getHeight(targetX, targetZ) + 1;
        car.lookAt(targetX, targetY, targetZ);

        car.userData.opacity -= 0.02;
        if (car.userData.opacity <= 0) {
          this.resetCar(car);
        } else {
          // Apply opacity
          car.traverse((child) => {
            if (child instanceof Mesh) {
              const mat = child.material;
              if (!Array.isArray(mat)) {
                const original =
                  child.userData.originalOpacity !== undefined
                    ? child.userData.originalOpacity
                    : 1.0;
                mat.opacity = original * car.userData.opacity;
              }
            }
          });
        }
      }
    }

    // Check Collisions
    const actualCollisionDist = 6;

    for (let i = 0; i < this.cars.length; i++) {
      const carA = this.cars[i];
      if (carA.userData.fading) continue;

      for (let j = i + 1; j < this.cars.length; j++) {
        const carB = this.cars[j];
        if (carB.userData.fading) continue;

        const dx = carA.position.x - carB.position.x;
        const dz = carA.position.z - carB.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < actualCollisionDist * actualCollisionDist) {
          if (
            carA.userData.isPlayerControlled ||
            carB.userData.isPlayerControlled
          ) {
            const player = carA.userData.isPlayerControlled ? carA : carB;
            const ai = carA.userData.isPlayerControlled ? carB : carA;

            player.userData.currentSpeed *= -0.5;
            carAudio.playCrash();
            player.position.x += (player.position.x - ai.position.x) * 0.5;
            player.position.z += (player.position.z - ai.position.z) * 0.5;

            ai.userData.fading = true;
            ai.userData.dir *= -1;
            ai.userData.heading += Math.random() - 0.5;
            this.spawnSparks(player.position);
            continue;
          }

          if (Math.random() > 0.5) continue;

          carA.userData.fading = true;
          carB.userData.fading = true;

          carA.userData.dir *= -1;
          carB.userData.dir *= -1;

          carA.userData.heading += Math.random() - 0.5;
          carB.userData.heading += Math.random() - 0.5;
        }
      }
    }
  }
}
