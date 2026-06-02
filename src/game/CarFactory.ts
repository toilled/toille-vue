import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  PlaneGeometry,
} from "three";

export interface CarPart {
  mesh: Mesh;
  partType: "body" | "wheel" | "cab" | "trailer" | "taillight" | "headlight" | "hitbox" | "underglow" | "lightbar" | "flasher";
}

export class CarFactory {
  public carGeo: BoxGeometry;
  public truckCabGeo: BoxGeometry;
  public truckTrailerGeo: BoxGeometry;
  public tailLightGeo: BoxGeometry;
  public headLightGeo: BoxGeometry;
  public wheelGeo: CylinderGeometry;

  public carBodyMat1: MeshStandardMaterial;
  public carBodyMat2: MeshStandardMaterial;
  public carBodyMat3: MeshStandardMaterial;
  public policeBodyMat: MeshStandardMaterial;
  public wheelMat: MeshStandardMaterial;
  public tailLightMat: MeshBasicMaterial;
  public headLightMat: MeshBasicMaterial;

  private lightBarGeo: BoxGeometry;
  private underglowGeo: PlaneGeometry;
  private hitboxGeo: BoxGeometry;
  private lightBarMat: MeshBasicMaterial;
  private underglowMat1: MeshBasicMaterial;
  private underglowMat2: MeshBasicMaterial;
  private hitboxMat: MeshBasicMaterial;

  constructor() {
    this.carGeo = new BoxGeometry(4, 2, 8);
    this.truckCabGeo = new BoxGeometry(5, 4, 6);
    this.truckTrailerGeo = new BoxGeometry(5.5, 6, 12);
    this.tailLightGeo = new BoxGeometry(0.5, 0.5, 0.1);
    this.headLightGeo = new BoxGeometry(0.5, 0.5, 0.1);
    this.wheelGeo = new CylinderGeometry(0.8, 0.8, 0.5, 16);
    this.wheelGeo.rotateZ(Math.PI / 2);
    this.lightBarGeo = new BoxGeometry(2, 0.5, 0.5);
    this.hitboxGeo = new BoxGeometry(20, 20, 30);
    this.underglowGeo = new PlaneGeometry(5, 9);

    this.carBodyMat1 = new MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
    this.carBodyMat2 = new MeshStandardMaterial({ color: 0x050505, roughness: 0.3, metalness: 0.7 });
    this.carBodyMat3 = new MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.7 });
    this.policeBodyMat = new MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2, metalness: 0.5 });
    this.wheelMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 });
    this.lightBarMat = new MeshBasicMaterial({ color: 0x000000 });
    this.tailLightMat = new MeshBasicMaterial({ color: 0xff0000, transparent: true });
    this.headLightMat = new MeshBasicMaterial({ color: 0xffffaa, transparent: true });
    this.hitboxMat = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      visible: true,
    });
    this.underglowMat1 = new MeshBasicMaterial({
      color: 0xff00cc,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
    this.underglowMat2 = new MeshBasicMaterial({
      color: 0x00ccff,
      opacity: 0.5,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
    });
  }

  public createCar(isPolice: boolean): Group {
    const isTruck = !isPolice && Math.random() < 0.15;
    let bodyMat: MeshStandardMaterial;
    let bodyColor: Color;

    if (isPolice) {
      bodyMat = this.policeBodyMat;
      bodyColor = this.policeBodyMat.color;
    } else {
      const isSpecial = Math.random() > 0.8;
      bodyMat = (
        isSpecial
          ? this.carBodyMat1
          : Math.random() > 0.5
          ? this.carBodyMat2
          : this.carBodyMat3
      );
      bodyColor = bodyMat.color;
    }

    const carGroup = new Group();
    carGroup.userData = { isPolice, isTruck, bodyColor: bodyColor.clone() };

    if (isTruck) {
      this.createTruckGeometry(carGroup, bodyMat);
    } else {
      this.createCarGeometry(carGroup, bodyMat);
    }

    if (isPolice) {
      this.addPoliceAccessories(carGroup);
    } else {
      this.addUnderglow(carGroup);
    }

    this.addLights(carGroup);
    this.addHitbox(carGroup);

    return carGroup;
  }

  private createTruckGeometry(carGroup: Group, bodyMat: MeshStandardMaterial) {
    const cab = new Mesh(this.truckCabGeo, bodyMat);
    cab.position.set(0, 1.5, 5);
    cab.userData = { ...cab.userData, originalOpacity: 1.0, partType: "cab" };
    cab.castShadow = true;
    carGroup.add(cab);

    const trailer = new Mesh(this.truckTrailerGeo, bodyMat);
    trailer.position.set(0, 2.5, -4);
    trailer.userData = { ...trailer.userData, originalOpacity: 1.0, partType: "trailer" };
    trailer.castShadow = true;
    carGroup.add(trailer);

    const positions = [
      [2.5, -0.5, 7], [-2.5, -0.5, 7],
      [2.8, -0.5, 0], [-2.8, -0.5, 0],
      [2.8, -0.5, -8], [-2.8, -0.5, -8]
    ];

    positions.forEach(pos => {
      const w = new Mesh(this.wheelGeo, this.wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      w.userData = { ...w.userData, originalOpacity: 1.0, partType: "wheel" };
      w.castShadow = true;
      carGroup.add(w);
    });
  }

  private createCarGeometry(carGroup: Group, bodyMat: MeshStandardMaterial) {
    const carBody = new Mesh(this.carGeo, bodyMat);
    carBody.userData = { ...carBody.userData, originalOpacity: 1.0, partType: "body" };
    carBody.castShadow = true;
    carGroup.add(carBody);

    const wheels = [
      { x: 2, z: 2.5 }, { x: -2, z: 2.5 },
      { x: 2, z: -2.5 }, { x: -2, z: -2.5 }
    ];

    wheels.forEach(pos => {
      const w = new Mesh(this.wheelGeo, this.wheelMat);
      w.position.set(pos.x, -0.5, pos.z);
      w.userData = { ...w.userData, originalOpacity: 1.0, partType: "wheel" };
      w.castShadow = true;
      carGroup.add(w);
    });
  }

  private addPoliceAccessories(carGroup: Group) {
    const lb = new Mesh(this.lightBarGeo, this.lightBarMat);
    lb.position.set(0, 1.25, 0);
    lb.userData = { ...lb.userData, originalOpacity: 1.0, partType: "lightbar" };
    carGroup.add(lb);

    const flIntensity = 80;
    const flDist = 100;

    const redLight = new PointLight(0xff0000, flIntensity, flDist);
    redLight.position.set(-0.8, 1.5, 0);
    redLight.userData.isPoliceFlasher = true;
    redLight.visible = false;
    carGroup.add(redLight);

    const blueLight = new PointLight(0x0000ff, flIntensity, flDist);
    blueLight.position.set(0.8, 1.5, 0);
    blueLight.userData.isPoliceFlasher = true;
    blueLight.visible = false;
    carGroup.add(blueLight);

    const redMesh = new Mesh(new BoxGeometry(0.8, 0.4, 0.4), new MeshBasicMaterial({ color: 0xff0000 }));
    redMesh.position.set(-0.8, 1.5, 0);
    redMesh.userData = { ...redMesh.userData, isPoliceFlasherMesh: true, partType: "flasher" };
    redMesh.visible = false;
    carGroup.add(redMesh);

    const blueMesh = new Mesh(new BoxGeometry(0.8, 0.4, 0.4), new MeshBasicMaterial({ color: 0x0000ff }));
    blueMesh.position.set(0.8, 1.5, 0);
    blueMesh.userData = { ...blueMesh.userData, isPoliceFlasherMesh: true, partType: "flasher" };
    blueMesh.visible = false;
    carGroup.add(blueMesh);
  }

  private addUnderglow(carGroup: Group) {
    if (Math.random() > 0.3) {
      const underglowMat = (
        Math.random() > 0.5 ? this.underglowMat1 : this.underglowMat2
      ).clone();
      const underglow = new Mesh(this.underglowGeo, underglowMat);
      underglow.userData = { ...underglow.userData, originalOpacity: 0.5, partType: "underglow" };
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = -0.9;
      carGroup.add(underglow);
    }
  }

  private addLights(carGroup: Group) {
      const tlMat = this.tailLightMat.clone();
      tlMat.transparent = true;
      tlMat.depthWrite = false;
      const tl1 = new Mesh(this.tailLightGeo, tlMat);
      tl1.userData = { ...tl1.userData, originalOpacity: 1.0, partType: "taillight" };
      tl1.position.set(1.5, 0, -4);
      carGroup.add(tl1);

      const tl2 = new Mesh(this.tailLightGeo, tlMat);
      tl2.userData = { ...tl2.userData, originalOpacity: 1.0, partType: "taillight" };
      tl2.position.set(-1.5, 0, -4);
      carGroup.add(tl2);

      const hlMat = this.headLightMat.clone();
      hlMat.transparent = true;
      hlMat.depthWrite = false;
      const hl1 = new Mesh(this.headLightGeo, hlMat);
      hl1.userData = { ...hl1.userData, originalOpacity: 1.0, partType: "headlight" };
      hl1.position.set(1.5, 0, 4);
      carGroup.add(hl1);

      const hl2 = new Mesh(this.headLightGeo, hlMat);
      hl2.userData = { ...hl2.userData, originalOpacity: 1.0, partType: "headlight" };
      hl2.position.set(-1.5, 0, 4);
      carGroup.add(hl2);
  }

  private addHitbox(carGroup: Group) {
      const hitbox = new Mesh(this.hitboxGeo, this.hitboxMat);
      hitbox.userData = { ...hitbox.userData, originalOpacity: 0, partType: "hitbox" };
      carGroup.add(hitbox);
  }
}
