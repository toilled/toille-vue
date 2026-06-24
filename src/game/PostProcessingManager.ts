import { Scene, PerspectiveCamera, WebGLRenderer, Vector2, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { BrowserQuality } from '../utils/BrowserDetect';

export function setupPostProcessing(
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  quality: BrowserQuality
): EffectComposer {
  const renderScene = new RenderPass(scene, camera);
  const size = renderer.getSize(new Vector2());

  const bloomPass = new UnrealBloomPass(
    size,
    quality.bloomStrength,
    quality.bloomRadius,
    quality.bloomThreshold
  );
  bloomPass.threshold = quality.bloomThreshold;
  bloomPass.strength = quality.bloomStrength;
  bloomPass.radius = quality.bloomRadius;

  const outputPass = new OutputPass();

  const renderTarget = new WebGLRenderTarget(size.width, size.height, {
    samples: quality.msaaSamples,
  });

  const composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  return composer;
}
