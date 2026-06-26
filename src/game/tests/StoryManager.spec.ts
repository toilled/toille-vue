import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StoryManager } from '../StoryManager';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { StoryState } from '../types';

function emptyState(): StoryState {
  return {
    active: false,
    currentMissionIndex: 0,
    currentDialogueIndex: 0,
    showingDialogue: false,
    showingBriefing: false,
    missionComplete: false,
    missions: [],
  };
}

function startMission(manager: StoryManager) {
  manager.start();
  manager.dismissBriefing();
  const mission = manager.getState().missions[0];
  for (let i = 0; i < mission.dialogue.length; i++) {
    manager.advanceDialogue();
  }
}

describe('StoryManager', () => {
  let state: Ref<StoryState>;
  let manager: StoryManager;

  beforeEach(() => {
    vi.useFakeTimers();
    state = ref(emptyState()) as Ref<StoryState>;
    manager = new StoryManager(state);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes state when passed null/empty', () => {
    expect(state.value).not.toBeNull();
    expect(state.value.active).toBe(false);
    expect(state.value.missions.length).toBe(5);
  });

  it('does not overwrite existing state with missions', () => {
    const missions = [
      {
        id: 'custom',
        title: 'CUSTOM',
        brief: '',
        dialogue: ['Hello'],
        objectives: [
          {
            id: 'o1',
            type: 'goto' as const,
            label: 'GO',
            x: 0,
            z: 0,
            completed: false,
            description: '',
          },
        ],
        completeMessage: '',
      },
    ];
    const existing = ref<StoryState>({
      active: false,
      currentMissionIndex: 2,
      currentDialogueIndex: 1,
      showingDialogue: true,
      showingBriefing: false,
      missionComplete: false,
      missions,
    });
    const m = new StoryManager(existing);
    expect(existing.value.currentMissionIndex).toBe(2);
    expect(m.getState().currentMissionIndex).toBe(2);
  });

  it('start sets active and showingBriefing', () => {
    manager.start();
    expect(state.value.active).toBe(true);
    expect(state.value.showingBriefing).toBe(true);
  });

  it('stop sets active to false', () => {
    manager.start();
    manager.stop();
    expect(state.value.active).toBe(false);
  });

  it('dismissBriefing transitions to dialogue', () => {
    manager.start();
    manager.dismissBriefing();
    expect(state.value.showingBriefing).toBe(false);
    expect(state.value.showingDialogue).toBe(true);
    expect(state.value.currentDialogueIndex).toBe(0);
  });

  it('dismissBriefing does nothing when not active', () => {
    manager.dismissBriefing();
    expect(state.value.showingBriefing).toBe(false);
  });

  it('advanceDialogue increments currentDialogueIndex', () => {
    manager.start();
    manager.dismissBriefing();
    expect(state.value.currentDialogueIndex).toBe(0);
    manager.advanceDialogue();
    expect(state.value.currentDialogueIndex).toBe(1);
  });

  it('advanceDialogue finishes dialogue at last line', () => {
    manager.start();
    manager.dismissBriefing();
    const mission = state.value.missions[0];
    for (let i = 0; i < mission.dialogue.length; i++) {
      manager.advanceDialogue();
    }
    expect(state.value.showingDialogue).toBe(false);
    expect(state.value.currentDialogueIndex).toBe(0);
  });

  it('advanceDialogue does nothing when not active', () => {
    manager.advanceDialogue();
    expect(state.value.currentDialogueIndex).toBe(0);
  });

  it('completeObjective marks an objective as done', () => {
    startMission(manager);
    manager.completeObjective(0, 0);
    expect(state.value.missions[0].objectives[0].completed).toBe(true);
  });

  it('completeObjective advances mission when all objectives done', () => {
    startMission(manager);
    manager.completeObjective(0, 0);
    expect(state.value.missionComplete).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(state.value.currentMissionIndex).toBe(1);
    expect(state.value.showingBriefing).toBe(true);
  });

  it('completeObjective does not auto-advance past last mission', () => {
    // complete missions 0-3
    for (let m = 0; m < 4; m++) {
      startMission(manager);
      for (let o = 0; o < state.value.missions[m].objectives.length; o++) {
        manager.completeObjective(m, o);
      }
      vi.advanceTimersByTime(3000);
    }
    // mission 4 is the last one — no auto-advance
    startMission(manager);
    for (let o = 0; o < state.value.missions[4].objectives.length; o++) {
      manager.completeObjective(4, o);
    }
    vi.advanceTimersByTime(3000);
    expect(state.value.active).toBe(true);
    expect(state.value.missionComplete).toBe(true);
  });

  it('completeObjective does nothing when not active', () => {
    manager.completeObjective(0, 0);
    expect(state.value.missions[0].objectives[0].completed).toBe(false);
  });

  it('getPlayerObjective returns nearby uncompleted objective', () => {
    startMission(manager);
    const result = manager.getPlayerObjective(-600, -400, 100);
    expect(result).toEqual({ missionIdx: 0, objIdx: 0 });
  });

  it('getPlayerObjective returns null when too far', () => {
    startMission(manager);
    const result = manager.getPlayerObjective(9999, 9999, 45);
    expect(result).toBeNull();
  });

  it('getPlayerObjective returns null when showing dialogue', () => {
    manager.start();
    manager.dismissBriefing();
    const result = manager.getPlayerObjective(-600, -400, 100);
    expect(result).toBeNull();
  });

  it('getPlayerObjective returns null when showing briefing', () => {
    manager.start();
    const result = manager.getPlayerObjective(-600, -400, 100);
    expect(result).toBeNull();
  });

  it('getCurrentObjectivePosition returns first uncompleted objective', () => {
    startMission(manager);
    const pos = manager.getCurrentObjectivePosition();
    expect(pos).toEqual({ x: -600, z: -400 });
  });

  it('getCurrentObjectivePosition returns null before mission starts', () => {
    const pos = manager.getCurrentObjectivePosition();
    expect(pos).toBeNull();
  });

  it('stop clears the advance timer', () => {
    startMission(manager);
    manager.completeObjective(0, 0);
    manager.stop();
    vi.advanceTimersByTime(3000);
    expect(state.value.currentMissionIndex).toBe(0);
  });

  it('getState returns current state', () => {
    manager.start();
    const s = manager.getState();
    expect(s.active).toBe(true);
  });
});
