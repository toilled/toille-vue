import {
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  RingGeometry,
  DoubleSide,
  TorusGeometry,
  OctahedronGeometry,
} from 'three';

export class HologramLandmarks {
  public group: Group;
  private globeRing1: Mesh;
  private globeRing2: Mesh;
  private coreOctahedron: Mesh;
  private hexTorus: Mesh;

  constructor() {
    this.group = new Group();
    this.group.name = 'HologramLandmarksGroup';

    // 1. Cyber Globe Landmark
    const globeGroup = new Group();
    globeGroup.position.set(0, 110, 0);

    // Inner glowing sphere
    const innerGeo = new SphereGeometry(8, 16, 16);
    const innerMat = new MeshBasicMaterial({
      color: 0x00ffcc,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const innerSphere = new Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // Orbital ring 1
    const ring1Geo = new RingGeometry(10, 11.5, 32);
    const ring1Mat = new MeshBasicMaterial({
      color: 0xff007f,
      side: DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.globeRing1 = new Mesh(ring1Geo, ring1Mat);
    this.globeRing1.rotation.x = Math.PI / 3;
    globeGroup.add(this.globeRing1);

    // Orbital ring 2
    const ring2Geo = new RingGeometry(13, 14, 32);
    const ring2Mat = new MeshBasicMaterial({
      color: 0x00ffcc,
      side: DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    this.globeRing2 = new Mesh(ring2Geo, ring2Mat);
    this.globeRing2.rotation.y = Math.PI / 4;
    globeGroup.add(this.globeRing2);

    // Core pulsing octahedron
    const octaGeo = new OctahedronGeometry(5);
    const octaMat = new MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    this.coreOctahedron = new Mesh(octaGeo, octaMat);
    globeGroup.add(this.coreOctahedron);

    // 2. Floating Matrix Hex Torus over landmark
    const torusGeo = new TorusGeometry(16, 0.8, 8, 24);
    const torusMat = new MeshBasicMaterial({
      color: 0xff00cc,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    this.hexTorus = new Mesh(torusGeo, torusMat);
    this.hexTorus.rotation.x = Math.PI / 2;
    this.hexTorus.position.set(0, 105, 0);
    this.group.add(this.hexTorus);

    this.group.add(globeGroup);
  }

  public update(delta: number, elapsedTime: number): void {
    if (this.globeRing1) {
      this.globeRing1.rotation.z += delta * 0.8;
    }
    if (this.globeRing2) {
      this.globeRing2.rotation.x += delta * 0.6;
    }
    if (this.coreOctahedron) {
      this.coreOctahedron.rotation.y += delta * 1.2;
      const scale = 1 + Math.sin(elapsedTime * 3) * 0.15;
      this.coreOctahedron.scale.set(scale, scale, scale);
    }
    if (this.hexTorus) {
      this.hexTorus.rotation.z -= delta * 0.5;
      this.hexTorus.position.y = 105 + Math.sin(elapsedTime * 2) * 2;
    }
  }
}
