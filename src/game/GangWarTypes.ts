import { Group, Mesh, Vector3 } from 'three';

export interface GangConfig {
  id: number;
  color: number;
  name: string;
}

export const GANGS: GangConfig[] = [
  { id: 0, color: 0x00ff00, name: 'Neon Vipers' },
  { id: 1, color: 0xff00ff, name: 'Cyber Punks' },
  { id: 2, color: 0x00ffff, name: 'Data Ghosts' },
  { id: 3, color: 0xff0000, name: 'Red Dragons' },
];

export class Projectile {
  mesh: Mesh;
  velocity: Vector3;
  life: number;
  shooterId: number;
  // fallow-ignore-next-line unused-class-member
  damage: number = 1;

  constructor(mesh: Mesh, velocity: Vector3, shooterId: number) {
    this.mesh = mesh;
    this.velocity = velocity;
    this.life = 2.0;
    this.shooterId = shooterId;
  }
}

export class Warrior {
  group: Group;
  gangId: number;
  hp: number = 3;
  state: 'IDLE' | 'COMBAT' | 'DEAD' = 'IDLE';
  target: Warrior | null = null;
  cooldown: number = 0;
  speed: number = 5 + Math.random() * 5;
  accuracy: number = 0.1;

  head: Mesh;
  body: Mesh;
  gun: Mesh;

  flashTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(group: Group, gangId: number, head: Mesh, body: Mesh, gun: Mesh) {
    this.group = group;
    this.gangId = gangId;
    this.head = head;
    this.body = body;
    this.gun = gun;
  }

  clearFlashTimer() {
    if (this.flashTimerId !== null) {
      clearTimeout(this.flashTimerId);
      this.flashTimerId = null;
    }
  }
}
