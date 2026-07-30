import {
  LOD,
  Object3D,
  Group,
  Mesh,
  LineSegments,
  LineBasicMaterial,
  Scene,
  Camera,
  Vector3,
} from 'three';

export class LODManager {
  private lods: LOD[] = [];
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  wrapBuildings(
    buildings: Object3D[],
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    for (let i = buildings.length - 1; i >= 0; i--) {
      const building = buildings[i];
      const gridKey = this.findGridKey(building.position, occupiedGrids);
      const dims = gridKey ? occupiedGrids.get(gridKey) : null;

      const lod = new LOD();

      lod.addLevel(building, 0);

      const midGroup = this.createMidDetail(building, dims);
      if (midGroup) {
        midGroup.position.copy(building.position);
        lod.addLevel(midGroup, 800);
      }

      const lowGroup = this.createLowDetail(building);
      if (lowGroup) {
        lowGroup.position.copy(building.position);
        lod.addLevel(lowGroup, 1600);
      }

      this.scene.remove(building);
      this.scene.add(lod);
      buildings[i] = lod;
      this.lods.push(lod);
    }
  }

  private findGridKey(
    pos: Vector3,
    grid: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ): string | null {
    for (const [key, _dims] of grid) {
      const [gx, gz] = key.split(',').map(Number);
      const CELL_SIZE = 190;
      const GRID_SIZE = 10;
      const START_OFFSET = -(GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
      const cx = START_OFFSET + gx * CELL_SIZE;
      const cz = START_OFFSET + gz * CELL_SIZE;
      if (Math.abs(pos.x - cx) < CELL_SIZE / 2 && Math.abs(pos.z - cz) < CELL_SIZE / 2) {
        return key;
      }
    }
    return null;
  }

  private createMidDetail(
    building: Object3D,
    _dims?: { halfW: number; halfD: number; isRound?: boolean } | null
  ): Object3D | null {
    const mainMesh = this.findMainMesh(building);
    if (!mainMesh) return null;

    const group = new Group();

    const box = mainMesh.clone();
    box.geometry = mainMesh.geometry.clone();
    if (Array.isArray(box.material)) {
      box.material = box.material.map((m) => m.clone());
    } else {
      box.material = box.material.clone();
    }
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    const edgesObj = this.findEdges(building);
    if (edgesObj) {
      const edges = edgesObj.clone();
      if (edges.material) {
        edges.material = (edges.material as LineBasicMaterial).clone();
      }
      edges.scale.copy(edgesObj.scale);
      group.add(edges);
    }

    return group;
  }

  private createLowDetail(building: Object3D): Object3D | null {
    const mainMesh = this.findMainMesh(building);
    if (!mainMesh) return null;

    const box = mainMesh.clone();
    box.geometry = mainMesh.geometry.clone();
    if (Array.isArray(box.material)) {
      box.material = box.material.map((m) => m.clone());
    } else {
      box.material = box.material.clone();
    }
    box.castShadow = true;
    box.receiveShadow = true;
    return box;
  }

  private findMainMesh(building: Object3D): Mesh | null {
    let result: Mesh | null = null;
    building.traverse((child) => {
      if (child instanceof Mesh && !child.userData.isLeaderboard) {
        const isGeometryChild =
          child.geometry.type === 'BoxGeometry' || child.geometry.type === 'CylinderGeometry';
        const scale = child.scale;
        if (isGeometryChild && scale.x > 50 && scale.z > 50 && !result) {
          result = child;
        }
      }
    });
    return result;
  }

  private findEdges(building: Object3D): LineSegments | null {
    let result: LineSegments | null = null;
    building.traverse((child) => {
      if (child instanceof LineSegments && !result) {
        result = child;
      }
    });
    return result;
  }

  update(camera: Camera) {
    for (const lod of this.lods) {
      lod.update(camera);
    }
  }

  getBuildings(): Object3D[] {
    return this.lods;
  }

  dispose() {
    for (const lod of this.lods) {
      lod.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.scene.remove(lod);
    }
    this.lods = [];
  }
}
