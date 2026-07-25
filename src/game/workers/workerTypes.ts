export interface CarState {
  index: number;
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  dir: number;
  axis: 'x' | 'z';
  fading: boolean;
  opacity: number;
  turnCooldown: number;
  isPlayerControlled: boolean;
  isPolice: boolean;
  isPlayerHit: boolean;
  isTruck: boolean;
  bodyColor: number;
  currentSpeed: number;
  laneOffset: number;
  upX: number;
  upY: number;
  upZ: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
}

export interface RemotePlayerState {
  id: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  state: 'walking' | 'driving';
  isNew: boolean;
  isRemoved: boolean;
}

export interface SparkEvent {
  x: number;
  y: number;
  z: number;
}

export interface CrashEvent {
  isPlayerInvolved: boolean;
}

export interface GridCell {
  halfW: number;
  halfD: number;
  isRound?: boolean;
}

export interface ControlsData {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export interface RedCarState {
  x: number;
  y: number;
  z: number;
  heading: number;
  speed: number;
  active: boolean;
}
