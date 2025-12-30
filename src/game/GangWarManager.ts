import {
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Vector3,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  Quaternion,
  Matrix4
} from "three";
import { CELL_SIZE, START_OFFSET, GRID_SIZE, ROAD_WIDTH, BLOCK_SIZE } from "./config";

interface GangConfig {
  id: number;
  color: number;
  name: string;
}

const GANGS: GangConfig[] = [
  { id: 0, color: 0x00ff00, name: "Neon Vipers" },   // Green
  { id: 1, color: 0xff00ff, name: "Cyber Punks" },   // Magenta
  { id: 2, color: 0x00ffff, name: "Data Ghosts" },   // Cyan
  { id: 3, color: 0xff0000, name: "Red Dragons" }    // Red
];

class Projectile {
  mesh: Mesh;
  velocity: Vector3;
  life: number;
  shooterId: number;
  damage: number = 1;

  constructor(mesh: Mesh, velocity: Vector3, shooterId: number) {
    this.mesh = mesh;
    this.velocity = velocity;
    this.life = 2.0; // Seconds
    this.shooterId = shooterId;
  }
}

class Warrior {
  group: Group;
  gangId: number;
  hp: number = 3;
  state: "IDLE" | "COMBAT" | "DEAD" = "IDLE";
  target: Warrior | null = null;
  cooldown: number = 0;
  speed: number = 5 + Math.random() * 5;
  accuracy: number = 0.1; // rad error

  // Visuals
  head: Mesh;
  body: Mesh;
  gun: Mesh;

  constructor(group: Group, gangId: number, head: Mesh, body: Mesh, gun: Mesh) {
    this.group = group;
    this.gangId = gangId;
    this.head = head;
    this.body = body;
    this.gun = gun;
  }
}

export class GangWarManager {
  scene: Scene;
  warriors: Warrior[] = [];
  projectiles: Projectile[] = [];
  spawnSparks: (pos: Vector3) => void;
  playPewSound: () => void;

  // Reusable Geometries
  bodyGeo = new CylinderGeometry(0.5, 0.5, 2.5);
  headGeo = new SphereGeometry(0.6);
  gunGeo = new BoxGeometry(0.2, 0.2, 1);
  projectileGeo = new BoxGeometry(0.2, 0.2, 2);

  constructor(scene: Scene, spawnSparks: (pos: Vector3) => void, playPewSound: () => void) {
    this.scene = scene;
    this.spawnSparks = spawnSparks;
    this.playPewSound = playPewSound;

    this.initWarriors();
  }

  initWarriors() {
    // Spawn 10 warriors for each gang
    const warriorsPerGang = 8;

    GANGS.forEach(gang => {
      // Pick a random block for this gang's base/spawn area to cluster them slightly
      const blockX = Math.floor(Math.random() * GRID_SIZE);
      const blockZ = Math.floor(Math.random() * GRID_SIZE);

      for (let i = 0; i < warriorsPerGang; i++) {
        // Spawn near the block but ensuring not ON the road center
        // Block center:
        const cx = START_OFFSET + blockX * CELL_SIZE;
        const cz = START_OFFSET + blockZ * CELL_SIZE;

        // Random scatter around block center
        // Block is BLOCK_SIZE wide (approx 150).
        const offsetX = (Math.random() - 0.5) * (BLOCK_SIZE + ROAD_WIDTH * 0.5);
        const offsetZ = (Math.random() - 0.5) * (BLOCK_SIZE + ROAD_WIDTH * 0.5);

        const x = cx + offsetX;
        const z = cz + offsetZ;

        this.spawnWarrior(x, z, gang);
      }
    });
  }

  spawnWarrior(x: number, z: number, gang: GangConfig) {
    const group = new Group();
    group.position.set(x, 1.25, z); // 1.25y (half height)

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
    // Update Warriors
    for (const warrior of this.warriors) {
      if (warrior.state === "DEAD") continue;

      if (warrior.target && (warrior.target.state === "DEAD" || !this.isValidTarget(warrior, warrior.target))) {
        warrior.target = null;
        warrior.state = "IDLE";
      }

      if (!warrior.target) {
        this.findTarget(warrior);
      }

      if (warrior.target) {
        warrior.state = "COMBAT";
        this.updateCombat(warrior, dt);
      } else {
        this.updateIdle(warrior, dt);
      }

      if (warrior.cooldown > 0) warrior.cooldown -= dt;
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.life -= dt;

      const moveStep = proj.velocity.clone().multiplyScalar(dt);
      proj.mesh.position.add(moveStep);

      // Look at direction
      // proj.mesh.lookAt(proj.mesh.position.clone().add(proj.velocity));
      // Optimized: It shouldn't change rotation, set on spawn.

      let hit = false;
      // Check collision with warriors
      // Simple distance check
      for (const warrior of this.warriors) {
        if (warrior.state === "DEAD") continue;
        if (warrior.gangId === proj.shooterId) continue; // Don't hit friends

        const distSq = warrior.group.position.distanceToSquared(proj.mesh.position);
        if (distSq < 2 * 2) { // Hit radius
          this.damageWarrior(warrior, proj.damage);
          this.spawnSparks(proj.mesh.position);
          hit = true;
          break;
        }
      }

      // Check collision with ground/buildings roughly
      if (proj.mesh.position.y < 0) hit = true;

      // Cleanup
      if (hit || proj.life <= 0) {
        this.scene.remove(proj.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  isValidTarget(w: Warrior, target: Warrior): boolean {
    const range = 100;
    return w.group.position.distanceToSquared(target.group.position) < range * range;
  }

  findTarget(w: Warrior) {
    let minDist = Infinity;
    let closest: Warrior | null = null;

    for (const other of this.warriors) {
      if (other.gangId === w.gangId) continue;
      if (other.state === "DEAD") continue;

      const d = w.group.position.distanceToSquared(other.group.position);
      if (d < 100 * 100 && d < minDist) {
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

    // Face target
    const targetPos = w.target.group.position.clone();
    w.group.lookAt(targetPos.x, w.group.position.y, targetPos.z);

    // Shoot
    if (w.cooldown <= 0) {
      this.shoot(w, w.target);
      w.cooldown = 0.5 + Math.random() * 1.0; // Fire rate
    }
  }

  updateIdle(w: Warrior, dt: number) {
    // Wander?
    // For now, just stand still or rotate slowly
    w.group.rotation.y += dt * 0.5;
  }

  shoot(shooter: Warrior, target: Warrior) {
    const startPos = shooter.group.position.clone();
    startPos.y += 0.8; // Gun height

    // Direction to target
    const dir = target.group.position.clone().sub(startPos).normalize();

    // Add inaccuracy
    dir.x += (Math.random() - 0.5) * shooter.accuracy;
    dir.y += (Math.random() - 0.5) * shooter.accuracy;
    dir.z += (Math.random() - 0.5) * shooter.accuracy;
    dir.normalize();

    const speed = 80;
    const velocity = dir.multiplyScalar(speed);

    // Create Mesh
    const mat = new MeshBasicMaterial({ color: 0xffff00 }); // Yellow tracers
    const mesh = new Mesh(this.projectileGeo, mat);
    mesh.position.copy(startPos);
    mesh.lookAt(startPos.clone().add(dir));

    this.scene.add(mesh);
    this.projectiles.push(new Projectile(mesh, velocity, shooter.gangId));

    if (Math.random() > 0.7) {
        this.playPewSound();
    }
  }

  damageWarrior(w: Warrior, dmg: number) {
    w.hp -= dmg;
    if (w.hp <= 0) {
      this.killWarrior(w);
    } else {
        // Flash red
        (w.body.material as MeshBasicMaterial).color.setHex(0xff0000);
        setTimeout(() => {
            if(w.state !== "DEAD") (w.body.material as MeshBasicMaterial).color.setHex(0x111111);
        }, 100);
    }
  }

  killWarrior(w: Warrior) {
    w.state = "DEAD";
    w.group.rotation.x = Math.PI / 2; // Fall over
    w.group.position.y = 0.5;

    // Optional: respawn later?
    setTimeout(() => {
        this.respawnWarrior(w);
    }, 5000 + Math.random() * 5000);
  }

  respawnWarrior(w: Warrior) {
      // Find new spot
      const blockX = Math.floor(Math.random() * GRID_SIZE);
      const blockZ = Math.floor(Math.random() * GRID_SIZE);
      const cx = START_OFFSET + blockX * CELL_SIZE;
      const cz = START_OFFSET + blockZ * CELL_SIZE;
      const offsetX = (Math.random() - 0.5) * (BLOCK_SIZE + ROAD_WIDTH * 0.5);
      const offsetZ = (Math.random() - 0.5) * (BLOCK_SIZE + ROAD_WIDTH * 0.5);

      w.group.position.set(cx + offsetX, 1.25, cz + offsetZ);
      w.group.rotation.set(0, Math.random() * Math.PI * 2, 0);
      w.state = "IDLE";
      w.hp = 3;
      (w.body.material as MeshBasicMaterial).color.setHex(0x111111);
  }

  dispose() {
      // Cleanup meshes
      this.warriors.forEach(w => this.scene.remove(w.group));
      this.projectiles.forEach(p => this.scene.remove(p.mesh));
  }
}
