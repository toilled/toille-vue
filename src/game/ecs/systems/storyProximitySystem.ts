import { STORY_TRIGGER_POSITION } from '../../StoryItemsManager';
import type { GameWorld } from '../world';

let lastProximityCheck = 0;

export function storyProximitySystem(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'exploration') return;

  const now = Date.now();
  if (now - lastProximityCheck < 500) return;
  lastProximityCheck = now;

  checkStoryTriggerProximity(world);
  checkStoryObjectives(world);
}

function checkStoryTriggerProximity(world: GameWorld) {
  const { ctx } = world;
  if (!ctx.nearStoryTrigger || !ctx.storyState) return;
  const ss = ctx.storyState.value;
  if (ss.active || ss.missions.length === 0) {
    ctx.nearStoryTrigger.value = false;
    return;
  }

  const px = ctx.camera.position.x;
  const pz = ctx.camera.position.z;
  const dx = px - STORY_TRIGGER_POSITION.x;
  const dz = pz - STORY_TRIGGER_POSITION.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  ctx.nearStoryTrigger.value = dist < 50;
}

function checkStoryObjectives(world: GameWorld) {
  const { ctx } = world;
  const ss = ctx.storyState?.value;
  if (!ctx.updateObjective || !ctx.storyState) return;
  if (!ss?.active || ss.showingBriefing || ss.showingDialogue || ss.missionComplete) return;

  const mission = ss.missions[ss.currentMissionIndex];
  if (!mission) return;

  const px = ctx.camera.position.x;
  const pz = ctx.camera.position.z;

  for (let i = 0; i < mission.objectives.length; i++) {
    const obj = mission.objectives[i];
    if (obj.completed) continue;
    const dx = px - obj.x;
    const dz = pz - obj.z;
    if (Math.sqrt(dx * dx + dz * dz) < 50) {
      ctx.updateObjective(ss.currentMissionIndex, i);
      break;
    }
  }
}

export function updateExplorationMinimap(world: GameWorld) {
  const { ctx } = world;
  if (ctx.activeMode !== 'exploration') return;
  if (!ctx.minimapData || !ctx.storyState) return;

  const ss = ctx.storyState.value;
  const mdata = ctx.minimapData.value;
  mdata.playerX = ctx.camera.position.x;
  mdata.playerZ = ctx.camera.position.z;
  mdata.playerRotation = ctx.camera.rotation.y;

  if (ss.active && ss.missions[ss.currentMissionIndex]) {
    mdata.objectives = ss.missions[ss.currentMissionIndex].objectives.map((o) => ({
      x: o.x,
      z: o.z,
      completed: o.completed,
      label: o.label,
      type: o.type,
    }));
  } else {
    mdata.objectives = [];
  }

  ctx.minimapData.value = { ...mdata };
}
