import {
  AdditiveBlending,
  Color,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Scene,
  SphereGeometry,
  Vector3,
  MathUtils,
  PlaneGeometry,
  DoubleSide,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
} from 'three';
import { CELL_SIZE, GRID_SIZE, START_OFFSET, BOUNDS } from './config';
import { getHeight } from '../utils/HeightMap';

export class StreetFurniture {
  private scene: Scene;
  private items: Group[] = [];
  private holograms: Group[] = [];
  private lampPosts: Group[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  generate(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    this.generateLampPosts();
    this.generateEmptyCellDecorations(occupiedGrids);
    this.generateFireEscapes(occupiedGrids);
  }

  private generateLampPosts() {
    const spacing = CELL_SIZE;
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const xPos = START_OFFSET + x * CELL_SIZE + CELL_SIZE / 2;
        const zPos = START_OFFSET + z * CELL_SIZE + CELL_SIZE / 2;
        this.addLampPost(xPos, START_OFFSET - CELL_SIZE / 2);
        this.addLampPost(xPos, -START_OFFSET + CELL_SIZE / 2);
        this.addLampPost(START_OFFSET - CELL_SIZE / 2, zPos);
        this.addLampPost(-START_OFFSET + CELL_SIZE / 2, zPos);
      }
    }
  }

  private addLampPost(x: number, z: number) {
    if (Math.random() > 0.4) return;
    const h = getHeight(x, z);
    const group = new Group();
    group.position.set(x, h, z);

    const poleGeo = new CylinderGeometry(0.3, 0.5, 12, 6);
    const poleMat = new MeshStandardMaterial({
      color: 0x222233,
      metalness: 0.8,
      roughness: 0.3,
    });
    const pole = new Mesh(poleGeo, poleMat);
    pole.position.y = 6;
    pole.castShadow = true;
    group.add(pole);

    const armGeo = new BoxGeometry(2, 0.3, 0.3);
    const armMat = new MeshStandardMaterial({ color: 0x222233, metalness: 0.8, roughness: 0.3 });
    const arm = new Mesh(armGeo, armMat);
    arm.position.set(1, 12, 0);
    group.add(arm);

    const lightColors = [0xff00cc, 0x00ffcc, 0xaa44ff];
    const lightColor = lightColors[Math.floor(Math.random() * lightColors.length)];
    const lightGeo = new SphereGeometry(0.8, 8, 8);
    const lightMat = new MeshBasicMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.9,
      blending: AdditiveBlending,
    });
    const lightMesh = new Mesh(lightGeo, lightMat);
    lightMesh.position.set(1.8, 11.5, 0);
    group.add(lightMesh);

    const glowGeo = new SphereGeometry(1.5, 8, 8);
    const glowMat = new MeshBasicMaterial({
      color: lightColor,
      transparent: true,
      opacity: 0.2,
      blending: AdditiveBlending,
    });
    const glow = new Mesh(glowGeo, glowMat);
    glow.position.set(1.8, 11.5, 0);
    group.add(glow);

    this.scene.add(group);
    this.lampPosts.push(group);
    this.items.push(group);
  }

  private generateEmptyCellDecorations(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const key = `${x},${z}`;
        if (occupiedGrids.has(key)) continue;
        if (Math.random() > 0.5) continue;

        const xPos = START_OFFSET + x * CELL_SIZE;
        const zPos = START_OFFSET + z * CELL_SIZE;
        const h = getHeight(xPos, zPos);

        const choice = Math.random();
        if (choice < 0.4) {
          this.addNeonSign(xPos, zPos, h);
        } else if (choice < 0.7) {
          this.addHologram(xPos, zPos, h);
        } else {
          this.addDataTerminal(xPos, zPos, h);
        }
      }
    }
  }

  private addNeonSign(x: number, z: number, h: number) {
    const group = new Group();
    group.position.set(x, h, z);

    const poleGeo = new CylinderGeometry(0.4, 0.6, 8, 6);
    const poleMat = new MeshStandardMaterial({ color: 0x111122, metalness: 0.7, roughness: 0.4 });
    const pole = new Mesh(poleGeo, poleMat);
    pole.position.y = 4;
    pole.castShadow = true;
    group.add(pole);

    const colors = ['#ff00cc', '#00ffcc', '#ffff00', '#ff4400', '#aa44ff', '#00ff88'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const signGeo = new PlaneGeometry(8, 5);
    const signMat = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: 0.85 + Math.random() * 0.15,
      side: DoubleSide,
      blending: AdditiveBlending,
    });
    const sign = new Mesh(signGeo, signMat);
    sign.position.set(0, 9, 0);
    sign.rotation.y = Math.random() * Math.PI * 2;
    group.add(sign);

    const signGlow = new Mesh(
      new PlaneGeometry(10, 7),
      new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity: 0.15,
        blending: AdditiveBlending,
        side: DoubleSide,
      })
    );
    signGlow.position.copy(sign.position);
    signGlow.rotation.y = sign.rotation.y;
    group.add(signGlow);

    const frameEdges = new EdgesGeometry(new PlaneGeometry(8, 5));
    const frameMat = new LineBasicMaterial({ color: new Color(color), transparent: true, opacity: 0.6 });
    const frame = new LineSegments(frameEdges, frameMat);
    frame.position.copy(sign.position);
    frame.rotation.y = sign.rotation.y;
    group.add(frame);

    this.scene.add(group);
    this.items.push(group);
  }

  private addHologram(x: number, z: number, h: number) {
    const group = new Group();
    group.position.set(x, h + 2, z);

    const hologramColors = [0xff00cc, 0x00ffcc, 0xaa44ff, 0x00ff88, 0xff6600];
    const color = hologramColors[Math.floor(Math.random() * hologramColors.length)];
    const hsl = new Color(color);

    const coreGeo = new ConeGeometry(3, 8 + Math.random() * 6, 8);
    const coreMat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      blending: AdditiveBlending,
      wireframe: Math.random() > 0.5,
      depthWrite: false,
    });
    const core = new Mesh(coreGeo, coreMat);
    core.position.y = 5;
    group.add(core);

    const ringGeo = new CylinderGeometry(4, 4, 0.5, 16);
    const ringMat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.25,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.y = 2 + Math.random() * 6;
    group.add(ring);

    const glowGeo = new SphereGeometry(2, 8, 8);
    const glowMat = new MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glow = new Mesh(glowGeo, glowMat);
    glow.position.y = 5;
    group.add(glow);

    group.userData = {
      hologram: true,
      rotSpeed: 0.2 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.5 + Math.random() * 0.5,
      baseY: h + 2,
      pulsePhase: Math.random() * Math.PI * 2,
    };

    this.scene.add(group);
    this.holograms.push(group);
    this.items.push(group);
  }

  private addDataTerminal(x: number, z: number, h: number) {
    const group = new Group();
    group.position.set(x, h, z);

    const baseGeo = new BoxGeometry(3, 1.5, 3);
    const baseMat = new MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.6, roughness: 0.4 });
    const base = new Mesh(baseGeo, baseMat);
    base.position.y = 0.75;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const screenGeo = new PlaneGeometry(2.5, 2);
    const screenColors = [0x00ffcc, 0xff00cc, 0x00ff88];
    const screenColor = screenColors[Math.floor(Math.random() * screenColors.length)];
    const screenMat = new MeshBasicMaterial({
      color: screenColor,
      transparent: true,
      opacity: 0.7,
      blending: AdditiveBlending,
    });
    const screen = new Mesh(screenGeo, screenMat);
    screen.position.set(0, 2.5, 1.51);
    group.add(screen);

    const postGeo = new CylinderGeometry(0.2, 0.3, 2, 6);
    const postMat = new MeshStandardMaterial({ color: 0x222233, metalness: 0.7, roughness: 0.3 });
    const post = new Mesh(postGeo, postMat);
    post.position.set(0, 2, 0);
    group.add(post);

    this.scene.add(group);
    this.items.push(group);
  }

  private generateFireEscapes(
    occupiedGrids: Map<string, { halfW: number; halfD: number; isRound?: boolean }>
  ) {
    for (const [key, dims] of occupiedGrids) {
      if (dims.isRound || Math.random() > 0.35) continue;
      const [gx, gz] = key.split(',').map(Number);
      const xPos = START_OFFSET + gx * CELL_SIZE;
      const zPos = START_OFFSET + gz * CELL_SIZE;
      const h = getHeight(xPos, zPos);

      const group = new Group();
      group.position.set(xPos, h + 1, 0);

      const face = Math.floor(Math.random() * 4);
      const steps = 3 + Math.floor(Math.random() * 4);
      const stepH = 10 + Math.random() * 15;
      const stepD = 2;
      const stepW = 4 + Math.random() * 4;

      for (let s = 0; s < steps; s++) {
        const platform = new Mesh(
          new BoxGeometry(stepW, 0.3, stepD),
          new MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.5, roughness: 0.7 })
        );
        platform.castShadow = true;
        this.positionFireEscapePart(platform, face, dims, 0, s * stepH, 0);
        group.add(platform);

        if (s < steps - 1) {
          const ladder = new Mesh(
            new BoxGeometry(0.3, stepH, 0.3),
            new MeshStandardMaterial({ color: 0x222233, metalness: 0.5, roughness: 0.7 })
          );
          this.positionFireEscapePart(ladder, face, dims, -stepW / 2 + 0.5, s * stepH + stepH / 2, 0);
          group.add(ladder);

          const ladder2 = new Mesh(
            new BoxGeometry(0.3, stepH, 0.3),
            new MeshStandardMaterial({ color: 0x222233, metalness: 0.5, roughness: 0.7 })
          );
          this.positionFireEscapePart(ladder2, face, dims, stepW / 2 - 0.5, s * stepH + stepH / 2, 0);
          group.add(ladder2);
        }
      }

      this.scene.add(group);
      this.items.push(group);
    }
  }

  private positionFireEscapePart(
    mesh: Mesh,
    face: number,
    dims: { halfW: number; halfD: number },
    offsetX: number,
    offsetY: number,
    _offsetZ: number
  ) {
    const d = dims.halfD;
    const w = dims.halfW;
    switch (face) {
      case 0:
        mesh.position.set(offsetX, offsetY, d + 1);
        break;
      case 1:
        mesh.position.set(offsetX, offsetY, -d - 1);
        break;
      case 2:
        mesh.position.set(w + 1, offsetY, offsetX);
        mesh.rotation.y = Math.PI / 2;
        break;
      default:
        mesh.position.set(-w - 1, offsetY, offsetX);
        mesh.rotation.y = -Math.PI / 2;
        break;
    }
  }

  update(time: number) {
    for (const holo of this.holograms) {
      const data = holo.userData;
      if (!data?.hologram) continue;

      holo.rotation.y += data.rotSpeed * 0.01;

      const float = Math.sin(time * data.floatSpeed + data.floatOffset) * 0.5;
      holo.position.y = data.baseY + float;

      const pulse = 0.6 + Math.sin(time * 2 + data.pulsePhase) * 0.4;
      holo.children.forEach((child) => {
        if (child instanceof Mesh && child.material instanceof MeshBasicMaterial) {
          child.material.opacity = 0.5 * pulse;
        }
      });
    }
  }

  getItems(): Group[] {
    return this.items;
  }

  dispose() {
    for (const item of this.items) {
      item.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.scene.remove(item);
    }
    this.items = [];
    this.holograms = [];
    this.lampPosts = [];
  }
}
