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
import { getHeight } from "../utils/HeightMap";

export class CityBuilder {
  private scene: Scene;
  private buildings: Object3D[] = [];
  private occupiedGrids = new Map<string, { halfW: number; halfD: number }>();
  private audioMaterials: { [key: string]: MeshStandardMaterial } = {};

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public getBuildings(): Object3D[] {
    return this.buildings;
  }

  public getOccupiedGrids(): Map<string, { halfW: number; halfD: number }> {
    return this.occupiedGrids;
  }

  public getAudioMaterials() {
    return this.audioMaterials;
  }

  public buildCity(isMobile: boolean, lbTexture: any) {
    this.setupLighting();
    this.createGround();
    this.createBuildings(lbTexture);

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
    const planeGeometry = new PlaneGeometry(
      CITY_SIZE * 2,
      CITY_SIZE * 2,
      128,
      128,
    );

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

  private createBuildings(lbTexture: any) {
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

    // Initialize audio materials
    const audioKeys = ["kick", "snare", "hihat", "bass0", "bass1", "bass2", "bass3", "bass4"];
    audioKeys.forEach((key) => {
      this.audioMaterials[key] = buildingMaterial.clone();
    });

    const roofMaterial = new MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });

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

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const isLeaderboardBuilding = x === 5 && z === 5;

        const xPos = START_OFFSET + x * CELL_SIZE;
        const zPos = START_OFFSET + z * CELL_SIZE;

        if (!isLeaderboardBuilding && Math.random() > 0.8) {
          // No building in this square
          continue;
        }

        let h = 40 + Math.random() * 120;
        let w = BLOCK_SIZE - 10 - Math.random() * 20;
        let d = BLOCK_SIZE - 10 - Math.random() * 20;

        if (isLeaderboardBuilding) {
          h = 250;
          w = BLOCK_SIZE - 10;
          d = BLOCK_SIZE - 10;
        }

        this.occupiedGrids.set(`${x},${z}`, { halfW: w / 2, halfD: d / 2 });

        // Calculate ground height
        const h1 = getHeight(xPos - w / 2, zPos - d / 2);
        const h2 = getHeight(xPos + w / 2, zPos - d / 2);
        const h3 = getHeight(xPos - w / 2, zPos + d / 2);
        const h4 = getHeight(xPos + w / 2, zPos + d / 2);
        const minH = Math.min(h1, h2, h3, h4);

        const buildingGroup = new Group();
        buildingGroup.position.set(xPos, minH, zPos);

        let style = "SIMPLE";
        if (!isLeaderboardBuilding) {
          const r = Math.random();
          if (r > 0.9) style = "SPIRE";
          else if (r > 0.7) style = "TIERED";
          else if (r > 0.5) style = "GREEBLED";
        }

        // Select material for this building
        let selectedMaterial = buildingMaterial;
        if (!isLeaderboardBuilding) {
          const channelIndex = Math.floor(Math.random() * audioKeys.length);
          selectedMaterial = this.audioMaterials[audioKeys[channelIndex]];
        }

        const thisBuildingMaterials = [
          selectedMaterial,
          selectedMaterial,
          roofMaterial,
          roofMaterial,
          selectedMaterial,
          selectedMaterial,
        ];

        const mainBlock = new Mesh(boxGeo, thisBuildingMaterials);
        mainBlock.scale.set(w, h, d);
        buildingGroup.add(mainBlock);

        const mainLine = new LineSegments(
          edgesGeo,
          Math.random() > 0.5 ? edgeMat1 : edgeMat2,
        );
        mainLine.scale.set(w, h, d);
        buildingGroup.add(mainLine);

        switch (style) {
          case "TIERED": {
            const tiers = 1 + Math.floor(Math.random() * 2);
            let currentH = h;
            let currentW = w;
            let currentD = d;

            for (let t = 0; t < tiers; t++) {
              const tierH = 20 + Math.random() * 40;
              currentW *= 0.6 + Math.random() * 0.2;
              currentD *= 0.6 + Math.random() * 0.2;

              const tierBlock = new Mesh(boxGeo, thisBuildingMaterials);
              tierBlock.scale.set(currentW, tierH, currentD);
              tierBlock.position.y = currentH;
              buildingGroup.add(tierBlock);

              const tierLine = new LineSegments(edgesGeo, topEdgeMat);
              tierLine.scale.set(currentW, tierH, currentD);
              tierLine.position.y = currentH;
              buildingGroup.add(tierLine);

              currentH += tierH;
            }
            break;
          }
          case "SPIRE": {
            const spireH = h * 0.5 + Math.random() * h;
            const spireW = w * 0.5;
            const spireD = d * 0.5;

            const spire = new Mesh(coneGeo, selectedMaterial);
            spire.scale.set(spireW, spireH, spireD);
            spire.position.y = h;
            spire.rotation.y = Math.PI / 4;
            buildingGroup.add(spire);

            const spireLine = new LineSegments(coneEdgesGeo, topEdgeMat);
            spireLine.scale.set(spireW, spireH, spireD);
            spireLine.position.y = h;
            spireLine.rotation.y = Math.PI / 4;
            buildingGroup.add(spireLine);
            break;
          }
          case "GREEBLED": {
            const count = 4 + Math.floor(Math.random() * 6);
            for (let g = 0; g < count; g++) {
              const gw = 5 + Math.random() * 10;
              const gh = 5 + Math.random() * 20;
              const gd = 5 + Math.random() * 10;

              const gMesh = new Mesh(boxGeo, roofMaterial);
              gMesh.scale.set(gw, gh, gd);

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

              const gLine = new LineSegments(edgesGeo, edgeMat2);
              gLine.scale.set(gw, gh, gd);
              gLine.position.copy(gMesh.position);
              buildingGroup.add(gLine);
            }
            break;
          }
        }

        if (style !== "SPIRE" && Math.random() > 0.7) {
          const antennaH = 20 + Math.random() * 50;
          const antenna = new Mesh(boxGeo, antennaMat);
          antenna.scale.set(2, antennaH, 2);
          let topY = h;
          antenna.position.y = topY;
          buildingGroup.add(antenna);
        }

        if (!isLeaderboardBuilding && h > 60 && Math.random() > 0.7) {
          const texIndex = Math.floor(Math.random() * billboardMaterials.length);
          const bbMat = billboardMaterials[texIndex];

          const bbW = 20 + Math.random() * 15;
          const bbH = 10 + Math.random() * 10;
          const bbGeo = new PlaneGeometry(bbW, bbH);

          const billboard = new Mesh(bbGeo, bbMat);

          const face = Math.floor(Math.random() * 4);
          const offset = 1;

          switch (face) {
            case 0:
              billboard.position.set(
                0,
                h * (0.5 + Math.random() * 0.3),
                d / 2 + offset,
              );
              break;
            case 1:
              billboard.position.set(
                0,
                h * (0.5 + Math.random() * 0.3),
                -d / 2 - offset,
              );
              billboard.rotation.y = Math.PI;
              break;
            case 2:
              billboard.position.set(
                w / 2 + offset,
                h * (0.5 + Math.random() * 0.3),
                0,
              );
              billboard.rotation.y = Math.PI / 2;
              break;
            default:
              billboard.position.set(
                -w / 2 - offset,
                h * (0.5 + Math.random() * 0.3),
                0,
              );
              billboard.rotation.y = -Math.PI / 2;
              break;
          }

          buildingGroup.add(billboard);
        }

        if (isLeaderboardBuilding) {
          const lbW = w * 0.8;
          const lbH = lbW * 1.0;
          const lbGeo = new PlaneGeometry(lbW, lbH);

          for (let i = 0; i < 4; i++) {
            const lbMat = new MeshBasicMaterial({
              map: lbTexture,
              side: DoubleSide,
              color: 0xffffff,
            });

            const lbMesh = new Mesh(lbGeo, lbMat);
            lbMesh.userData = { isLeaderboard: true };
            const offset = 0.6;
            const yPos = h * 0.7;

            switch (i) {
              case 0:
                lbMesh.position.set(0, yPos, d / 2 + offset);
                lbMesh.rotation.y = 0;
                break;
              case 1:
                lbMesh.position.set(0, yPos, -d / 2 - offset);
                lbMesh.rotation.y = Math.PI;
                break;
              case 2:
                lbMesh.position.set(w / 2 + offset, yPos, 0);
                lbMesh.rotation.y = Math.PI / 2;
                break;
              default:
                lbMesh.position.set(-w / 2 - offset, yPos, 0);
                lbMesh.rotation.y = -Math.PI / 2;
                break;
            }

            buildingGroup.add(lbMesh);

            const spot = new SpotLight(0x00ffcc, 500, 100, 0.6, 0.5, 1);

            switch (i) {
              case 0:
                spot.position.set(0, h * 0.9, d + 30);
                break;
              case 1:
                spot.position.set(0, h * 0.9, -d - 30);
                break;
              case 2:
                spot.position.set(w + 30, h * 0.9, 0);
                break;
              default:
                spot.position.set(-w - 30, h * 0.9, 0);
                break;
            }

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
}
