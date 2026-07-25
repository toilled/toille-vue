import { query } from 'bitecs';
import { Euler, Quaternion, Vector3 } from 'three';
import { Position, ExplorationModeTag } from '../components';
import { BOUNDS } from '../../config';
import { getHeight } from '../../../utils/HeightMap';
import { checkGridCollision } from '../../../utils/GridCollision';
import type { GameWorld } from '../world';
import type { GameWorldContext } from '../components';

const playerRotation = new Euler(0, 0, 0, 'YXZ');
let velocityY = 0;
let isJumping = false;
let isTransitioning = true;

const gravity = 0.015;
const jumpStrength = 0.4;

export function explorationMovementSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'exploration') return;

  query(world, [Position, ExplorationModeTag]);

  if (isTransitioning) {
    handleTransition(ctx);
    return;
  }

  handleMobileLook(ctx);
  processMovement(ctx);
  enforceCameraBounds(ctx);
  updateJumpAndBob(ctx);
}

function handleTransition(ctx: GameWorldContext) {
  const { camera } = ctx;
  const targetPos = new Vector3(0, 3, 0);
  const targetQ = new Quaternion().setFromEuler(playerRotation);

  camera.position.lerp(targetPos, 0.05);
  camera.quaternion.slerp(targetQ, 0.05);

  if (camera.position.distanceTo(targetPos) < 1) {
    isTransitioning = false;
    camera.position.copy(targetPos);
    camera.rotation.copy(playerRotation);
  }
}

function handleMobileLook(ctx: GameWorldContext) {
  if (!ctx.isMobile.value) return;
  const { camera, input } = ctx;
  const rotateSpeed = 0.03;
  if (input.lookLeft) playerRotation.y += rotateSpeed;
  if (input.lookRight) playerRotation.y -= rotateSpeed;
  if (input.lookUp) playerRotation.x += rotateSpeed;
  if (input.lookDown) playerRotation.x -= rotateSpeed;

  playerRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, playerRotation.x));
  camera.rotation.copy(playerRotation);
}

function processMovement(ctx: GameWorldContext) {
  const { camera, input, occupiedGrids } = ctx;
  const speed = 2.0;

  const frontVector = new Vector3(0, 0, Number(input.backward) - Number(input.forward));
  const sideVector = new Vector3(Number(input.left) - Number(input.right), 0, 0);

  const direction = new Vector3()
    .subVectors(frontVector, sideVector)
    .normalize()
    .multiplyScalar(speed)
    .applyEuler(new Euler(0, camera.rotation.y, 0));

  const nextX = camera.position.x + direction.x;
  const nextZ = camera.position.z + direction.z;

  if (!checkGridCollision(nextX, nextZ, occupiedGrids, 2)) {
    camera.position.x = nextX;
    camera.position.z = nextZ;
  }
}

function enforceCameraBounds(ctx: GameWorldContext) {
  const { camera } = ctx;
  if (camera.position.x > BOUNDS) camera.position.x = -BOUNDS;
  if (camera.position.x < -BOUNDS) camera.position.x = BOUNDS;
  if (camera.position.z > BOUNDS) camera.position.z = -BOUNDS;
  if (camera.position.z < -BOUNDS) camera.position.z = BOUNDS;
}

function updateJumpAndBob(ctx: GameWorldContext) {
  const { camera, input } = ctx;
  const currentGroundH = getHeight(camera.position.x, camera.position.z) + 3;

  if (isJumping) {
    camera.position.y += velocityY;
    velocityY -= gravity;
    if (camera.position.y <= currentGroundH) {
      camera.position.y = currentGroundH;
      isJumping = false;
      velocityY = 0;
    }
  } else if (input.forward || input.backward || input.left || input.right) {
    camera.position.y = currentGroundH + Math.sin(Date.now() * 0.01) * 0.1;
  } else {
    camera.position.y = currentGroundH;
  }
}

export function explorationJumpSystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'exploration') return;
  if (ctx.input.jump && !isJumping) {
    isJumping = true;
    velocityY = jumpStrength;
  }
}

export function resetExplorationState() {
  isTransitioning = true;
  isJumping = false;
  velocityY = 0;
  playerRotation.set(0, 0, 0);
}
