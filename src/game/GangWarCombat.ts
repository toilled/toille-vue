import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, Vector3 } from 'three';
import { getHeight } from '../utils/HeightMap';
import { Warrior, Projectile, type GangConfig, GANGS } from './GangWarTypes';

export class GangWarCombat {
  scene: Scene;
  warriors: Warrior[];
  projectiles: Projectile[];
  spawnSparks: (pos: Vector3) => void;
  playPewSound: (pos?: Vector3) => void;
  projectileGeo: BoxGeometry;
  spawnGangBatch: (gang: GangConfig, count: number) => void;

  constructor(
    scene: Scene,
    warriors: Warrior[],
    projectiles: Projectile[],
    spawnSparks: (pos: Vector3) => void,
    playPewSound: (pos?: Vector3) => void,
    projectileGeo: BoxGeometry,
    spawnGangBatch: (gang: GangConfig, count: number) => void
  ) {
    this.scene = scene;
    this.warriors = warriors;
    this.projectiles = projectiles;
    this.spawnSparks = spawnSparks;
    this.playPewSound = playPewSound;
    this.projectileGeo = projectileGeo;
    this.spawnGangBatch = spawnGangBatch;
  }

  updateWarriors(dt: number) {
    for (const warrior of this.warriors) {
      this.updateWarrior(warrior, dt);
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.updateProjectile(i, dt);
    }
  }

  private updateWarrior(warrior: Warrior, dt: number) {
    if (warrior.state === 'DEAD') return;

    if (warrior.target) {
      if (warrior.target.state === 'DEAD') {
        warrior.target = null;
        warrior.state = 'IDLE';
      } else if (!this.isValidTarget(warrior, warrior.target)) {
        warrior.target = null;
        warrior.state = 'IDLE';
      }
    }

    if (!warrior.target) {
      this.findTarget(warrior);
    }

    if (warrior.target) {
      warrior.state = 'COMBAT';
      this.updateCombat(warrior, dt);
    } else {
      this.updateIdle(warrior, dt);
    }

    if (warrior.cooldown > 0) warrior.cooldown -= dt;
  }

  isValidTarget(w: Warrior, target: Warrior): boolean {
    const range = 150;
    return w.group.position.distanceToSquared(target.group.position) < range * range;
  }

  findTarget(w: Warrior) {
    let minDist = Infinity;
    let closest: Warrior | null = null;
    const searchRange = 500;

    for (const other of this.warriors) {
      if (other.gangId === w.gangId) continue;
      if (other.state === 'DEAD') continue;

      const d = w.group.position.distanceToSquared(other.group.position);
      if (d < searchRange * searchRange && d < minDist) {
        minDist = d;
        closest = other;
      }
    }

    if (closest) {
      w.target = closest;
    }
  }

  updateCombat(w: Warrior, dt: number) {
    if (!w.target) return;

    const distSq = w.group.position.distanceToSquared(w.target.group.position);
    const shootRange = 150;

    const targetPos = w.target.group.position.clone();
    w.group.lookAt(targetPos.x, w.group.position.y, targetPos.z);

    if (distSq > shootRange * shootRange) {
      const dir = targetPos.sub(w.group.position).normalize();
      w.group.position.add(dir.multiplyScalar(w.speed * dt));

      const h = getHeight(w.group.position.x, w.group.position.z);
      w.group.position.y = h + 1.25;
    } else {
      if (w.cooldown <= 0) {
        this.shoot(w, w.target);
        w.cooldown = 0.5 + Math.random() * 1.0;
      }
    }
  }

  updateIdle(w: Warrior, dt: number) {
    w.group.rotation.y += dt * 0.5;
  }

  shoot(shooter: Warrior, target: Warrior) {
    const startPos = shooter.group.position.clone();
    startPos.y += 0.8;

    const dir = target.group.position.clone().sub(startPos).normalize();

    dir.x += (Math.random() - 0.5) * shooter.accuracy;
    dir.y += (Math.random() - 0.5) * shooter.accuracy;
    dir.z += (Math.random() - 0.5) * shooter.accuracy;
    dir.normalize();

    const speed = 80;
    const velocity = dir.multiplyScalar(speed);

    const mat = new MeshBasicMaterial({ color: 0xffff00 });
    const mesh = new Mesh(this.projectileGeo, mat);
    mesh.position.copy(startPos);
    mesh.lookAt(startPos.clone().add(dir));

    this.scene.add(mesh);
    this.projectiles.push(new Projectile(mesh, velocity, shooter.gangId));

    if (Math.random() > 0.7) {
      this.playPewSound(startPos);
    }
  }

  damageWarrior(w: Warrior, dmg: number) {
    w.hp -= dmg;
    if (w.hp <= 0) {
      this.killWarrior(w);
    } else {
      w.clearFlashTimer();
      (w.body.material as MeshBasicMaterial).color.setHex(0xff0000);
      w.flashTimerId = setTimeout(() => {
        if (w.state !== 'DEAD') (w.body.material as MeshBasicMaterial).color.setHex(0x111111);
      }, 100);
    }
  }

  killWarrior(w: Warrior) {
    w.state = 'DEAD';
    w.clearFlashTimer();
    w.group.rotation.x = Math.PI / 2;
    const h = getHeight(w.group.position.x, w.group.position.z);
    w.group.position.y = h + 0.5;
  }

  checkReinforcements() {
    const counts = new Map<number, number>();
    GANGS.forEach((g) => counts.set(g.id, 0));

    this.warriors.forEach((w) => {
      if (w.state !== 'DEAD') {
        counts.set(w.gangId, (counts.get(w.gangId) || 0) + 1);
      }
    });

    const threshold = 5;
    const reinforceCount = 10;

    counts.forEach((count, gangId) => {
      if (count < threshold) {
        const gang = GANGS.find((g) => g.id === gangId);
        if (gang) {
          this.spawnGangBatch(gang, reinforceCount);
        }
      }
    });
  }

  private updateProjectile(i: number, dt: number) {
    const proj = this.projectiles[i];
    proj.life -= dt;
    proj.mesh.position.add(proj.velocity.clone().multiplyScalar(dt));

    let hit = false;
    for (const warrior of this.warriors) {
      if (warrior.state === 'DEAD' || warrior.gangId === proj.shooterId) continue;
      const distSq = warrior.group.position.distanceToSquared(proj.mesh.position);
      if (distSq < 4) {
        this.damageWarrior(warrior, proj.damage);
        this.spawnSparks(proj.mesh.position);
        hit = true;
        break;
      }
    }

    if (proj.mesh.position.y < 0) hit = true;

    if (hit || proj.life <= 0) {
      this.scene.remove(proj.mesh);
      this.projectiles.splice(i, 1);
    }
  }
}
