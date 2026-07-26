import { Scene } from 'three';
import { FireworkSystem } from './fireworks/FireworkSystem';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export class KonamiManager {
  private konamiCode = KONAMI_CODE;
  private konamiIndex = 0;
  private fireworks: FireworkSystem;

  constructor(scene: Scene) {
    this.fireworks = new FireworkSystem(scene);
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === this.konamiCode[this.konamiIndex]) {
      this.konamiIndex++;
      if (this.konamiIndex === this.konamiCode.length) {
        this.fireworks.startShow(10000);
        this.konamiIndex = 0;
      }
    } else {
      this.konamiIndex = 0;
    }
  }

  public update(dt: number): void {
    this.fireworks.update(dt);
  }

  public dispose(): void {
    this.fireworks.dispose();
  }
}
