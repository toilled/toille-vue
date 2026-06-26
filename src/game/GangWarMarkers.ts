import { CylinderGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { Warrior } from './GangWarTypes';

export class GangWarMarkers {
  scene: Scene;
  warriors: Warrior[];
  fightMarkers: Mesh[];
  arrowGeo: CylinderGeometry;
  arrowMat: MeshBasicMaterial;
  lastMarkerUpdate: number = 0;

  constructor(
    scene: Scene,
    warriors: Warrior[],
    fightMarkers: Mesh[],
    arrowGeo: CylinderGeometry,
    arrowMat: MeshBasicMaterial
  ) {
    this.scene = scene;
    this.warriors = warriors;
    this.fightMarkers = fightMarkers;
    this.arrowGeo = arrowGeo;
    this.arrowMat = arrowMat;
  }

  updateFightMarkers(dt: number) {
    this.lastMarkerUpdate += dt;
    if (this.lastMarkerUpdate < 1.0) {
      this.animateExistingMarkers(dt);
      return;
    }
    this.lastMarkerUpdate = 0;

    this.clearFightMarkers();

    const clusters = this.findCombatantClusters();
    this.createFightMarkerArrows(clusters);
  }

  private animateExistingMarkers(dt: number) {
    const time = Date.now() * 0.003;
    this.fightMarkers.forEach((m) => {
      m.position.y = 80 + Math.sin(time) * 5;
      m.rotation.y += dt;
    });
  }

  private findCombatantClusters(): Vector3[] {
    const combatants = this.warriors.filter((w) => w.state === 'COMBAT' && w.hp > 0);
    if (combatants.length === 0) return [];

    const clusters: Vector3[] = [];
    const visited = new Set<number>();
    const clusterRangeSq = 100 * 100;

    for (let i = 0; i < combatants.length; i++) {
      if (visited.has(i)) continue;

      const center = combatants[i].group.position.clone();
      let count = 1;
      visited.add(i);

      for (let j = i + 1; j < combatants.length; j++) {
        if (visited.has(j)) continue;
        if (
          combatants[i].group.position.distanceToSquared(combatants[j].group.position) <
          clusterRangeSq
        ) {
          center.add(combatants[j].group.position);
          count++;
          visited.add(j);
        }
      }

      if (count >= 4) {
        center.divideScalar(count);
        clusters.push(center);
      }
    }

    return clusters;
  }

  private createFightMarkerArrows(clusters: Vector3[]) {
    clusters.forEach((pos) => {
      const arrow = new Mesh(this.arrowGeo, this.arrowMat);
      arrow.position.set(pos.x, 80, pos.z);
      arrow.userData.isFightMarker = true;
      arrow.userData.target = pos;
      this.scene.add(arrow);
      this.fightMarkers.push(arrow);
    });
  }

  clearFightMarkers() {
    for (const m of this.fightMarkers) this.scene.remove(m);
    this.fightMarkers.length = 0;
  }
}
