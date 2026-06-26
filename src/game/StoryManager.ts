import { StoryState, StoryMission } from './types';
import { Ref } from 'vue';

const STORY_MISSIONS: StoryMission[] = [
  {
    id: 'first-contact',
    title: 'FIRST CONTACT',
    brief:
      "A dead drop message lands on your terminal. Encrypted. Urgent. Someone knows you're a runner. They want to meet and the pay is untraceable crypto. The meet point is in the western sector. Move fast — the longer you wait, the more eyes watch.",
    dialogue: [
      '[STATIC] A silhouette detaches from the wall...',
      '"You came. Good. Means you\'re either brave or desperate. Both work for me."',
      '"They call me Ghost. I used to work for Arasaka-Dynamics. Saw things. Files that should never exist."',
      '"They\'re running neural experiments on refugees. Mind-wipe tech. I have proof but I need a runner to extract the data node."',
      '"First job: reach the central data hub and pull the encrypted payload. The coordinates are on this chip."',
      '"Remember: the city grid logs every move. Stay off the main roads. I\'ll find you when you\'re done."',
    ],
    objectives: [
      {
        id: 'reach-meet',
        type: 'goto',
        label: 'FIND GHOST',
        x: -600,
        z: -400,
        completed: false,
        description: 'Navigate to the meet point in the western ruins',
      },
    ],
    completeMessage:
      "Ghost presses a cold datachip into your palm. 'This key opens doors that don't officially exist. Don't lose it.'",
  },
  {
    id: 'data-heist',
    title: 'DATA HEIST',
    brief:
      "Ghost's datachip decodes to a location: a forgotten Arasaka-Dynamics substation in the northern grid. The data node is inside — protected by legacy ICE that hasn't been patched in years. Get in, pull the payload, get out. The subnet pings every 90 seconds. You have one window.",
    dialogue: [
      'The substation hums with dormant power. Screens flicker in standby.',
      "[TERMINAL] 'WARNING: Legacy ICE Core active. Intrusion countermeasures online.'",
      'Your deck slices through the old encryption like a hot knife. Files begin transferring...',
      "[TERMINAL] 'Transfer complete. 47.3GB of classified neural mapping data acquired.'",
      'Alarms blare in the distance. Corporate security is already responding. Time to disappear.',
    ],
    objectives: [
      {
        id: 'reach-substation',
        type: 'goto',
        label: 'INFILTRATE SUBSTATION',
        x: 400,
        z: -600,
        completed: false,
        description: 'Navigate to the Arasaka substation in the northern grid',
      },
      {
        id: 'access-terminal',
        type: 'goto',
        label: 'ACCESS DATA TERMINAL',
        x: 400,
        z: -620,
        completed: false,
        description: 'Reach the terminal and extract the payload',
      },
    ],
    completeMessage:
      "The data burns through your buffer. You've never carried anything this hot. Every corp agent in the city will be looking for you now.",
  },
  {
    id: 'ghost-protocol',
    title: 'GHOST PROTOCOL',
    brief:
      "Ghost's dead drop goes silent. Then a ping — fragmented, panicked. 'They found me. Burning my systems. Three data shards with my research are scattered across the city. Find them before corporate recovery teams do. If they get the full set, I'm dead. So are you.'",
    dialogue: [
      'The city feels different now. Hostile. Every camera a potential eye.',
      "[PING] 'First shard located. Memory fragment: Lab 7, neural mapping subject #441.'",
      "[PING] 'Second shard acquired. Data shows mind-wipe prototypes were tested on 47 subjects.'",
      "[PING] 'Final shard recovered. Ghost's research is complete. He was right.'",
      'Three shards. One picture. Arasaka-Dynamics was building a weapon that could erase memories en masse.',
    ],
    objectives: [
      {
        id: 'shard-1',
        type: 'collect',
        label: 'SHARD 1/3',
        x: -300,
        z: 500,
        completed: false,
        description: 'Recover research shard from the eastern market district',
      },
      {
        id: 'shard-2',
        type: 'collect',
        label: 'SHARD 2/3',
        x: 500,
        z: 300,
        completed: false,
        description: 'Recover research shard from the corporate plaza',
      },
      {
        id: 'shard-3',
        type: 'collect',
        label: 'SHARD 3/3',
        x: -500,
        z: -200,
        completed: false,
        description: 'Recover research shard from the underground tunnels',
      },
    ],
    completeMessage:
      'The three shards merge into a complete file. The evidence is undeniable. This is bigger than Ghost. Bigger than you.',
  },
  {
    id: 'the-exchange',
    title: 'THE EXCHANGE',
    brief:
      "Ghost sends a final encrypted burst: a meet at the south junction. 'Bring everything. We take this public or we die trying.' The net is crawling with corporate ICE. This is the point of no return. You can feel the city holding its breath.",
    dialogue: [
      'Ghost is waiting, leaning against a rusted rail. He looks worse than before. Tired. Hunted.',
      '"You got the full set?" He inspects the shards. A rare smile. "Good. Then we win."',
      '"Journalist on the outside. Clean. Untraceable. She gets the data, the story breaks worldwide."',
      '"Arasaka falls. The refugees get justice. Maybe even compensation. You did good, runner."',
      '"But first — we need to deliver this to the broadcast point. One last run. You in?"',
    ],
    objectives: [
      {
        id: 'meet-ghost',
        type: 'goto',
        label: 'MEET GHOST',
        x: 0,
        z: 700,
        completed: false,
        description: 'Reach the south junction meet point',
      },
    ],
    completeMessage: "Ghost claps your shoulder. 'One more job. Then you're free. We both are.'",
  },
  {
    id: 'reboot',
    title: 'REBOOT',
    brief:
      'The broadcast tower is in the heart of the city — the old Net Broadcast Spire. Ghost has arranged a window: 90 seconds before corporate firewalls reseal. Upload the data. Let the world see. The city will never be the same.',
    dialogue: [
      "The Spire looms above you, a monument to the old connected world. Now it's your escape route.",
      "[TERMINAL] 'Broadcast interface detected. Preparing uplink...'",
      "'Data transfer initiated. 47.3GB uploading at 950Mbps.'",
      "[GHOST VIA COM] 'It's done. The story is out. Every major news network is picking it up.'",
      "'Arasaka-Dynamics stock is crashing as we speak. You changed the world, runner. From the shadows.'",
      "'Get out of the city. Lay low. And if our paths cross again... buy me a drink.'",
    ],
    objectives: [
      {
        id: 'reach-spire',
        type: 'goto',
        label: 'REACH BROADCAST SPIRE',
        x: 0,
        z: 0,
        completed: false,
        description: 'Navigate to the central broadcast spire',
      },
      {
        id: 'upload-data',
        type: 'interact',
        label: 'UPLOAD DATA',
        x: 0,
        z: 20,
        completed: false,
        description: 'Upload the evidence to the world',
      },
    ],
    completeMessage:
      "The deed is done. Somewhere in the distance, sirens wail. But they're not for you. For the first time in years, the city feels like it could change.",
  },
];

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

export class StoryManager {
  private state: Ref<StoryState>;
  private advanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(storyState: Ref<StoryState>) {
    this.state = storyState;
    const s = this.state.value;
    if (!s || s.missions.length === 0) {
      this.state.value = createInitialState();
    }
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

  private getCurrentMission() {
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
