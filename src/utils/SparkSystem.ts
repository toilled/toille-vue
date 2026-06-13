import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, PointsMaterial, Scene, Vector3 } from "three";
import { getHeight } from "./HeightMap";
import {
  SPARK_COUNT,
  SPARK_BURST_SIZE,
  SPARK_GRAVITY,
  SPARK_LIFETIME_DECAY,
  SPARK_OFF_SCREEN_Y,
  SPARK_MIN_VELOCITY,
  SPARK_RANDOM_VELOCITY,
} from "../game/constants/CyberpunkCity";
import { checkGridCollision, OccupiedGrid } from "./GridCollision";

export class SparkSystem {
  private points: Points;
  private positions: Float32Array;
  private velocities: Float32Array;
  private lifetimes: Float32Array;

  constructor(scene: Scene) {
    this.positions = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      this.positions[i * 3 + 1] = SPARK_OFF_SCREEN_Y;
    }

    this.velocities = new Float32Array(SPARK_COUNT * 3);
    this.lifetimes = new Float32Array(SPARK_COUNT);

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(this.positions, 3));

    const mat = new PointsMaterial({
      color: 0xffaa00,
      size: 3,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.points = new Points(geo, mat);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  burst(position: Vector3) {
    const posAttribute = this.points.geometry.attributes.position;
    let spawned = 0;

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (this.lifetimes[i] <= 0) {
        this.activate(i, position);
        spawned++;
        if (spawned >= SPARK_BURST_SIZE) break;
      }
    }

    if (spawned < SPARK_BURST_SIZE) {
      for (let i = 0; i < SPARK_BURST_SIZE - spawned; i++) {
        const randIndex = Math.floor(Math.random() * SPARK_COUNT);
        this.activate(randIndex, position);
      }
    }

    posAttribute.needsUpdate = true;
  }

  private activate(i: number, position: Vector3) {
    this.lifetimes[i] = 1.0;
    this.positions[i * 3] = position.x;
    this.positions[i * 3 + 1] = position.y;
    this.positions[i * 3 + 2] = position.z;
    this.velocities[i * 3] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
    this.velocities[i * 3 + 1] = Math.random() * SPARK_RANDOM_VELOCITY + SPARK_MIN_VELOCITY;
    this.velocities[i * 3 + 2] = (Math.random() - 0.5) * SPARK_RANDOM_VELOCITY;
  }

  update(occupiedGrids: OccupiedGrid) {
    const positions = this.points.geometry.attributes.position.array as Float32Array;
    let needsUpdate = false;

    for (let i = 0; i < SPARK_COUNT; i++) {
      if (this.lifetimes[i] <= 0) continue;

      this.velocities[i * 3 + 1] -= SPARK_GRAVITY;
      positions[i * 3] += this.velocities[i * 3];
      positions[i * 3 + 1] += this.velocities[i * 3 + 1];
      positions[i * 3 + 2] += this.velocities[i * 3 + 2];

      const h = getHeight(positions[i * 3], positions[i * 3 + 2]);
      if (positions[i * 3 + 1] < h) {
        positions[i * 3 + 1] = h;
        this.velocities[i * 3 + 1] *= -0.5;
      }

      if (checkGridCollision(positions[i * 3], positions[i * 3 + 2], occupiedGrids, 0)) {
        this.lifetimes[i] = 0;
      }

      this.lifetimes[i] -= SPARK_LIFETIME_DECAY;
      if (this.lifetimes[i] < 0) {
        this.lifetimes[i] = 0;
        positions[i * 3 + 1] = SPARK_OFF_SCREEN_Y;
      }
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.points.geometry.attributes.position.needsUpdate = true;
    }
    }
}
