import {
  Group,
  Scene,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  PointLight,
  TorusGeometry,
  Object3D,
} from 'three';
import { CELL_SIZE, START_OFFSET } from './config';
import { getHeight } from '../utils/HeightMap';

export class EasterEggManager {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public spawnEasterEggs(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>,
    _buildings: Object3D[]
  ) {
    this.spawnPortalCube(occupiedGrids);
    this.spawnMarioPipe(occupiedGrids);
    this.spawnSonicRing(occupiedGrids);
  }

  private spawnPortalCube(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    // Portal Companion Cube reference
    const group = new Group();

    const geo = new BoxGeometry(10, 10, 10);
    const mat = new MeshStandardMaterial({
      color: 0xcccccc,
      emissive: 0xffaacc,
      emissiveIntensity: 0.2,
      roughness: 0.5,
    });
    const mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const light = new PointLight(0xffaacc, 1000, 150);
    light.position.y = 15;
    group.add(light);

    // Place it somewhere around x=2, z=2
    this.placeEgg(group, 2, 2, occupiedGrids);
  }

  private spawnMarioPipe(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    // Mario Green Pipe reference
    const group = new Group();

    const pipeMat = new MeshStandardMaterial({ color: 0x00ff00, roughness: 0.6, metalness: 0.1 });

    const baseGeo = new CylinderGeometry(6, 6, 12, 16);
    const base = new Mesh(baseGeo, pipeMat);
    base.position.y = 6;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const topGeo = new CylinderGeometry(7, 7, 4, 16);
    const top = new Mesh(topGeo, pipeMat);
    top.position.y = 14;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const light = new PointLight(0x00ff00, 1000, 150);
    light.position.y = 20;
    group.add(light);

    // Place it somewhere around x=7, z=7
    this.placeEgg(group, 7, 7, occupiedGrids);
  }

  private spawnSonicRing(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    // Sonic Golden Ring reference
    const group = new Group();

    const ringGeo = new TorusGeometry(8, 1.5, 16, 32);
    const ringMat = new MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      metalness: 1.0,
      roughness: 0.2,
    });
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.y = 10;
    ring.castShadow = true;
    group.add(ring);

    const light = new PointLight(0xffaa00, 1500, 200);
    light.position.y = 10;
    group.add(light);

    // Place it somewhere around x=8, z=2
    this.placeEgg(group, 8, 2, occupiedGrids);
  }

  private placeEgg(
    group: Group,
    gridX: number,
    gridZ: number,
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    const xPos = START_OFFSET + gridX * CELL_SIZE;
    const zPos = START_OFFSET + gridZ * CELL_SIZE;

    const yPos = getHeight(xPos, zPos);

    const gridKey = `${gridX},${gridZ}`;
    if (occupiedGrids.has(gridKey)) {
      // Just offset it from the building slightly
      group.position.set(xPos + 40, yPos + 1, zPos + 40);
    } else {
      group.position.set(xPos, yPos + 1, zPos);
    }

    this.scene.add(group);
  }
}
