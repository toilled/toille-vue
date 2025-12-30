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
  fightMarkers: Mesh[] = [];
  spawnSparks: (pos: Vector3) => void;
  playPewSound: (pos?: Vector3) => void;
  lastMarkerUpdate: number = 0;

  // Reusable Geometries
  bodyGeo = new CylinderGeometry(0.5, 0.5, 2.5);
  headGeo = new SphereGeometry(0.6);
  gunGeo = new BoxGeometry(0.2, 0.2, 1);
  projectileGeo = new BoxGeometry(0.2, 0.2, 2);

  // Fight Marker
  arrowGeo: CylinderGeometry;
  arrowMat: MeshBasicMaterial;

  constructor(scene: Scene, spawnSparks: (pos: Vector3) => void, playPewSound: (pos?: Vector3) => void) {
    this.scene = scene;
    this.spawnSparks = spawnSparks;
    this.playPewSound = playPewSound;

    // Create arrow geometry
    this.arrowGeo = new CylinderGeometry(0, 4, 10, 8);
    this.arrowGeo.rotateX(Math.PI); // Point down
    this.arrowMat = new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });

    this.initWarriors();
  }

  initWarriors() {
    // Spawn warriors for each gang
    const warriorsPerGang = 20;

    GANGS.forEach(gang => {
      this.spawnGangBatch(gang, warriorsPerGang);
    });
  }

  spawnGangBatch(gang: GangConfig, count: number) {
    // Pick a random block for this gang's base/spawn area to cluster them slightly
    const blockX = Math.floor(Math.random() * GRID_SIZE);
    const blockZ = Math.floor(Math.random() * GRID_SIZE);

    for (let i = 0; i < count; i++) {
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
    // Check for reinforcement needs
    this.checkReinforcements();

    // Update fight markers
    this.updateFightMarkers(dt);

    // Update Warriors
    for (const warrior of this.warriors) {
      if (warrior.state === "DEAD") continue;

      // Check if target is still valid
      if (warrior.target) {
        if (warrior.target.state === "DEAD") {
          warrior.target = null;
          warrior.state = "IDLE";
        } else if (!this.isValidTarget(warrior, warrior.target)) {
          // Keep target but switch to chasing?
          // For now, if out of range, drop target and maybe find new one or move closer
          warrior.target = null;
          warrior.state = "IDLE";
        }
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
    const range = 150; // Increased range
    return w.group.position.distanceToSquared(target.group.position) < range * range;
  }

  findTarget(w: Warrior) {
    let minDist = Infinity;
    let closest: Warrior | null = null;
    const searchRange = 500; // Search far for enemies to move towards

    for (const other of this.warriors) {
      if (other.gangId === w.gangId) continue;
      if (other.state === "DEAD") continue;

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

    // Distance check
    const distSq = w.group.position.distanceToSquared(w.target.group.position);
    const shootRange = 150;

    // Face target
    const targetPos = w.target.group.position.clone();
    w.group.lookAt(targetPos.x, w.group.position.y, targetPos.z);

    if (distSq > shootRange * shootRange) {
      // Chase
      const dir = targetPos.sub(w.group.position).normalize();
      w.group.position.add(dir.multiplyScalar(w.speed * dt));
    } else {
      // Shoot
      if (w.cooldown <= 0) {
        this.shoot(w, w.target);
        w.cooldown = 0.5 + Math.random() * 1.0; // Fire rate
      }
    }
  }

  updateIdle(w: Warrior, dt: number) {
    // If no target found (no one within 500), just wander or rotate.
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
        this.playPewSound(startPos);
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

    // We remove them from scene after a while to save memory, or reuse them.
    // For now, let's just leave them as corpses or sink them.
    // The checkReinforcements will handle spawning NEW ones.
  }

  checkReinforcements() {
    // Count living members per gang
    const counts = new Map<number, number>();
    GANGS.forEach(g => counts.set(g.id, 0));

    this.warriors.forEach(w => {
      if (w.state !== "DEAD") {
        counts.set(w.gangId, (counts.get(w.gangId) || 0) + 1);
      }
    });

    const threshold = 5;
    const reinforceCount = 10;

    counts.forEach((count, gangId) => {
      if (count < threshold) {
        const gang = GANGS.find(g => g.id === gangId);
        if (gang) {
          this.spawnGangBatch(gang, reinforceCount);
        }
      }
    });
  }

  updateFightMarkers(dt: number) {
    this.lastMarkerUpdate += dt;
    if (this.lastMarkerUpdate < 1.0) { // Update every second
        // Just animate existing arrows
        const time = Date.now() * 0.003;
        this.fightMarkers.forEach(m => {
            m.position.y = 80 + Math.sin(time) * 5;
            m.rotation.y += dt;
        });
        return;
    }
    this.lastMarkerUpdate = 0;

    // Clear old markers
    this.fightMarkers.forEach(m => this.scene.remove(m));
    this.fightMarkers = [];

    // Identify clusters of combat
    const combatants = this.warriors.filter(w => w.state === "COMBAT" && w.hp > 0);
    if (combatants.length === 0) return;

    // Simple clustering: Grid based? Or just proximity
    const clusters: Vector3[] = [];
    const visited = new Set<number>();
    const clusterRangeSq = 100 * 100;

    // Warning: O(N^2) on combatants
    for (let i = 0; i < combatants.length; i++) {
        if (visited.has(i)) continue;

        let center = combatants[i].group.position.clone();
        let count = 1;
        visited.add(i);

        for (let j = i + 1; j < combatants.length; j++) {
            if (visited.has(j)) continue;

            if (combatants[i].group.position.distanceToSquared(combatants[j].group.position) < clusterRangeSq) {
                center.add(combatants[j].group.position);
                count++;
                visited.add(j);
            }
        }

        if (count >= 4) { // Only show for decent fights
            center.divideScalar(count);
            clusters.push(center);
        }
    }

    clusters.forEach(pos => {
        const arrow = new Mesh(this.arrowGeo, this.arrowMat);
        arrow.position.set(pos.x, 80, pos.z);
        arrow.userData.isFightMarker = true; // Tag for raycasting
        arrow.userData.target = pos; // Store target location

        this.scene.add(arrow);
        this.fightMarkers.push(arrow);
    });
  }

  dispose() {
      // Cleanup meshes
      this.warriors.forEach(w => this.scene.remove(w.group));
      this.projectiles.forEach(p => this.scene.remove(p.mesh));
      this.fightMarkers.forEach(m => this.scene.remove(m));
  }
}
