import { CITY_SIZE } from "../game/config";

export class HeightMap {
  private static instance: HeightMap;
  private p: number[] = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): HeightMap {
    if (!HeightMap.instance) {
      HeightMap.instance = new HeightMap();
    }
    return HeightMap.instance;
  }

  private init() {
     this.p = new Array(512);
     const permutation = [ 151,160,137,91,90,15,
       131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
       190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
       88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
       77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
       102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
       135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
       5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
       223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
       129,22,39,253, 19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
       251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
       49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
       138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
     ];
     for (let i=0; i < 256 ; i++) this.p[256+i] = this.p[i] = permutation[i];
  }

  private fade(t: number): number {
      return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
      return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
      const h = hash & 15;
      const u = h < 8 ? x : y;
      const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
      return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number, z: number): number {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const Z = Math.floor(z) & 255;

      x -= Math.floor(x);
      y -= Math.floor(y);
      z -= Math.floor(z);

      const u = this.fade(x);
      const v = this.fade(y);
      const w = this.fade(z);

      const A = this.p[X]+Y;
      const AA = this.p[A]+Z;
      const AB = this.p[A+1]+Z;
      const B = this.p[X+1]+Y;
      const BA = this.p[B]+Z;
      const BB = this.p[B+1]+Z;

      return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
                                     this.grad(this.p[BA], x-1, y, z)),
                             this.lerp(u, this.grad(this.p[AB], x, y-1, z),
                                     this.grad(this.p[BB], x-1, y-1, z))),
                     this.lerp(v, this.lerp(u, this.grad(this.p[AA+1], x, y, z-1),
                                     this.grad(this.p[BA+1], x-1, y, z-1)),
                             this.lerp(u, this.grad(this.p[AB+1], x, y-1, z-1),
                                     this.grad(this.p[BB+1], x-1, y-1, z-1))));
  }

  public getHeight(x: number, z: number): number {
      const scale = 0.0015;
      const amplitude = 50;

      let y = 0;
      y += this.noise(x * scale, z * scale, 0) * amplitude;
      y += this.noise(x * scale * 2, z * scale * 2, 0) * (amplitude * 0.5);
      y += this.noise(x * scale * 4, z * scale * 4, 0) * (amplitude * 0.25);

      // Desert Hills Logic
      const dist = Math.sqrt(x * x + z * z);
      const cityRadius = CITY_SIZE / 2 - 200; // Start transitioning before the exact edge

      if (dist > cityRadius) {
          const hillScale = 0.0006;
          const hillAmp = 500;

          let hillY = 0;
          // Offset noise so it doesn't align exactly with ground
          hillY += this.noise(x * hillScale + 100, z * hillScale + 100, 0) * hillAmp;
          hillY += this.noise(x * hillScale * 2, z * hillScale * 2, 0) * (hillAmp * 0.5);

          // Make sure hills are positive relative to base
          hillY = Math.abs(hillY);

          // Blend factor
          const transitionWidth = 600;
          let alpha = (dist - cityRadius) / transitionWidth;
          alpha = Math.min(Math.max(alpha, 0), 1);

          // Smooth step
          alpha = alpha * alpha * (3 - 2 * alpha);

          y += (hillY + 80) * alpha; // Add 80 base height to lift desert up
      }

      return y;
  }

  public getNormal(x: number, z: number): { x: number; y: number; z: number } {
    const d = 1.0;
    const hL = this.getHeight(x - d, z);
    const hR = this.getHeight(x + d, z);
    const hD = this.getHeight(x, z - d);
    const hU = this.getHeight(x, z + d);

    // Calculate slopes
    const dx = (hR - hL) / (2 * d);
    const dz = (hU - hD) / (2 * d);

    // Normal vector is (-dx, 1, -dz) normalized
    let nx = -dx;
    let ny = 1;
    let nz = -dz;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len;
      ny /= len;
      nz /= len;
    }

    return { x: nx, y: ny, z: nz };
  }
}

export const getHeight = (x: number, z: number) => HeightMap.getInstance().getHeight(x, z);
export const getNormal = (x: number, z: number) => HeightMap.getInstance().getNormal(x, z);
