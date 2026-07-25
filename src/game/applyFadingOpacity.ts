import { Group, Mesh } from 'three';

export function applyFadingOpacity(group: Group, opacity: number): void {
  group.traverse((child) => {
    if (child instanceof Mesh) {
      const mat = child.material;
      if (!Array.isArray(mat) && child.userData.partType && child.userData.partType !== 'hitbox') {
        mat.opacity = (child.userData.originalOpacity ?? 1.0) * opacity;
        mat.transparent = true;
        mat.depthWrite = false;
      }
    }
  });
}
