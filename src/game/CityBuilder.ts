import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  FogExp2,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
  SpotLight,
  ConeGeometry,
} from "three";
import {
  BLOCK_SIZE,
  CELL_SIZE,
  CITY_SIZE,
  GRID_SIZE,
  ROAD_WIDTH,
  START_OFFSET,
} from "./config";
import {
  createBillboardTextures,
  createGroundTexture,
  createRoughFloorTexture,
  createWindowTexture,
} from "../utils/TextureGenerator";
import { CityData } from "./types";

export class CityBuilder {
  private scene: Scene;
  private buildings: Object3D[] = [];
  private occupiedGrids = new Map<string, { halfW: number; halfD: number }>();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public getBuildings(): Object3D[] {
    return this.buildings;
  }

  public getOccupiedGrids(): Map<string, { halfW: number; halfD: number }> {
    return this.occupiedGrids;
  }

  public async buildCity(isMobile: boolean, lbTexture: any) {
    this.setupLighting();
    this.createGround();

    try {
      const res = await fetch('/api/city');
      if (!res.ok) throw new Error('Failed to fetch city data');
      const data: CityData = await res.json();
      this.createBuildingsFromData(data, lbTexture);
    } catch (e) {
      console.error("Error building city:", e);
    }

    // Setup Fog
    this.scene.fog = new FogExp2(0x050510, isMobile ? 0.00057 : 0.001);
  }

  private setupLighting() {
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const dirLight = new DirectionalLight(0xff00cc, 0.5);
    dirLight.position.set(100, 200, 100);
    this.scene.add(dirLight);

    const dirLight2 = new DirectionalLight(0x00ccff, 0.5);
    dirLight2.position.set(-100, 200, -100);
    this.scene.add(dirLight2);
  }

  private createGround() {
    const groundTexture = createGroundTexture();
    const planeGeometry = new PlaneGeometry(CITY_SIZE * 2, CITY_SIZE * 2);

    const repeatCount = (CITY_SIZE * 2) / CELL_SIZE;
    groundTexture.repeat.set(repeatCount, repeatCount);

    const planeMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      map: groundTexture,
      roughness: 0.8,
      metalness: 0.2,
    });

    const offset = -CITY_SIZE / CELL_SIZE;
    groundTexture.offset.set(offset, offset);
    const plane = new Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    this.scene.add(plane);
  }

  private createBuildingsFromData(data: CityData, lbTexture: any) {
    const windowTexture = createWindowTexture();
    const billboardTextures = createBillboardTextures();

    const boxGeo = new BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0);

    const edgesGeo = new EdgesGeometry(boxGeo);

    const buildingMaterial = new MeshStandardMaterial({
      color: 0x222222,
      map: windowTexture,
      emissiveMap: windowTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.8,
    });

    const roofMaterial = new MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });

    const buildingMaterials = [
      buildingMaterial,
      buildingMaterial,
      roofMaterial,
      roofMaterial,
      buildingMaterial,
      buildingMaterial,
    ];

    const edgeMat1 = new LineBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.4,
    });
    const edgeMat2 = new LineBasicMaterial({
      color: 0x00ccff,
      transparent: true,
      opacity: 0.4,
    });
    const topEdgeMat = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const antennaMat = new MeshBasicMaterial({ color: 0xffffff });

    const billboardMaterials = billboardTextures.map(
      (tex) =>
        new MeshBasicMaterial({
          map: tex,
          side: DoubleSide,
          transparent: true,
          opacity: 0.9,
        }),
    );

    const coneGeo = new ConeGeometry(0.7, 1, 4);
    coneGeo.translate(0, 0.5, 0);
    const coneEdgesGeo = new EdgesGeometry(coneGeo);

    // Floor Tiles
    for (const tile of data.floorTiles) {
      const floorGeo = new PlaneGeometry(tile.size, tile.size);
      const floorMat = new MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
        metalness: 0.1,
        map: createRoughFloorTexture(),
      });
      const floorMesh = new Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.set(tile.x, 0.1, tile.z);
      this.scene.add(floorMesh);
      this.buildings.push(floorMesh);
    }

    // Buildings
    for (const b of data.buildings) {
      const gridX = Math.round((b.x - START_OFFSET) / CELL_SIZE);
      const gridZ = Math.round((b.z - START_OFFSET) / CELL_SIZE);

      this.occupiedGrids.set(`${gridX},${gridZ}`, { halfW: b.width / 2, halfD: b.depth / 2 });

      const buildingGroup = new Group();
      buildingGroup.position.set(b.x, 0, b.z);

      const mainBlock = new Mesh(boxGeo, buildingMaterials);
      mainBlock.scale.set(b.width, b.height, b.depth);
      buildingGroup.add(mainBlock);

      const mainLine = new LineSegments(
        edgesGeo,
        Math.random() > 0.5 ? edgeMat1 : edgeMat2,
      );
      mainLine.scale.set(b.width, b.height, b.depth);
      buildingGroup.add(mainLine);

      if (b.tiers) {
        for (const t of b.tiers) {
          const tierBlock = new Mesh(boxGeo, buildingMaterials);
          tierBlock.scale.set(t.width, t.height, t.depth);
          tierBlock.position.y = t.y;
          buildingGroup.add(tierBlock);

          const tierLine = new LineSegments(edgesGeo, topEdgeMat);
          tierLine.scale.set(t.width, t.height, t.depth);
          tierLine.position.y = t.y;
          buildingGroup.add(tierLine);
        }
      }

      if (b.spire) {
        const s = b.spire;
        const spire = new Mesh(coneGeo, buildingMaterial);
        spire.scale.set(s.width, s.height, s.depth);
        spire.position.y = s.y;
        spire.rotation.y = Math.PI / 4;
        buildingGroup.add(spire);

        const spireLine = new LineSegments(coneEdgesGeo, topEdgeMat);
        spireLine.scale.set(s.width, s.height, s.depth);
        spireLine.position.y = s.y;
        spireLine.rotation.y = Math.PI / 4;
        buildingGroup.add(spireLine);
      }

      if (b.greebles) {
        for (const g of b.greebles) {
          const gMesh = new Mesh(boxGeo, roofMaterial);
          gMesh.scale.set(g.width, g.height, g.depth);
          gMesh.position.set(g.x, g.y, g.z);
          buildingGroup.add(gMesh);

          const gLine = new LineSegments(edgesGeo, edgeMat2);
          gLine.scale.set(g.width, g.height, g.depth);
          gLine.position.copy(gMesh.position);
          buildingGroup.add(gLine);
        }
      }

      if (b.antenna) {
        const a = b.antenna;
        const antenna = new Mesh(boxGeo, antennaMat);
        antenna.scale.set(2, a.height, 2);
        antenna.position.y = a.y;
        buildingGroup.add(antenna);
      }

      if (b.billboard) {
        const bb = b.billboard;
        const bbMat = billboardMaterials[bb.texIndex % billboardMaterials.length];
        const bbGeo = new PlaneGeometry(bb.width, bb.height);
        const billboard = new Mesh(bbGeo, bbMat);

        if (bb.face === 0) {
          billboard.position.set(0, bb.y, b.depth / 2 + bb.offset);
        } else if (bb.face === 1) {
          billboard.position.set(0, bb.y, -b.depth / 2 - bb.offset);
          billboard.rotation.y = Math.PI;
        } else if (bb.face === 2) {
          billboard.position.set(b.width / 2 + bb.offset, bb.y, 0);
          billboard.rotation.y = Math.PI / 2;
        } else {
          billboard.position.set(-b.width / 2 - bb.offset, bb.y, 0);
          billboard.rotation.y = -Math.PI / 2;
        }
        buildingGroup.add(billboard);
      }

      if (b.isLeaderboard) {
        const lbW = b.width * 0.8;
        const lbH = lbW * 1.0;
        const lbGeo = new PlaneGeometry(lbW, lbH);

        for (let i = 0; i < 4; i++) {
          const lbMat = new MeshBasicMaterial({
            map: lbTexture,
            side: DoubleSide,
            color: 0xffffff,
          });

          const lbMesh = new Mesh(lbGeo, lbMat);
          const offset = 0.6;
          const yPos = b.height * 0.7;

          if (i === 0) {
            lbMesh.position.set(0, yPos, b.depth / 2 + offset);
            lbMesh.rotation.y = 0;
          } else if (i === 1) {
            lbMesh.position.set(0, yPos, -b.depth / 2 - offset);
            lbMesh.rotation.y = Math.PI;
          } else if (i === 2) {
            lbMesh.position.set(b.width / 2 + offset, yPos, 0);
            lbMesh.rotation.y = Math.PI / 2;
          } else {
            lbMesh.position.set(-b.width / 2 - offset, yPos, 0);
            lbMesh.rotation.y = -Math.PI / 2;
          }

          buildingGroup.add(lbMesh);

          const spot = new SpotLight(0x00ffcc, 500, 100, 0.6, 0.5, 1);

          if (i === 0) spot.position.set(0, b.height * 0.9, b.depth + 30);
          else if (i === 1) spot.position.set(0, b.height * 0.9, -b.depth - 30);
          else if (i === 2) spot.position.set(b.width + 30, b.height * 0.9, 0);
          else spot.position.set(-b.width - 30, b.height * 0.9, 0);

          spot.target = lbMesh;
          buildingGroup.add(spot);
          buildingGroup.add(spot.target);
        }
      }

      this.scene.add(buildingGroup);
      this.buildings.push(buildingGroup);
    }
  }
}
