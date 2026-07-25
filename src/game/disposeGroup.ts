import { Group, Mesh } from 'three';

export function disposeGroup(group: Group): void {
  group.traverse((child) => {
    if (child instanceof Mesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}
