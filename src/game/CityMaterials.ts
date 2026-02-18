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
} from "../utils/TextureGenerator";

export class CityMaterials {
  public windowTexture: CanvasTexture;
  public billboardTextures: CanvasTexture[];
  public buildingMaterial: MeshStandardMaterial;
  public audioMaterials: { [key: string]: MeshStandardMaterial } = {};
  public roofMaterial: MeshStandardMaterial;
  public edgeMat1: LineBasicMaterial;
  public edgeMat2: LineBasicMaterial;
  public topEdgeMat: LineBasicMaterial;
  public antennaMat: MeshBasicMaterial;
  public billboardMaterials: MeshBasicMaterial[];

  // Geometries that can be reused
  public boxGeo: BoxGeometry;
  public edgesGeo: EdgesGeometry;
  public coneGeo: ConeGeometry;
  public coneEdgesGeo: EdgesGeometry;
  public cylinderGeo: CylinderGeometry;
  public neonStripGeo: BoxGeometry;

  constructor() {
    this.windowTexture = createWindowTexture();
    this.billboardTextures = createBillboardTextures();

    this.boxGeo = new BoxGeometry(1, 1, 1);
    this.boxGeo.translate(0, 0.5, 0);

    this.edgesGeo = new EdgesGeometry(this.boxGeo);

    this.buildingMaterial = new MeshStandardMaterial({
      color: 0x222222,
      map: this.windowTexture,
      emissiveMap: this.windowTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Initialize audio materials
    const audioKeys = ["kick", "snare", "hihat", "bass0", "bass1", "bass2", "bass3", "bass4"];
    audioKeys.forEach((key) => {
      this.audioMaterials[key] = this.buildingMaterial.clone();
    });

    this.roofMaterial = new MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1,
    });

    this.edgeMat1 = new LineBasicMaterial({
      color: 0xff00cc,
      transparent: true,
      opacity: 0.4,
    });
    this.edgeMat2 = new LineBasicMaterial({
      color: 0x00ccff,
      transparent: true,
      opacity: 0.4,
    });
    this.topEdgeMat = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    this.antennaMat = new MeshBasicMaterial({ color: 0xffffff });

    this.billboardMaterials = this.billboardTextures.map(
      (tex) =>
        new MeshBasicMaterial({
          map: tex,
          side: DoubleSide,
          transparent: true,
          opacity: 0.9,
        }),
    );

    this.coneGeo = new ConeGeometry(0.7, 1, 4);
    this.coneGeo.translate(0, 0.5, 0);
    this.coneEdgesGeo = new EdgesGeometry(this.coneGeo);

    this.cylinderGeo = new CylinderGeometry(0.5, 0.5, 1, 32);
    this.cylinderGeo.translate(0, 0.5, 0);

    this.neonStripGeo = new BoxGeometry(0.5, 1, 0.5);
  }
}
