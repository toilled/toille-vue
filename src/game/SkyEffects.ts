import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  FogExp2,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Points,
  PointsMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  AdditiveBlending,
  Color,
  SphereGeometry,
} from 'three';
import { createCloudTexture } from '../utils/TextureGenerator';

interface SkyEffectConfig {
  cloudCount: number;
  starCount: number;
  fogDensity: number;
  fogColor: number;
  skyTopColor: number;
  skyBottomColor: number;
}

const DEFAULT_CONFIG: SkyEffectConfig = {
  cloudCount: 40,
  starCount: 400,
  fogDensity: 0.0007,
  fogColor: 0x0a0015,
  skyTopColor: 0x000011,
  skyBottomColor: 0x1a0030,
};

export class SkyEffects {
  private scene: Scene;
  private config: SkyEffectConfig;
  private cloudSprites: Sprite[] = [];
  private skyDome: Mesh;
  private stars: Points;
  private time: number = 0;
  private fog: FogExp2;
  private cloudsAdded = false;

  constructor(scene: Scene, config: Partial<SkyEffectConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.fog = new FogExp2(this.config.fogColor, this.config.fogDensity);
    this.scene.fog = this.fog;

    this.skyDome = this.createSkyDome();
    this.stars = this.createStars();

    this.scene.add(this.skyDome);
    this.scene.add(this.stars);
  }

  private drawSkyGradient(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#000011');
    gradient.addColorStop(0.15, '#050020');
    gradient.addColorStop(0.35, '#0a0028');
    gradient.addColorStop(0.55, '#150035');
    gradient.addColorStop(0.7, '#1a0035');
    gradient.addColorStop(0.82, '#1a0030');
    gradient.addColorStop(0.9, '#150025');
    gradient.addColorStop(0.95, '#200020');
    gradient.addColorStop(1, '#2a0015');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  }

  private drawHorizonGlow(ctx: CanvasRenderingContext2D) {
    const glow = ctx.createRadialGradient(256, 470, 10, 256, 470, 120);
    glow.addColorStop(0, 'rgba(255, 50, 100, 0.15)');
    glow.addColorStop(0.4, 'rgba(255, 0, 100, 0.08)');
    glow.addColorStop(0.7, 'rgba(100, 0, 200, 0.04)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 380, 512, 132);

    const glow2 = ctx.createRadialGradient(256, 470, 10, 256, 470, 100);
    glow2.addColorStop(0, 'rgba(0, 200, 255, 0.08)');
    glow2.addColorStop(1, 'rgba(0, 200, 255, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(100, 400, 312, 112);
  }

  private drawNebulaPatches(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 0, 120, 0.04)';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 350;
      const radius = 40 + Math.random() * 100;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0, 200, 255, 0.03)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 300;
      const radius = 30 + Math.random() * 80;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private createSkyDome(): Mesh {
    const geometry = new SphereGeometry(2800, 32, 32);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx && typeof ctx.createLinearGradient === 'function') {
      this.drawSkyGradient(ctx);
      this.drawHorizonGlow(ctx);
      this.drawNebulaPatches(ctx);
    }

    const texture = new CanvasTexture(canvas);

    const material = new MeshBasicMaterial({
      map: texture,
      side: BackSide,
      fog: true,
    });

    return new Mesh(geometry, material);
  }

  private createStars(): Points {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(this.config.starCount * 3);
    const colors = new Float32Array(this.config.starCount * 3);
    const sizes = new Float32Array(this.config.starCount);

    const starColors = [
      new Color(0xff00ff),
      new Color(0x00ffff),
      new Color(0xffffff),
      new Color(0xffaa00),
      new Color(0x00ff88),
      new Color(0x8888ff),
      new Color(0xff4488),
      new Color(0x44ffaa),
    ];

    for (let i = 0; i < this.config.starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const maxPhi = Math.PI * 0.45;
      const clampedPhi = Math.min(phi, maxPhi);
      const radius = 1800 + Math.random() * 700;

      positions[i * 3] = radius * Math.sin(clampedPhi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(clampedPhi) + 600;
      positions[i * 3 + 2] = radius * Math.sin(clampedPhi) * Math.sin(theta);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 1 + Math.random() * 4;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    const material = new PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    return new Points(geometry, material);
  }

  addClouds(): void {
    if (this.cloudsAdded) return;
    this.cloudsAdded = true;
    const cloudTexture = createCloudTexture();

    for (let i = 0; i < this.config.cloudCount; i++) {
      const material = new SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.2,
        blending: AdditiveBlending,
        depthWrite: false,
      });

      const sprite = new Sprite(material);

      const x = (Math.random() - 0.5) * 3000;
      const y = 400 + Math.random() * 800;
      const z = (Math.random() - 0.5) * 3000;
      sprite.position.set(x, y, z);

      const scale = 200 + Math.random() * 400;
      sprite.scale.set(scale, scale * 0.4, 1);

      sprite.userData = {
        baseX: x,
        baseZ: z,
        speed: 0.2 + Math.random() * 0.5,
        amplitude: 50 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
      };

      this.cloudSprites.push(sprite);
      this.scene.add(sprite);
    }
  }

  private starUpdateCounter = 0;
  private starUpdateInterval = 8;
  private starTwinkleEnabled = true;

  setStarTwinkleEnabled(enabled: boolean) {
    this.starTwinkleEnabled = enabled;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    for (const cloud of this.cloudSprites) {
      const userData = cloud.userData as {
        baseX: number;
        baseZ: number;
        speed: number;
        amplitude: number;
        phase: number;
      };
      cloud.position.x =
        userData.baseX + Math.sin(this.time * userData.speed + userData.phase) * userData.amplitude;
      cloud.position.z =
        userData.baseZ +
        Math.cos(this.time * userData.speed * 0.7 + userData.phase) * userData.amplitude * 0.5;
    }

    if (this.stars) {
      this.starUpdateCounter++;

      if (this.starTwinkleEnabled && this.starUpdateCounter % this.starUpdateInterval === 0) {
        const positions = this.stars.geometry.attributes.position.array as Float32Array;
        const time = this.time * 0.1;

        for (let i = 0; i < this.config.starCount; i += 5) {
          positions[i * 3 + 1] += Math.sin(time * 1.5 + i * 0.7) * 0.3;
        }
        this.stars.geometry.attributes.position.needsUpdate = true;

        // Twinkle the star opacity via size
        if (this.stars.geometry.attributes.size) {
          const sizes = this.stars.geometry.attributes.size.array as Float32Array;
          for (let i = 0; i < this.config.starCount; i += 3) {
            sizes[i] = (1 + Math.random() * 4) * (0.7 + 0.3 * Math.sin(time * 3 + i * 1.1));
          }
          this.stars.geometry.attributes.size.needsUpdate = true;
        }
      }
    }
  }

  setFogDensity(density: number): void {
    this.fog.density = density;
  }

  setFogColor(color: number): void {
    this.fog.color.setHex(color);
  }

  triggerLightning(): void {
    this.fog.density = 0.0015;

    setTimeout(() => {
      this.fog.density = this.config.fogDensity;
    }, 100);

    setTimeout(() => {
      this.fog.density = 0.002;
    }, 150);

    setTimeout(() => {
      this.fog.density = this.config.fogDensity;
    }, 200);
  }

  private disposeObject(obj: Object3D) {
    this.scene.remove(obj);
    const mesh = obj as Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mat = mesh.material as { map?: { dispose(): void }; dispose?(): void };
      if (mat.map) mat.map.dispose();
      if (typeof mat.dispose === 'function') mat.dispose();
    }
  }

  dispose(): void {
    if (this.skyDome) this.disposeObject(this.skyDome);
    if (this.stars) this.disposeObject(this.stars);
    for (const cloud of this.cloudSprites) {
      this.disposeObject(cloud);
    }
    this.scene.fog = null;
  }
}
