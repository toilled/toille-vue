import { query } from 'bitecs';
import { Position, WarriorComp, ProjectileComp, SceneRef } from '../components';
import { getHeight } from '../../../utils/HeightMap';
import type { GameWorld } from '../world';

export function warriorAISystem(world: GameWorld) {
  const warriorEids = query(world, [WarriorComp, Position]);

  for (let i = 0; i < warriorEids.length; i++) {
    updateWarrior(warriorEids[i], world);
  }

  const projectileEids = query(world, [ProjectileComp, Position]);
  for (let i = projectileEids.length - 1; i >= 0; i--) {
    updateProjectile(projectileEids[i], world);
  }
}

function updateWarrior(eid: number, world: GameWorld) {
  const state = WarriorComp.state[eid];
  if (state === 2) return;

  const cooldown = WarriorComp.cooldown[eid];
  if (cooldown > 0) {
    WarriorComp.cooldown[eid] -= world.time.delta;
  }

  if (WarriorComp.targetId[eid] === -1 && state === 0) {
    findTarget(eid, world);
  }

  if (WarriorComp.targetId[eid] !== -1) {
    moveTowardsTarget(eid, world);
  }

  const sceneRef = SceneRef[eid];
  if (sceneRef?.group) {
    sceneRef.group.position.x = Position.x[eid];
    sceneRef.group.position.y = Position.y[eid];
    sceneRef.group.position.z = Position.z[eid];
  }
}

function findTarget(eid: number, world: GameWorld) {
  const warriorEids = query(world, [WarriorComp, Position]);
  let closestDist = Infinity;
  let closestEid = -1;

  for (let i = 0; i < warriorEids.length; i++) {
    const other = warriorEids[i];
    if (other === eid) continue;
    if (WarriorComp.state[other] === 2) continue;
    if (WarriorComp.gangId[other] === WarriorComp.gangId[eid]) continue;

    const dx = Position.x[eid] - Position.x[other];
    const dz = Position.z[eid] - Position.z[other];
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < closestDist && dist < 100) {
      closestDist = dist;
      closestEid = other;
    }
  }

  if (closestEid !== -1) {
    WarriorComp.targetId[eid] = closestEid;
    WarriorComp.state[eid] = 1;
  }
}

function moveTowardsTarget(eid: number, world: GameWorld) {
  const targetId = WarriorComp.targetId[eid];
  if (targetId === -1 || WarriorComp.state[targetId] === 2) {
    WarriorComp.targetId[eid] = -1;
    WarriorComp.state[eid] = 0;
    return;
  }

  const dx = Position.x[targetId] - Position.x[eid];
  const dz = Position.z[targetId] - Position.z[eid];
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 15) {
    if (WarriorComp.cooldown[eid] <= 0) {
      WarriorComp.cooldown[eid] = 1.0;
      WarriorComp.hp[targetId] -= 1;
      if (WarriorComp.hp[targetId] <= 0) {
        WarriorComp.state[targetId] = 2;
        WarriorComp.targetId[eid] = -1;
        WarriorComp.state[eid] = 0;
      }
    }
  } else {
    const speed = WarriorComp.speed[eid] * world.time.delta * 0.01;
    Position.x[eid] += (dx / dist) * speed;
    Position.z[eid] += (dz / dist) * speed;
    Position.y[eid] = getHeight(Position.x[eid], Position.z[eid]) + 1.25;
  }
}

function updateProjectile(eid: number, world: GameWorld) {
  const dt = world.time.delta;

  Position.x[eid] += ProjectileComp.vx[eid] * dt;
  Position.y[eid] += ProjectileComp.vy[eid] * dt;
  Position.z[eid] += ProjectileComp.vz[eid] * dt;
  ProjectileComp.vy[eid] -= 9.8 * dt;
  ProjectileComp.life[eid] -= dt;

  if (ProjectileComp.life[eid] <= 0 || Position.y[eid] < 0) {
    const sceneRef = SceneRef[eid];
    if (sceneRef?.mesh) {
      world.ctx.scene.remove(sceneRef.mesh);
    }
    Position.y[eid] = -99999;
  }
}
