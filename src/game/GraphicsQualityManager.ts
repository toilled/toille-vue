import {
  PCFSoftShadowMap,
  PCFShadowMap,
  WebGLRenderer,
  ACESFilmicToneMapping,
  Vector2,
  WebGLRenderTarget,
  Scene,
  PerspectiveCamera,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

export enum GraphicsQualityLevel {
  MINIMUM = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  ULTRA = 4,
}

export interface QualitySettings {
  name: string;
  level: number;
  pixelRatio: number;
  shadowMapSize: number;
  shadowMapType: typeof PCFSoftShadowMap;
  antialias: boolean;
  antialiasSamples: number;
  bloomEnabled: boolean;
  bloomThreshold: number;
  bloomStrength: number;
  bloomRadius: number;
  fxaaEnabled: boolean;
  buildingDetail: number;
  carCount: number;
  sparkCount: number;
  reflectionEnabled: boolean;
  volumetricClouds: boolean;
  toneMapping: typeof ACESFilmicToneMapping;
  toneMappingExposure: number;
  maxFogDistance: number;
  lodEnabled: boolean;
}

export const QUALITY_PRESETS: Record<GraphicsQualityLevel, QualitySettings> = {
  [GraphicsQualityLevel.ULTRA]: {
    name: "Ultra",
    level: 4,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 4096,
    shadowMapType: PCFSoftShadowMap,
    antialias: true,
    antialiasSamples: 4,
    bloomEnabled: true,
    bloomThreshold: 0.2,
    bloomStrength: 1.5,
    bloomRadius: 0.8,
    fxaaEnabled: false,
    buildingDetail: 1.0,
    carCount: 150,
    sparkCount: 2000,
    reflectionEnabled: true,
    volumetricClouds: true,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    maxFogDistance: 3000,
    lodEnabled: true,
  },
  [GraphicsQualityLevel.HIGH]: {
    name: "High",
    level: 3,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    shadowMapSize: 2048,
    shadowMapType: PCFSoftShadowMap,
    antialias: true,
    antialiasSamples: 2,
    bloomEnabled: true,
    bloomThreshold: 0.3,
    bloomStrength: 1.2,
    bloomRadius: 0.6,
    fxaaEnabled: true,
    buildingDetail: 0.8,
    carCount: 100,
    sparkCount: 1500,
    reflectionEnabled: true,
    volumetricClouds: false,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.2,
    maxFogDistance: 2500,
    lodEnabled: true,
  },
  [GraphicsQualityLevel.MEDIUM]: {
    name: "Medium",
    level: 2,
    pixelRatio: 1,
    shadowMapSize: 1024,
    shadowMapType: PCFShadowMap,
    antialias: false,
    antialiasSamples: 0,
    bloomEnabled: true,
    bloomThreshold: 0.4,
    bloomStrength: 1.0,
    bloomRadius: 0.5,
    fxaaEnabled: true,
    buildingDetail: 0.6,
    carCount: 70,
    sparkCount: 1000,
    reflectionEnabled: false,
    volumetricClouds: false,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    maxFogDistance: 2000,
    lodEnabled: true,
  },
  [GraphicsQualityLevel.LOW]: {
    name: "Low",
    level: 1,
    pixelRatio: 0.75,
    shadowMapSize: 512,
    shadowMapType: PCFShadowMap,
    antialias: false,
    antialiasSamples: 0,
    bloomEnabled: true,
    bloomThreshold: 0.5,
    bloomStrength: 0.8,
    bloomRadius: 0.4,
    fxaaEnabled: false,
    buildingDetail: 0.4,
    carCount: 40,
    sparkCount: 500,
    reflectionEnabled: false,
    volumetricClouds: false,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 1.0,
    maxFogDistance: 1500,
    lodEnabled: false,
  },
  [GraphicsQualityLevel.MINIMUM]: {
    name: "Minimum",
    level: 0,
    pixelRatio: 0.5,
    shadowMapSize: 256,
    shadowMapType: PCFShadowMap,
    antialias: false,
    antialiasSamples: 0,
    bloomEnabled: false,
    bloomThreshold: 0.8,
    bloomStrength: 0.5,
    bloomRadius: 0.3,
    fxaaEnabled: false,
    buildingDetail: 0.2,
    carCount: 20,
    sparkCount: 200,
    reflectionEnabled: false,
    volumetricClouds: false,
    toneMapping: ACESFilmicToneMapping,
    toneMappingExposure: 0.8,
    maxFogDistance: 1000,
    lodEnabled: false,
  },
};

export enum GPUTier {
  UNKNOWN = 0,
  LOW_END = 1,
  INTEGRATED = 2,
  MID_RANGE = 3,
  HIGH_END = 4,
  ULTRA = 5,
}

export interface PerformanceMetrics {
  fps: number;
  avgFrameTime: number;
  gpuTier: GPUTier;
}

export class GraphicsQualityManager {
  private currentLevel: GraphicsQualityLevel = GraphicsQualityLevel.MEDIUM;
  private targetFps: number = 50;
  private minFps: number = 25;
  private frameTimeHistory: number[] = [];
  private readonly frameTimeHistorySize = 60;
  private autoAdjust: boolean = true;
  private lastAdjustmentTime: number = 0;
  private readonly adjustmentCooldownMs: number = 1000;
  private rAFId: number = 0;
  private lastNotifiedLevel: GraphicsQualityLevel = GraphicsQualityLevel.MEDIUM;
  public onAutoAdjust: ((level: GraphicsQualityLevel) => void) | null = null;
  private lastTime: number = 0;
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  constructor(autoAdjust: boolean = true) {
    this.autoAdjust = autoAdjust;
    this.detectInitialQuality();
  }

  private detectInitialQuality(): void {
    const gpuInfo = this.detectGPU();
    const tier = this.classifyGPU(gpuInfo);

    if (tier >= GPUTier.HIGH_END) {
      this.currentLevel = GraphicsQualityLevel.ULTRA;
    } else if (tier >= GPUTier.MID_RANGE) {
      this.currentLevel = GraphicsQualityLevel.HIGH;
    } else if (tier >= GPUTier.INTEGRATED) {
      this.currentLevel = GraphicsQualityLevel.MEDIUM;
    } else {
      this.currentLevel = GraphicsQualityLevel.LOW;
    }
  }

  private detectGPU(): { vendor: string; renderer: string } {
    if (typeof window === "undefined") {
      return { vendor: "unknown", renderer: "unknown" };
    }

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (!gl) {
      return { vendor: "unknown", renderer: "unknown" };
    }

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) {
      return { vendor: "unknown", renderer: "unknown" };
    }

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return { vendor, renderer: renderer.toLowerCase() };
  }

  private classifyGPU(gpuInfo: { vendor: string; renderer: string }): GPUTier {
    const r = gpuInfo.renderer;

    if (
      r.includes("nvidia") ||
      r.includes("rtx") ||
      r.includes("gtx 30") ||
      r.includes("gtx 40") ||
      r.includes("radeon rx 6") ||
      r.includes("radeon rx 7")
    ) {
      if (r.includes("4090") || r.includes("4080") || r.includes("7900 xtx")) {
        return GPUTier.ULTRA;
      }
      return GPUTier.HIGH_END;
    }

    if (
      r.includes("gtx 16") ||
      r.includes("gtx 10") ||
      r.includes("radeon rx 5") ||
      r.includes("radeon rx vega") ||
      r.includes("intel iris")
    ) {
      return GPUTier.MID_RANGE;
    }

    if (
      r.includes("intel uhd") ||
      r.includes("intel hd") ||
      r.includes("mali-g") ||
      r.includes("adreno")
    ) {
      return GPUTier.INTEGRATED;
    }

    if (r.includes("powervr") || r.includes("apple gpu")) {
      return GPUTier.MID_RANGE;
    }

    return GPUTier.UNKNOWN;
  }

  public startMonitoring(): void {
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;
    this.frameCount = 0;
    this.monitorFrame();
  }

  public stopMonitoring(): void {
    if (this.rAFId) {
      cancelAnimationFrame(this.rAFId);
    }
  }

  private monitorFrame = (): void => {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frameTimeHistory.push(delta);
    if (this.frameTimeHistory.length > this.frameTimeHistorySize) {
      this.frameTimeHistory.shift();
    }

    this.frameCount++;
    if (now - this.fpsUpdateTime >= 500) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (now - this.fpsUpdateTime),
      );
      this.frameCount = 0;
      this.fpsUpdateTime = now;

      if (this.autoAdjust) {
        this.periodicAdjustment();
      }
    }

    this.rAFId = requestAnimationFrame(this.monitorFrame);
  };

  private periodicAdjustment(): void {
    const now = Date.now();
    if (now - this.lastAdjustmentTime < this.adjustmentCooldownMs) {
      return;
    }

    const avgFrameTime = this.getAverageFrameTime();
    const currentFps = Math.round(1000 / avgFrameTime);

    if (
      currentFps >= this.targetFps &&
      this.currentLevel < GraphicsQualityLevel.ULTRA
    ) {
      this.currentLevel++;
      this.lastAdjustmentTime = now;
      this.lastNotifiedLevel = this.currentLevel;
      if (this.onAutoAdjust) {
        this.onAutoAdjust(this.currentLevel);
      }
      return;
    }

    if (
      currentFps < this.minFps &&
      this.currentLevel > GraphicsQualityLevel.MINIMUM
    ) {
      this.currentLevel--;
      this.lastAdjustmentTime = now;
      this.lastNotifiedLevel = this.currentLevel;
      if (this.onAutoAdjust) {
        this.onAutoAdjust(this.currentLevel);
      }
    }
  }

  public getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) {
      return 16.67;
    }
    return (
      this.frameTimeHistory.reduce((a, b) => a + b, 0) /
      this.frameTimeHistory.length
    );
  }

  public getMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      avgFrameTime: this.getAverageFrameTime(),
      gpuTier: this.classifyGPU(this.detectGPU()),
    };
  }

  public getCurrentLevel(): GraphicsQualityLevel {
    return this.currentLevel;
  }

  public getCurrentSettings(): QualitySettings {
    return QUALITY_PRESETS[this.currentLevel];
  }

  public setQualityLevel(level: GraphicsQualityLevel): void {
    this.currentLevel = Math.max(
      GraphicsQualityLevel.MINIMUM,
      Math.min(GraphicsQualityLevel.ULTRA, level),
    );
  }

  public getQualityLevelName(): string {
    return QUALITY_PRESETS[this.currentLevel].name;
  }

  public adjustQuality(increase: boolean): boolean {
    const newLevel = increase ? this.currentLevel + 1 : this.currentLevel - 1;

    if (
      newLevel >= GraphicsQualityLevel.MINIMUM &&
      newLevel <= GraphicsQualityLevel.ULTRA
    ) {
      this.currentLevel = newLevel;
      this.lastAdjustmentTime = Date.now();
      return true;
    }
    return false;
  }

  public canIncreaseQuality(): boolean {
    return this.currentLevel < GraphicsQualityLevel.ULTRA;
  }

  public canDecreaseQuality(): boolean {
    return this.currentLevel > GraphicsQualityLevel.MINIMUM;
  }

  private setLevel(newLevel: GraphicsQualityLevel): void {
    this.currentLevel = Math.max(
      GraphicsQualityLevel.MINIMUM,
      Math.min(GraphicsQualityLevel.ULTRA, newLevel),
    );
  }
}

export function setupPostProcessingWithQuality(
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  settings: QualitySettings,
): EffectComposer {
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    settings.bloomStrength,
    settings.bloomRadius,
    settings.bloomThreshold,
  );

  const passes = [renderScene];

  if (settings.bloomEnabled) {
    passes.push(bloomPass);
  }

  if (settings.fxaaEnabled) {
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms["resolution"].value.x =
      1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms["resolution"].value.y =
      1 / (window.innerHeight * pixelRatio);
    passes.push(fxaaPass);
  }

  passes.push(new OutputPass());

  const renderTarget = new WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      samples: settings.antialiasSamples,
    },
  );

  const composer = new EffectComposer(renderer, renderTarget);

  for (const pass of passes) {
    composer.addPass(pass);
  }

  return composer;
}

export function updateRendererSettings(
  renderer: WebGLRenderer,
  settings: QualitySettings,
): void {
  renderer.setPixelRatio(settings.pixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = settings.shadowMapType;
  renderer.toneMapping = settings.toneMapping;
  renderer.toneMappingExposure = settings.toneMappingExposure;
}
