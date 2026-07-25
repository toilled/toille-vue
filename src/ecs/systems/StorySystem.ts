import { System } from '../types';
import { ECSWorld } from '../types';
import { StoryState } from '../../game/types';
import { STORY_MISSIONS } from '../../game/StoryManager';

function createInitialState(): StoryState {
  return {
    active: false,
    currentMissionIndex: 0,
    currentDialogueIndex: 0,
    showingDialogue: false,
    showingBriefing: false,
    missionComplete: false,
    missions: STORY_MISSIONS.map((m) => ({
      ...m,
      objectives: m.objectives.map((o) => ({ ...o, completed: false })),
    })),
  };
}

export class StorySystem extends System {
  private state: Ref<StoryState>;
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(storyState: Ref<StoryState>) {
    super();
    this.state = storyState;
    const s = this.state.value;
    if (!s || s.missions.length === 0) {
      this.state.value = createInitialState();
    }
  }

  init(world: ECSWorld) {
    world.resources.storyState = this.state;
    world.resources.updateObjective = (missionIdx: number, objIdx: number) =>
      this.completeObjective(missionIdx, objIdx);
    world.resources.advanceDialogue = () => this.advanceDialogue();
    world.resources.dismissBriefing = () => this.dismissBriefing();
  }

  update(_world: ECSWorld, _dt: number, _time: number): void {
    // Story system is event-driven, no per-frame update needed
  }

  start() {
    const s = createInitialState();
    s.active = true;
    s.showingBriefing = true;
    this.state.value = s;
  }

  stop() {
    this.clearTimers();
    this.state.value.active = false;
  }

  private clearTimers() {
    if (this.advanceTimer !== null) {
      clearTimeout(this.advanceTimer);
      this.advanceTimer = null;
    }
  }

  getState(): StoryState {
    return this.state.value;
  }

  dismissBriefing() {
    const s = this.state.value;
    if (!s.active) return;
    if (s.showingBriefing) {
      s.showingBriefing = false;
      s.showingDialogue = true;
      s.currentDialogueIndex = 0;
      this.state.value = { ...s };
    }
  }

  advanceDialogue() {
    const s = this.state.value;
    if (!s.active || !s.showingDialogue) return;
    const mission = s.missions[s.currentMissionIndex];
    if (s.currentDialogueIndex < mission.dialogue.length - 1) {
      s.currentDialogueIndex++;
      this.state.value = { ...s };
    } else {
      s.showingDialogue = false;
      s.currentDialogueIndex = 0;
      this.state.value = { ...s };
    }
  }

  completeObjective(missionIdx: number, objIdx: number) {
    const s = this.state.value;
    if (!s.active) return;
    const mission = s.missions[missionIdx];
    if (!mission || !mission.objectives[objIdx]) return;
    mission.objectives[objIdx].completed = true;
    const allDone = mission.objectives.every((o) => o.completed);
    if (allDone) {
      s.missionComplete = true;
      if (missionIdx < s.missions.length - 1) {
        this.advanceTimer = setTimeout(() => {
          this.advanceMission();
        }, 3000);
      }
    }
    this.state.value = { ...s };
  }

  private advanceMission() {
    const s = this.state.value;
    if (!s.active) return;
    s.missionComplete = false;
    s.currentMissionIndex++;
    if (s.currentMissionIndex >= s.missions.length) {
      s.active = false;
      this.state.value = { ...s };
      return;
    }
    s.showingBriefing = true;
    this.state.value = { ...s };
  }

  getCurrentMission() {
    const s = this.state.value;
    if (!s.active || s.showingBriefing || s.showingDialogue || s.missionComplete) return null;
    const mission = s.missions[s.currentMissionIndex];
    if (!mission) return null;
    return mission;
  }

  getPlayerObjective(
    playerX: number,
    playerZ: number,
    proximity = 45
  ): { missionIdx: number; objIdx: number } | null {
    const mission = this.getCurrentMission();
    if (!mission) return null;
    for (let i = 0; i < mission.objectives.length; i++) {
      const obj = mission.objectives[i];
      if (obj.completed) continue;
      const dx = playerX - obj.x;
      const dz = playerZ - obj.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < proximity) {
        return { missionIdx: this.state.value.currentMissionIndex, objIdx: i };
      }
    }
    return null;
  }

  getCurrentObjectivePosition(): { x: number; z: number } | null {
    const mission = this.getCurrentMission();
    if (!mission) return null;
    for (const obj of mission.objectives) {
      if (!obj.completed) {
        return { x: obj.x, z: obj.z };
      }
    }
    return null;
  }
}
