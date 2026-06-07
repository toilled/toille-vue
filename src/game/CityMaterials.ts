import {
  CanvasTexture,
  DoubleSide,
  EdgesGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
} from "three";
import {
  createBillboardTextures,
  createWindowTexture,
  createWindowRoughnessMap,
} from "../utils/TextureGenerator";

const BUILDING_COLORS: number[] = [
  0x1a1a2e, // deep indigo
  0x16213e, // dark navy
  0x0f3460, // dark blue
  0x2d1b2e, // dark purple
  0x1b1b2f, // midnight
  0x222831, // charcoal
  0x2a2a3a, // dark steel
  0x1a1a2e, // deep indigo
  0x1e2029, // gunmetal
  0x241e2e, // dark violet
];

export class CityMaterials {
  public windowTexture!: CanvasTexture;
  public windowRoughnessMap!: CanvasTexture;
  public billboardTextures!: CanvasTexture[];
  public buildingMaterial!: MeshStandardMaterial;
  public audioMaterials: { [key: string]: MeshStandardMaterial } = {};
  public roofMaterial!: MeshStandardMaterial;
  public edgeMat1!: LineBasicMaterial;
  public edgeMat2!: LineBasicMaterial;
  public topEdgeMat!: LineBasicMaterial;
  public antennaMat!: MeshBasicMaterial;
  public billboardMaterials!: MeshBasicMaterial[];

  // Geometries that can be reused
  public boxGeo!: BoxGeometry;
  public edgesGeo!: EdgesGeometry;
  public coneGeo!: ConeGeometry;
  public coneEdgesGeo!: EdgesGeometry;
  public cylinderGeo!: CylinderGeometry;
  public neonStripGeo!: BoxGeometry;

  private initTextures() {
    this.windowTexture = createWindowTexture();
    this.windowRoughnessMap = createWindowRoughnessMap();
    this.billboardTextures = createBillboardTextures();
  }

  private initGeometries() {
    this.boxGeo = new BoxGeometry(1, 1, 1);
    this.boxGeo.translate(0, 0.5, 0);
    this.edgesGeo = new EdgesGeometry(this.boxGeo);

    this.coneGeo = new ConeGeometry(0.7, 1, 4);
    this.coneGeo.translate(0, 0.5, 0);
    this.coneEdgesGeo = new EdgesGeometry(this.coneGeo);

    this.cylinderGeo = new CylinderGeometry(0.5, 0.5, 1, 32);
    this.cylinderGeo.translate(0, 0.5, 0);

    this.neonStripGeo = new BoxGeometry(0.5, 1, 0.5);
  }

  private initBuildingMaterials() {
    this.buildingMaterial = new MeshStandardMaterial({
      color: 0x222222,
      map: this.windowTexture,
      emissiveMap: this.windowTexture,
      roughnessMap: this.windowRoughnessMap,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      roughness: 0.4,
      metalness: 0.7,
    });
  }

  private initAudioMaterials() {
    const audioKeys = ["kick", "snare", "hihat", "bass0", "bass1", "bass2", "bass3", "bass4"];
    audioKeys.forEach((key) => {
      const msg = this.buildingMaterial.clone();
      const colorIndex = Math.floor(Math.random() * BUILDING_COLORS.length);
      msg.color.setHex(BUILDING_COLORS[colorIndex]);
      this.audioMaterials[key] = msg;
    });
  }

  private initEdgeAndBillboardMaterials() {
    this.roofMaterial = new MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.3,
    });

    this.edgeMat1 = new LineBasicMaterial({ color: 0xff00cc, transparent: true, opacity: 0.45 });
    this.edgeMat2 = new LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.45 });
    this.topEdgeMat = new LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    this.antennaMat = new MeshBasicMaterial({ color: 0xaaaaaa });

    this.billboardMaterials = this.billboardTextures.map(
      (tex) =>
        new MeshBasicMaterial({ map: tex, side: DoubleSide, transparent: true, opacity: 0.9 }),
    );
  }

  constructor() {
    this.initTextures();
    this.initGeometries();
    this.initBuildingMaterials();
    this.initAudioMaterials();
    this.initEdgeAndBillboardMaterials();
  }
}
