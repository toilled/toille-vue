import {
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
  SpotLight,
  HemisphereLight,
  Color,
  Texture,
} from 'three';
import { BLOCK_SIZE, CELL_SIZE, CITY_SIZE, GRID_SIZE, START_OFFSET } from './config';
import { createGroundTexture, createGroundNormalMap } from '../utils/TextureGenerator';
import { getHeight } from '../utils/HeightMap';
import { CityMaterials } from './CityMaterials';

export class CityBuilder {
  private scene: Scene;
  private buildings: Object3D[] = [];
  private occupiedGrids = new Map<string, { halfW: number; halfD: number; isRound?: boolean }>();
  private materials: CityMaterials;
  private ground: Mesh | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.materials = new CityMaterials();
  }

  public getBuildings(): Object3D[] {
    return this.buildings;
  }

  public getOccupiedGrids(): Map<string, { halfW: number; halfD: number; isRound?: boolean }> {
    return this.occupiedGrids;
  }

  public getAudioMaterials() {
    return this.materials.audioMaterials;
  }

  public async buildCity(isMobile: boolean, lbTexture: Texture) {
    this.setupLighting();
    this.createGround();
    await this.createBuildings(lbTexture);

    this.scene.fog = new FogExp2(0x0a0015, isMobile ? 0.0005 : 0.0009);
  }

  private setupLighting() {
    const hemiLight = new HemisphereLight(0x220033, 0x050510, 0.6);
    hemiLight.position.set(0, 500, 0);
    this.scene.add(hemiLight);

    this.addDirectionalLight(150, 350, 100, 0xff00cc);
    this.addDirectionalLight(-150, 300, -150, 0x00ccff);
    this.addDirectionalLight(50, 200, -200, 0xaa44ff);
  }

  private addDirectionalLight(x: number, y: number, z: number, color: number) {
    const dirLight = new DirectionalLight(color, 1.5);
    dirLight.position.set(x, y, z);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 1000;
    dirLight.shadow.camera.left = -500;
    dirLight.shadow.camera.right = 500;
    dirLight.shadow.camera.top = 500;
    dirLight.shadow.camera.bottom = -500;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);
  }

  private createGround() {
    const groundTexture = createGroundTexture();
    const groundNormalMap = createGroundNormalMap();
    const planeGeometry = new PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2, 128, 128);

    const posAttribute = planeGeometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);
      // Local y corresponds to world -z after rotation
      const h = getHeight(x, -y);
      posAttribute.setZ(i, h);
    }
    planeGeometry.computeVertexNormals();

    const repeatCount = (CITY_SIZE * 2) / CELL_SIZE;
    groundTexture.repeat.set(repeatCount, repeatCount);
    groundNormalMap.repeat.set(repeatCount, repeatCount);

    const planeMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: groundTexture,
      normalMap: groundNormalMap,
      roughness: 0.4,
      metalness: 0.3,
    });

    const offset = -CITY_SIZE / CELL_SIZE;
    groundTexture.offset.set(offset, offset);
    groundNormalMap.offset.set(offset, offset);
    this.ground = new Mesh(planeGeometry, planeMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -0.5;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  private async createBuildings(lbTexture: Texture) {
    const BATCH_SIZE = 4;
    const cells: { x: number; z: number }[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        cells.push({ x, z });
      }
    }

    for (let i = 0; i < cells.length; i += BATCH_SIZE) {
      const batch = cells.slice(i, i + BATCH_SIZE);
      for (const { x, z } of batch) {
        this.createBuildingAt(x, z, lbTexture);
      }
      if (i + BATCH_SIZE < cells.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  private createBuildingAt(x: number, z: number, lbTexture: Texture) {
    const isLeaderboardBuilding = x === 5 && z === 5;
    const xPos = START_OFFSET + x * CELL_SIZE;
    const zPos = START_OFFSET + z * CELL_SIZE;

    if (!isLeaderboardBuilding && Math.random() > 0.8) {
      return;
    }

    const dims = this.computeBuildingDimensions(isLeaderboardBuilding);
    const style = this.determineStyle(isLeaderboardBuilding);

    this.recordGridOccupancy(x, z, dims.w, dims.d, style);

    const minH = this.calculateGroundHeight(xPos, zPos, dims.w, dims.d);
    const buildingGroup = this.constructBuilding(
      xPos,
      zPos,
      minH,
      style,
      dims,
      isLeaderboardBuilding,
      lbTexture
    );

    this.scene.add(buildingGroup);
    this.buildings.push(buildingGroup);
  }

  private computeBuildingDimensions(isLeaderboard: boolean): { h: number; w: number; d: number } {
    if (isLeaderboard) {
      return { h: 250, w: BLOCK_SIZE - 10, d: BLOCK_SIZE - 10 };
    }
    return {
      h: 40 + Math.random() * 120,
      w: BLOCK_SIZE - 10 - Math.random() * 20,
      d: BLOCK_SIZE - 10 - Math.random() * 20,
    };
  }

  private recordGridOccupancy(x: number, z: number, w: number, d: number, style: string) {
    const isRound = style === 'CYLINDRICAL' || style === 'SPIRE';
    this.occupiedGrids.set(`${x},${z}`, { halfW: w / 2, halfD: d / 2, isRound });
  }

  private constructBuilding(
    xPos: number,
    zPos: number,
    minH: number,
    style: string,
    dims: { h: number; w: number; d: number },
    isLeaderboardBuilding: boolean,
    lbTexture: Texture
  ): Group {
    const { h, w, d } = dims;
    const buildingGroup = new Group();
    buildingGroup.position.set(xPos, minH, zPos);

    const selectedMaterial = this.selectMaterial(isLeaderboardBuilding);
    const thisBuildingMaterials = this.createMaterialArray(selectedMaterial);

    this.constructBuildingGeometry(
      buildingGroup,
      style,
      w,
      h,
      d,
      selectedMaterial,
      thisBuildingMaterials
    );

    if (style === 'TIERED') {
      this.addTiers(buildingGroup, w, h, d, thisBuildingMaterials);
    } else if (style === 'SPIRE') {
      this.addSpire(buildingGroup, w, h, d, selectedMaterial);
    } else if (style === 'GREEBLED') {
      this.addGreebles(buildingGroup, w, h, d);
    }

    this.addDecorations(buildingGroup, style, isLeaderboardBuilding, h, w, d);

    if (isLeaderboardBuilding) {
      this.addLeaderboard(buildingGroup, w, h, d, lbTexture);
    }

    return buildingGroup;
  }

  private determineStyle(isLeaderboardBuilding: boolean): string {
    if (isLeaderboardBuilding) return 'SIMPLE';
    const r = Math.random();
    if (r > 0.9) return 'SPIRE';
    if (r > 0.75) return 'TIERED';
    if (r > 0.6) return 'GREEBLED';
    if (r > 0.45) return 'CYLINDRICAL';
    if (r > 0.35) return 'TWISTED';
    return 'SIMPLE';
  }

  private calculateGroundHeight(xPos: number, zPos: number, w: number, d: number): number {
    const h1 = getHeight(xPos - w / 2, zPos - d / 2);
    const h2 = getHeight(xPos + w / 2, zPos - d / 2);
    const h3 = getHeight(xPos - w / 2, zPos + d / 2);
    const h4 = getHeight(xPos + w / 2, zPos + d / 2);
    return Math.min(h1, h2, h3, h4);
  }

  private selectMaterial(isLeaderboardBuilding: boolean): MeshStandardMaterial {
    if (isLeaderboardBuilding) {
      this.materials.buildingMaterial.emissiveIntensity = 0.2;
      return this.materials.buildingMaterial;
    }
    const audioKeys = Object.keys(this.materials.audioMaterials);
    const channelIndex = Math.floor(Math.random() * audioKeys.length);
    return this.materials.audioMaterials[audioKeys[channelIndex]];
  }

  private createMaterialArray(selectedMaterial: MeshStandardMaterial): MeshStandardMaterial[] {
    return [
      selectedMaterial,
      selectedMaterial,
      this.materials.roofMaterial,
      this.materials.roofMaterial,
      selectedMaterial,
      selectedMaterial,
    ];
  }

  private constructBuildingGeometry(
    buildingGroup: Group,
    style: string,
    w: number,
    h: number,
    d: number,
    selectedMaterial: MeshStandardMaterial,
    thisBuildingMaterials: MeshStandardMaterial[]
  ) {
    if (style === 'CYLINDRICAL') {
      const cylMats = [selectedMaterial, this.materials.roofMaterial, this.materials.roofMaterial];
      const cyl = new Mesh(this.materials.cylinderGeo, cylMats);
      cyl.scale.set(w, h, d);
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      buildingGroup.add(cyl);
    } else if (style === 'TWISTED') {
      this.constructTwistedBuilding(buildingGroup, w, h, d, thisBuildingMaterials);
    } else {
      const mainBlock = new Mesh(this.materials.boxGeo, thisBuildingMaterials);
      mainBlock.scale.set(w, h, d);
      mainBlock.castShadow = true;
      mainBlock.receiveShadow = true;
      buildingGroup.add(mainBlock);

      const mainLine = new LineSegments(
        this.materials.edgesGeo,
        Math.random() > 0.5 ? this.materials.edgeMat1 : this.materials.edgeMat2
      );
      mainLine.scale.set(w, h, d);
      buildingGroup.add(mainLine);
    }
  }

  private constructTwistedBuilding(
    buildingGroup: Group,
    w: number,
    h: number,
    d: number,
    materials: MeshStandardMaterial[]
  ) {
    const segments = 5 + Math.floor(Math.random() * 5);
    const segH = h / segments;
    let currentY = 0;
    let rot = 0;
    for (let s = 0; s < segments; s++) {
      const seg = new Mesh(this.materials.boxGeo, materials);
      const scaleFactor = 1.0;
      seg.scale.set(w * scaleFactor, segH, d * scaleFactor);
      seg.position.y = currentY;
      seg.rotation.y = rot;
      seg.castShadow = true;
      seg.receiveShadow = true;
      buildingGroup.add(seg);

      const segLine = new LineSegments(this.materials.edgesGeo, this.materials.edgeMat2);
      segLine.scale.set(w * scaleFactor, segH, d * scaleFactor);
      segLine.position.y = currentY;
      segLine.rotation.y = rot;
      buildingGroup.add(segLine);

      currentY += segH;
      rot += Math.random() > 0.5 ? Math.PI / 10 : -Math.PI / 10;
    }
  }

  private addTiers(
    buildingGroup: Group,
    w: number,
    h: number,
    d: number,
    materials: MeshStandardMaterial[]
  ) {
    const tiers = 1 + Math.floor(Math.random() * 2);
    let currentH = h;
    let currentW = w;
    let currentD = d;

    for (let t = 0; t < tiers; t++) {
      const tierH = 20 + Math.random() * 40;
      currentW *= 0.6 + Math.random() * 0.2;
      currentD *= 0.6 + Math.random() * 0.2;

      const tierBlock = new Mesh(this.materials.boxGeo, materials);
      tierBlock.scale.set(currentW, tierH, currentD);
      tierBlock.position.y = currentH;
      tierBlock.castShadow = true;
      tierBlock.receiveShadow = true;
      buildingGroup.add(tierBlock);

      const tierLine = new LineSegments(this.materials.edgesGeo, this.materials.topEdgeMat);
      tierLine.scale.set(currentW, tierH, currentD);
      tierLine.position.y = currentH;
      buildingGroup.add(tierLine);

      currentH += tierH;
    }
  }

  private addSpire(
    buildingGroup: Group,
    w: number,
    h: number,
    d: number,
    material: MeshStandardMaterial
  ) {
    const spireH = h * 0.5 + Math.random() * h;
    const spireW = w * 0.5;
    const spireD = d * 0.5;

    const spire = new Mesh(this.materials.coneGeo, material);
    spire.scale.set(spireW, spireH, spireD);
    spire.position.y = h;
    spire.rotation.y = Math.PI / 4;
    spire.castShadow = true;
    spire.receiveShadow = true;
    buildingGroup.add(spire);

    const spireLine = new LineSegments(this.materials.coneEdgesGeo, this.materials.topEdgeMat);
    spireLine.scale.set(spireW, spireH, spireD);
    spireLine.position.y = h;
    spireLine.rotation.y = Math.PI / 4;
    buildingGroup.add(spireLine);
  }

  private addGreebles(buildingGroup: Group, w: number, h: number, d: number) {
    const count = 4 + Math.floor(Math.random() * 6);
    for (let g = 0; g < count; g++) {
      const gw = 5 + Math.random() * 10;
      const gh = 5 + Math.random() * 20;
      const gd = 5 + Math.random() * 10;

      const gMesh = new Mesh(this.materials.boxGeo, this.materials.roofMaterial);
      gMesh.scale.set(gw, gh, gd);
      gMesh.castShadow = true;
      gMesh.receiveShadow = true;

      const face = Math.floor(Math.random() * 4);
      switch (face) {
        case 0:
          gMesh.position.set(0, Math.random() * h, d / 2 + gd / 2);
          break;
        case 1:
          gMesh.position.set(0, Math.random() * h, -d / 2 - gd / 2);
          break;
        case 2:
          gMesh.position.set(w / 2 + gw / 2, Math.random() * h, 0);
          break;
        default:
          gMesh.position.set(-w / 2 - gw / 2, Math.random() * h, 0);
          break;
      }

      buildingGroup.add(gMesh);

      const gLine = new LineSegments(this.materials.edgesGeo, this.materials.edgeMat2);
      gLine.scale.set(gw, gh, gd);
      gLine.position.copy(gMesh.position);
      buildingGroup.add(gLine);
    }
  }

  private addNeonStrip(
    buildingGroup: Group,
    isLeaderboard: boolean,
    h: number,
    w: number,
    d: number
  ) {
    if (isLeaderboard || h <= 40) return;
    // Add more strips: 0-2 per building
    const stripCount = Math.random() > 0.6 ? 1 : Math.random() > 0.3 ? 2 : 0;
    const usedFaces: number[] = [];
    for (let s = 0; s < stripCount; s++) {
      const color = new Color().setHSL(Math.random(), 1.0, 0.5 + Math.random() * 0.2);
      const strip = new Mesh(this.materials.neonStripGeo, new MeshBasicMaterial({ color }));
      const stripHeight = h * (0.3 + Math.random() * 0.6);
      strip.scale.set(1, stripHeight, 1);
      const face = Math.floor(Math.random() * 4);
      if (usedFaces.includes(face)) continue;
      usedFaces.push(face);
      const offset = 0.6;
      const yPos = h * (0.3 + Math.random() * 0.5);
      switch (face) {
        case 0:
          strip.position.set(0, yPos, d / 2 + offset);
          break;
        case 1:
          strip.position.set(0, yPos, -d / 2 - offset);
          break;
        case 2:
          strip.position.set(w / 2 + offset, yPos, 0);
          break;
        case 3:
          strip.position.set(-w / 2 - offset, yPos, 0);
          break;
      }
      buildingGroup.add(strip);
    }
  }

  private addAntenna(buildingGroup: Group, style: string, h: number) {
    if (style === 'SPIRE' || style === 'CYLINDRICAL' || style === 'TWISTED') return;
    if (Math.random() > 0.4) {
      const antenna = new Mesh(this.materials.boxGeo, this.materials.antennaMat);
      antenna.scale.set(1.5, 15 + Math.random() * 40, 1.5);
      antenna.position.set((Math.random() - 0.5) * 10, h, (Math.random() - 0.5) * 10);
      buildingGroup.add(antenna);
    }
    if (Math.random() > 0.6) {
      const antenna2 = new Mesh(this.materials.coneGeo, this.materials.antennaMat);
      antenna2.scale.set(1, 8 + Math.random() * 15, 1);
      antenna2.position.set((Math.random() - 0.5) * 15, h, (Math.random() - 0.5) * 15);
      buildingGroup.add(antenna2);
    }
  }

  private addRooftopDetails(buildingGroup: Group, style: string, h: number, w: number, d: number) {
    if (style === 'SPIRE' || style === 'CYLINDRICAL') return;
    const detailCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < detailCount; i++) {
      const dh = 2 + Math.random() * 6;
      const dw = 3 + Math.random() * 8;
      const dd = 3 + Math.random() * 8;
      const detail = new Mesh(this.materials.boxGeo, this.materials.roofMaterial);
      detail.scale.set(dw, dh, dd);
      detail.position.set((Math.random() - 0.5) * w * 0.6, h, (Math.random() - 0.5) * d * 0.6);
      buildingGroup.add(detail);
    }
  }

  private addBillboard(
    buildingGroup: Group,
    isLeaderboard: boolean,
    h: number,
    w: number,
    d: number
  ) {
    if (isLeaderboard || h <= 50 || Math.random() <= 0.6) return;
    const texIndex = Math.floor(Math.random() * this.materials.billboardMaterials.length);
    const bbW = 20 + Math.random() * 20;
    const bbH = 12 + Math.random() * 14;
    const bbGeo = new PlaneGeometry(bbW, bbH);
    const billboardMat = this.materials.billboardMaterials[texIndex];
    billboardMat.opacity = 0.85 + Math.random() * 0.15;
    const billboard = new Mesh(bbGeo, billboardMat);
    const face = Math.floor(Math.random() * 4);
    const offset = 1;
    const yPos = h * (0.4 + Math.random() * 0.35);
    switch (face) {
      case 0:
        billboard.position.set(0, yPos, d / 2 + offset);
        break;
      case 1:
        billboard.position.set(0, yPos, -d / 2 - offset);
        billboard.rotation.y = Math.PI;
        break;
      case 2:
        billboard.position.set(w / 2 + offset, yPos, 0);
        billboard.rotation.y = Math.PI / 2;
        break;
      default:
        billboard.position.set(-w / 2 - offset, yPos, 0);
        billboard.rotation.y = -Math.PI / 2;
        break;
    }
    buildingGroup.add(billboard);
  }

  private addDecorations(
    buildingGroup: Group,
    style: string,
    isLeaderboard: boolean,
    h: number,
    w: number,
    d: number
  ) {
    this.addNeonStrip(buildingGroup, isLeaderboard, h, w, d);
    this.addAntenna(buildingGroup, style, h);
    this.addRooftopDetails(buildingGroup, style, h, w, d);
    this.addBillboard(buildingGroup, isLeaderboard, h, w, d);
  }

  private placeLeaderboardPanel(
    buildingGroup: Group,
    sideIndex: number,
    lbGeo: PlaneGeometry,
    lbTexture: Texture,
    w: number,
    h: number,
    d: number
  ) {
    const lbMat = new MeshBasicMaterial({
      map: lbTexture,
      side: DoubleSide,
      color: 0xffffff,
    });
    const lbMesh = new Mesh(lbGeo, lbMat);
    lbMesh.userData = { isLeaderboard: true };
    const offset = 0.6;
    const yPos = h * 0.7;

    const panelPositions = [
      { x: 0, y: yPos, z: d / 2 + offset, ry: 0 },
      { x: 0, y: yPos, z: -d / 2 - offset, ry: Math.PI },
      { x: w / 2 + offset, y: yPos, z: 0, ry: Math.PI / 2 },
      { x: -w / 2 - offset, y: yPos, z: 0, ry: -Math.PI / 2 },
    ];

    const pos = panelPositions[sideIndex];
    lbMesh.position.set(pos.x, pos.y, pos.z);
    lbMesh.rotation.y = pos.ry;
    buildingGroup.add(lbMesh);

    const spotPositions = [
      { x: 0, z: d + 30 },
      { x: 0, z: -d - 30 },
      { x: w + 30, z: 0 },
      { x: -w - 30, z: 0 },
    ];

    const spot = new SpotLight(0x00ffcc, 500, 100, 0.6, 0.5, 1);
    const sp = spotPositions[sideIndex];
    spot.position.set(sp.x, h * 0.9, sp.z);
    spot.target = lbMesh;
    buildingGroup.add(spot);
    buildingGroup.add(spot.target);
  }

  private addLeaderboard(
    buildingGroup: Group,
    w: number,
    h: number,
    d: number,
    lbTexture: Texture
  ) {
    const lbW = w * 0.8;
    const lbH = lbW * 1.0;
    const lbGeo = new PlaneGeometry(lbW, lbH);

    for (let i = 0; i < 4; i++) {
      this.placeLeaderboardPanel(buildingGroup, i, lbGeo, lbTexture, w, h, d);
    }
  }

  dispose() {
    this.materials.dispose();
    this.ground?.geometry?.dispose();
    if (this.ground?.material) {
      (this.ground.material as MeshStandardMaterial).dispose();
    }
  }
}
