import {
  Scene,
  Group,
  Mesh,
  MeshBasicMaterial,
  CylinderGeometry,
  BoxGeometry,
  OctahedronGeometry,
  TorusGeometry,
  AdditiveBlending,
  Object3D,
} from 'three';
import { getHeight } from '../utils/HeightMap';

export const STORY_TRIGGER_POSITION = { x: -760, z: 380 };

interface ObjectivePosition {
  missionIdx: number;
  objIdx: number;
  type: 'goto' | 'collect' | 'interact';
  x: number;
  z: number;
}

const OBJECTIVE_POSITIONS: ObjectivePosition[] = [
  // Mission 0: FIRST CONTACT
  { missionIdx: 0, objIdx: 0, type: 'goto', x: -600, z: -400 },
  // Mission 1: DATA HEIST
  { missionIdx: 1, objIdx: 0, type: 'goto', x: 400, z: -600 },
  { missionIdx: 1, objIdx: 1, type: 'goto', x: 400, z: -620 },
  // Mission 2: GHOST PROTOCOL
  { missionIdx: 2, objIdx: 0, type: 'collect', x: -300, z: 500 },
  { missionIdx: 2, objIdx: 1, type: 'collect', x: 500, z: 300 },
  { missionIdx: 2, objIdx: 2, type: 'collect', x: -500, z: -200 },
  // Mission 3: THE EXCHANGE
  { missionIdx: 3, objIdx: 0, type: 'goto', x: 0, z: 700 },
  // Mission 4: REBOOT
  { missionIdx: 4, objIdx: 0, type: 'goto', x: 0, z: 0 },
  { missionIdx: 4, objIdx: 1, type: 'interact', x: 0, z: 20 },
];

function createGlowMaterial(color: number, opacity = 0.6): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: AdditiveBlending,
    depthWrite: false,
  });
}

function positionAtHeight(mesh: Object3D, x: number, z: number, yOffset = 0) {
  const h = getHeight(x, z);
  mesh.position.set(x, h + yOffset, z);
}

export class StoryItemsManager {
  private scene: Scene;
  private triggerMesh: Group | null = null;
  private objectiveItems: { missionIdx: number; objIdx: number; group: Group }[] = [];
  private triggerActive = true;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  createTrigger() {
    const group = new Group();

    const bodyGeo = new OctahedronGeometry(4, 0);
    const bodyMat = new MeshBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.9,
    });
    const body = new Mesh(bodyGeo, bodyMat);
    body.position.y = 10;
    group.add(body);

    const glowGeo = new OctahedronGeometry(8, 0);
    const glowMat = createGlowMaterial(0xff00cc, 0.3);
    const glow = new Mesh(glowGeo, glowMat);
    glow.position.y = 10;
    group.add(glow);

    const beamGeo = new CylinderGeometry(0.5, 1.5, 80, 8, 1, true);
    const beamMat = new MeshBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.08,
      blending: AdditiveBlending,
      depthWrite: false,
      side: 2,
    });
    const beam = new Mesh(beamGeo, beamMat);
    beam.position.y = 40;
    group.add(beam);

    const baseGeo = new CylinderGeometry(1.5, 2, 2, 8);
    const baseMat = new MeshBasicMaterial({ color: 0x444466 });
    const base = new Mesh(baseGeo, baseMat);
    group.add(base);

    positionAtHeight(group, STORY_TRIGGER_POSITION.x, STORY_TRIGGER_POSITION.z, 0.5);

    group.userData.isStoryTrigger = true;
    this.triggerMesh = group;
    this.scene.add(group);
  }

  hideTrigger() {
    if (this.triggerMesh) {
      this.triggerMesh.visible = false;
      this.triggerActive = false;
    }
  }

  isTriggerHidden(): boolean {
    return !this.triggerActive;
  }

  createAllObjectiveMarkers() {
    for (const pos of OBJECTIVE_POSITIONS) {
      const group = this.createObjectiveMarker(pos.type, pos.x, pos.z);
      group.userData.missionIdx = pos.missionIdx;
      group.userData.objIdx = pos.objIdx;
      group.visible = false;
      this.objectiveItems.push({ missionIdx: pos.missionIdx, objIdx: pos.objIdx, group });
      this.scene.add(group);
    }
  }

  private createObjectiveMarker(type: string, x: number, z: number): Group {
    const group = new Group();

    if (type === 'goto') {
      const pillarGeo = new CylinderGeometry(0.5, 0.5, 6, 8);
      const pillarMat = new MeshBasicMaterial({ color: 0x00ffcc });
      const pillar = new Mesh(pillarGeo, pillarMat);
      pillar.position.y = 3;
      group.add(pillar);

      const glowGeo = new CylinderGeometry(1, 1, 6, 8);
      const glowMat = createGlowMaterial(0x00ffcc, 0.25);
      const glow = new Mesh(glowGeo, glowMat);
      glow.position.y = 3;
      group.add(glow);

      const ringGeo = new TorusGeometry(1.2, 0.15, 8, 16);
      const ringMat = createGlowMaterial(0x00ffcc, 0.5);
      const ring = new Mesh(ringGeo, ringMat);
      ring.position.y = 6;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
    } else if (type === 'collect') {
      const shardGeo = new BoxGeometry(1.5, 3, 1.5);
      const shardMat = new MeshBasicMaterial({ color: 0xffcc00 });
      const shard = new Mesh(shardGeo, shardMat);
      shard.position.y = 2;
      shard.rotation.y = Math.PI / 4;
      group.add(shard);

      const glowGeo = new BoxGeometry(2.5, 4, 2.5);
      const glowMat = createGlowMaterial(0xffcc00, 0.2);
      const glow = new Mesh(glowGeo, glowMat);
      glow.position.y = 2;
      group.add(glow);
    } else if (type === 'interact') {
      const panelGeo = new BoxGeometry(2, 3, 0.3);
      const panelMat = new MeshBasicMaterial({ color: 0xff00cc });
      const panel = new Mesh(panelGeo, panelMat);
      panel.position.y = 2.5;
      group.add(panel);

      const glowGeo = new BoxGeometry(3, 4, 0.8);
      const glowMat = createGlowMaterial(0xff00cc, 0.2);
      const glow = new Mesh(glowGeo, glowMat);
      glow.position.y = 2.5;
      group.add(glow);
    }

    positionAtHeight(group, x, z, 0);
    return group;
  }

  setCurrentMission(missionIdx: number) {
    for (const item of this.objectiveItems) {
      item.group.visible = item.missionIdx === missionIdx;
    }
  }

  completeObjective(missionIdx: number, objIdx: number) {
    for (const item of this.objectiveItems) {
      if (item.missionIdx === missionIdx && item.objIdx === objIdx) {
        item.group.visible = false;
        break;
      }
    }
  }

  updateTriggerAnimation(time: number) {
    if (!this.triggerMesh || !this.triggerMesh.visible) return;
    const body = this.triggerMesh.children[0] as Mesh;
    const glow = this.triggerMesh.children[1] as Mesh;
    if (body) {
      body.rotation.y = time * 0.5;
      body.position.y = 10 + Math.sin(time * 2) * 0.5;
    }
    if (glow) {
      glow.rotation.y = time * 0.5;
      glow.position.y = 10 + Math.sin(time * 2) * 0.5;
      (glow.material as MeshBasicMaterial).opacity = 0.2 + Math.sin(time * 3) * 0.15;
    }
  }

  dispose() {
    if (this.triggerMesh) {
      this.scene.remove(this.triggerMesh);
    }
    for (const item of this.objectiveItems) {
      this.scene.remove(item.group);
    }
    this.objectiveItems = [];
    this.triggerMesh = null;
  }
}
