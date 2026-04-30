import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  FogExp2,
  Mesh,
  MeshBasicMaterial,
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

export interface SkyEffectConfig {
  cloudCount: number;
  starCount: number;
  fogDensity: number;
  fogColor: number;
  skyTopColor: number;
  skyBottomColor: number;
}

const DEFAULT_CONFIG: SkyEffectConfig = {
  cloudCount: 80,
  starCount: 500,
  fogDensity: 0.0008,
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

  private createSkyDome(): Mesh {
    const geometry = new SphereGeometry(2800, 32, 32);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx && ctx.createLinearGradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#000022');
      gradient.addColorStop(0.3, '#0a0025');
      gradient.addColorStop(0.6, '#150030');
      gradient.addColorStop(0.8, '#1a0035');
      gradient.addColorStop(1, '#0a0015');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = 'rgba(255, 0, 100, 0.03)';
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 512;
        const y = 200 + Math.random() * 200;
        const radius = 50 + Math.random() * 100;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0, 255, 200, 0.02)';
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * 512;
        const y = 300 + Math.random() * 150;
        const radius = 30 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
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

    const starColors = [
      new Color(0xff00ff),
      new Color(0x00ffff),
      new Color(0xffffff),
      new Color(0xffaa00),
      new Color(0x00ff88),
    ];

    for (let i = 0; i < this.config.starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.4;
      const radius = 2000 + Math.random() * 500;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) + 500;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false,
    });

    return new Points(geometry, material);
  }

  addClouds(): void {
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
      const positions = this.stars.geometry.attributes.position.array as Float32Array;
      const time = this.time * 0.1;

      for (let i = 0; i < this.config.starCount; i += 10) {
        positions[i * 3 + 1] += Math.sin(time * 2 + i) * 0.5;
      }
      this.stars.geometry.attributes.position.needsUpdate = true;
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

  dispose(): void {
    if (this.skyDome) {
      this.scene.remove(this.skyDome);
      if (this.skyDome.geometry) {
        this.skyDome.geometry.dispose();
      }
      if (this.skyDome.material) {
        const skyMat = this.skyDome.material as MeshBasicMaterial;
        if (skyMat.map) {
          skyMat.map.dispose();
        }
        if (typeof skyMat.dispose === 'function') {
          skyMat.dispose();
        }
      }
    }

    if (this.stars) {
      this.scene.remove(this.stars);
      if (this.stars.geometry) {
        this.stars.geometry.dispose();
      }
      if (this.stars.material) {
        const starsMat = this.stars.material as PointsMaterial;
        if (typeof starsMat.dispose === 'function') {
          starsMat.dispose();
        }
      }
    }

    for (const cloud of this.cloudSprites) {
      this.scene.remove(cloud);
      if (cloud.material) {
        const mat = cloud.material as SpriteMaterial;
        if (mat.map) {
          mat.map.dispose();
        }
        if (typeof mat.dispose === 'function') {
          mat.dispose();
        }
      }
    }

    this.scene.fog = null;
  }
}
