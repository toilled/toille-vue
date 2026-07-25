import { Group, BoxGeometry, MeshStandardMaterial, Mesh } from 'three';

export function createWalkingPlayer(): Group {
  const group = new Group();
  const bodyGeo = new BoxGeometry(2, 4, 2);
  const bodyMat = new MeshStandardMaterial({ color: 0x00ffcc });
  const body = new Mesh(bodyGeo, bodyMat);
  body.position.y = 2;
  group.add(body);
  return group;
}
