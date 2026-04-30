import { Scene, PerspectiveCamera, WebGLRenderer, Vector2, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

export function setupPostProcessing(
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
): EffectComposer {
  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.5;
  bloomPass.strength = 1.0;
  bloomPass.radius = 0.8;

  const outputPass = new OutputPass();

  const renderTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    samples: 4,
  });

  const composer = new EffectComposer(renderer, renderTarget);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  return composer;
}
