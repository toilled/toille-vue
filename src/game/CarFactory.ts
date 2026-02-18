import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  PlaneGeometry,
} from "three";

export class CarFactory {
  private carGeo: BoxGeometry;
  private truckCabGeo: BoxGeometry;
  private truckTrailerGeo: BoxGeometry;
  private tailLightGeo: BoxGeometry;
  private headLightGeo: BoxGeometry;
  private wheelGeo: CylinderGeometry;
  private lightBarGeo: BoxGeometry;
  private underglowGeo: PlaneGeometry;
  private hitboxGeo: BoxGeometry;

  private carBodyMat1: MeshStandardMaterial;
  private carBodyMat2: MeshStandardMaterial;
  private carBodyMat3: MeshStandardMaterial;
  private policeBodyMat: MeshStandardMaterial;
  private wheelMat: MeshStandardMaterial;
  private lightBarMat: MeshBasicMaterial;
  private underglowMat1: MeshBasicMaterial;
  private underglowMat2: MeshBasicMaterial;
  private tailLightMat: MeshBasicMaterial;
  private headLightMat: MeshBasicMaterial;
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
    this.tailLightMat = new MeshBasicMaterial({ color: 0xff0000 });
    this.headLightMat = new MeshBasicMaterial({ color: 0xffffaa });
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
      side: DoubleSide,
    });
    this.underglowMat2 = new MeshBasicMaterial({
      color: 0x00ccff,
      opacity: 0.5,
      transparent: true,
      side: DoubleSide,
    });
  }

  public createCar(isPolice: boolean): Group {
    const isTruck = !isPolice && Math.random() < 0.15;
    let bodyMat;

    if (isPolice) {
      bodyMat = this.policeBodyMat.clone();
    } else {
      const isSpecial = Math.random() > 0.8;
      bodyMat = (
        isSpecial
          ? this.carBodyMat1
          : Math.random() > 0.5
          ? this.carBodyMat2
          : this.carBodyMat3
      ).clone();
    }
    bodyMat.transparent = true;

    const carGroup = new Group();

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

    carGroup.userData = { isPolice, isTruck };

    return carGroup;
  }

  private createTruckGeometry(carGroup: Group, bodyMat: MeshStandardMaterial) {
    const cab = new Mesh(this.truckCabGeo, bodyMat);
    cab.position.set(0, 1.5, 5);
    cab.userData.originalOpacity = 1.0;
    cab.castShadow = true;
    carGroup.add(cab);

    const trailer = new Mesh(this.truckTrailerGeo, bodyMat);
    trailer.position.set(0, 2.5, -4);
    trailer.userData.originalOpacity = 1.0;
    trailer.castShadow = true;
    carGroup.add(trailer);

    const positions = [
      [2.5, -0.5, 7], [-2.5, -0.5, 7], // Front
      [2.8, -0.5, 0], [-2.8, -0.5, 0], // Middle
      [2.8, -0.5, -8], [-2.8, -0.5, -8] // Rear
    ];

    positions.forEach(pos => {
      const w = new Mesh(this.wheelGeo, this.wheelMat);
      w.position.set(pos[0], pos[1], pos[2]);
      w.userData.originalOpacity = 1.0;
      w.castShadow = true;
      carGroup.add(w);
    });
  }

  private createCarGeometry(carGroup: Group, bodyMat: MeshStandardMaterial) {
    const carBody = new Mesh(this.carGeo, bodyMat);
    carBody.userData.originalOpacity = 1.0;
    carBody.castShadow = true;
    carGroup.add(carBody);

    const wheels = [
      { x: 2, z: 2.5 }, { x: -2, z: 2.5 },
      { x: 2, z: -2.5 }, { x: -2, z: -2.5 }
    ];

    wheels.forEach(pos => {
      const w = new Mesh(this.wheelGeo, this.wheelMat);
      w.position.set(pos.x, -0.5, pos.z);
      w.userData.originalOpacity = 1.0;
      w.castShadow = true;
      carGroup.add(w);
    });
  }

  private addPoliceAccessories(carGroup: Group) {
    const lb = new Mesh(this.lightBarGeo, this.lightBarMat);
    lb.position.set(0, 1.25, 0);
    lb.userData.originalOpacity = 1.0;
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
    redMesh.userData.isPoliceFlasherMesh = true;
    redMesh.visible = false;
    carGroup.add(redMesh);

    const blueMesh = new Mesh(new BoxGeometry(0.8, 0.4, 0.4), new MeshBasicMaterial({ color: 0x0000ff }));
    blueMesh.position.set(0.8, 1.5, 0);
    blueMesh.userData.isPoliceFlasherMesh = true;
    blueMesh.visible = false;
    carGroup.add(blueMesh);
  }

  private addUnderglow(carGroup: Group) {
    if (Math.random() > 0.3) {
      const underglowMat = (
        Math.random() > 0.5 ? this.underglowMat1 : this.underglowMat2
      ).clone();
      const underglow = new Mesh(this.underglowGeo, underglowMat);
      underglow.userData.originalOpacity = 0.5;
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = -0.9;
      carGroup.add(underglow);
    }
  }

  private addLights(carGroup: Group) {
      const tlMat = this.tailLightMat.clone();
      tlMat.transparent = true;
      const tl1 = new Mesh(this.tailLightGeo, tlMat);
      tl1.userData.originalOpacity = 1.0;
      tl1.position.set(1.5, 0, -4);
      carGroup.add(tl1);

      const tl2 = new Mesh(this.tailLightGeo, tlMat);
      tl2.userData.originalOpacity = 1.0;
      tl2.position.set(-1.5, 0, -4);
      carGroup.add(tl2);

      const hlMat = this.headLightMat.clone();
      hlMat.transparent = true;
      const hl1 = new Mesh(this.headLightGeo, hlMat);
      hl1.userData.originalOpacity = 1.0;
      hl1.position.set(1.5, 0, 4);
      carGroup.add(hl1);

      const hl2 = new Mesh(this.headLightGeo, hlMat);
      hl2.userData.originalOpacity = 1.0;
      hl2.position.set(-1.5, 0, 4);
      carGroup.add(hl2);
  }

  private addHitbox(carGroup: Group) {
      const hitbox = new Mesh(this.hitboxGeo, this.hitboxMat);
      hitbox.userData.originalOpacity = 0;
      carGroup.add(hitbox);
  }
}
