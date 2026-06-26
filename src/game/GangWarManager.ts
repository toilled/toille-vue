import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Vector3,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
} from 'three';
import { CELL_SIZE, START_OFFSET, GRID_SIZE, BLOCK_SIZE } from './config';
import { getHeight } from '../utils/HeightMap';
import { GangWarCombat } from './GangWarCombat';
import { GangWarMarkers } from './GangWarMarkers';
import { Warrior, Projectile, type GangConfig, GANGS } from './GangWarTypes';

export class GangWarManager {
  scene: Scene;
  warriors: Warrior[] = [];
  projectiles: Projectile[] = [];
  fightMarkers: Mesh[] = [];
  spawnSparks: (pos: Vector3) => void;
  playPewSound: (pos?: Vector3) => void;

  bodyGeo = new CylinderGeometry(0.5, 0.5, 2.5);
  headGeo = new SphereGeometry(0.6);
  gunGeo = new BoxGeometry(0.2, 0.2, 1);
  projectileGeo = new BoxGeometry(0.2, 0.2, 2);

  arrowGeo: CylinderGeometry;
  arrowMat: MeshBasicMaterial;

  occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>;

  combat: GangWarCombat;
  markers: GangWarMarkers;

  constructor(
    scene: Scene,
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>,
    spawnSparks: (pos: Vector3) => void,
    playPewSound: (pos?: Vector3) => void
  ) {
    this.scene = scene;
    this.occupiedGrids = occupiedGrids;
    this.spawnSparks = spawnSparks;
    this.playPewSound = playPewSound;

    this.arrowGeo = new CylinderGeometry(0, 4, 10, 8);
    this.arrowGeo.rotateX(Math.PI);
    this.arrowMat = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });

    this.combat = new GangWarCombat(
      scene,
      this.warriors,
      this.projectiles,
      spawnSparks,
      playPewSound,
      this.projectileGeo,
      (gang, count) => this.spawnGangBatch(gang, count)
    );

    this.markers = new GangWarMarkers(
      scene,
      this.warriors,
      this.fightMarkers,
      this.arrowGeo,
      this.arrowMat
    );

    this.initWarriors();
  }

  initWarriors() {
    const warriorsPerGang = 20;

    GANGS.forEach((gang) => {
      this.spawnGangBatch(gang, warriorsPerGang);
    });
  }

  spawnGangBatch(gang: GangConfig, count: number) {
    const blockX = Math.floor(Math.random() * GRID_SIZE);
    const blockZ = Math.floor(Math.random() * GRID_SIZE);

    const key = `${blockX},${blockZ}`;
    const building = this.occupiedGrids.get(key);
    const halfW = building ? building.halfW : BLOCK_SIZE * 0.45;
    const halfD = building ? building.halfD : BLOCK_SIZE * 0.45;

    const cx = START_OFFSET + blockX * CELL_SIZE;
    const cz = START_OFFSET + blockZ * CELL_SIZE;

    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      let x = cx;
      let z = cz;

      const margin = 5;

      switch (side) {
        case 0:
          z = cz - halfD - margin - Math.random() * 15;
          x = cx + (Math.random() - 0.5) * CELL_SIZE;
          break;
        case 1:
          z = cz + halfD + margin + Math.random() * 15;
          x = cx + (Math.random() - 0.5) * CELL_SIZE;
          break;
        case 2:
          x = cx + halfW + margin + Math.random() * 15;
          z = cz + (Math.random() - 0.5) * CELL_SIZE;
          break;
        case 3:
          x = cx - halfW - margin - Math.random() * 15;
          z = cz + (Math.random() - 0.5) * CELL_SIZE;
          break;
      }

      this.spawnWarrior(x, z, gang);
    }
  }

  spawnWarrior(x: number, z: number, gang: GangConfig) {
    const group = new Group();
    const y = getHeight(x, z);
    group.position.set(x, y + 1.25, z);

    const mat = new MeshBasicMaterial({ color: gang.color });
    const blackMat = new MeshBasicMaterial({ color: 0x111111 });

    const body = new Mesh(this.bodyGeo, blackMat);
    const head = new Mesh(this.headGeo, mat);
    head.position.y = 1.5;

    const gun = new Mesh(this.gunGeo, new MeshBasicMaterial({ color: 0x555555 }));
    gun.position.set(0.6, 0.8, 0.5);

    group.add(body);
    group.add(head);
    group.add(gun);

    this.scene.add(group);

    const warrior = new Warrior(group, gang.id, head, body, gun);
    this.warriors.push(warrior);
  }

  update(dt: number) {
    this.combat.checkReinforcements();
    this.markers.updateFightMarkers(dt);
    this.combat.updateWarriors(dt);
  }

  checkReinforcements() {
    this.combat.checkReinforcements();
  }

  updateCombat(w: Warrior, dt: number) {
    this.combat.updateCombat(w, dt);
  }

  shoot(shooter: Warrior, target: Warrior) {
    this.combat.shoot(shooter, target);
  }

  damageWarrior(w: Warrior, dmg: number) {
    this.combat.damageWarrior(w, dmg);
  }

  updateFightMarkers(dt: number) {
    this.markers.updateFightMarkers(dt);
  }

  get lastMarkerUpdate() {
    return this.markers.lastMarkerUpdate;
  }

  set lastMarkerUpdate(v: number) {
    this.markers.lastMarkerUpdate = v;
  }

  dispose() {
    this.warriors.forEach((w) => {
      w.clearFlashTimer();
      this.scene.remove(w.group);
    });
    this.projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.markers.clearFightMarkers();
    this.warriors = [];
    this.projectiles = [];
  }
}
