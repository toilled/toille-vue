import { Scene, PerspectiveCamera, WebGLRenderer, Vector2, WebGLRenderTarget } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function setupPostProcessing(
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  msaaSamples: number = 4,
): EffectComposer {
    const renderScene = new RenderPass(scene, camera);
    const size = renderer.getSize(new Vector2());

    const bloomPass = new UnrealBloomPass(size, 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.5;
    bloomPass.strength = msaaSamples === 0 ? 0.6 : 1.0;
    bloomPass.radius = 0.8;

    const outputPass = new OutputPass();

    const renderTarget = new WebGLRenderTarget(size.width, size.height, {
        samples: msaaSamples
    });

    const composer = new EffectComposer(renderer, renderTarget);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    return composer;
}
