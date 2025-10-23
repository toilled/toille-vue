/**
 * Represents a single star in the starfield.
 * @class
 */
export class Star {
  /**
   * The x-coordinate of the star.
   * @type {number}
   */
  x: number;

  /**
   * The y-coordinate of the star.
   * @type {number}
   */
  y: number;

  /**
   * A counter used to animate the star's movement.
   * @type {number}
   */
  counter: number;

  /**
   * The maximum radius of the star.
   * @type {number}
   */
  radiusMax: number;

  /**
   * The speed at which the star moves.
   * @type {number}
   */
  speed: number;

  /**
   * The color of the star.
   * @type {string}
   */
  color: string;

  /**
   * A boolean indicating whether the star is spiky.
   * @type {boolean}
   */
  isSpiky: boolean;

  /**
   * The rendering context of the canvas.
   * @type {CanvasRenderingContext2D}
   */
  context: CanvasRenderingContext2D;

  /**
   * Creates a new Star instance.
   * @param {CanvasRenderingContext2D} mainContext - The rendering context of the canvas.
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} centerX - The x-coordinate of the canvas center.
   * @param {number} centerY - The y-coordinate of the canvas center.
   * @param {function} getRandomInt - A function that returns a random integer.
   * @param {function} remap - A function that remaps a value from one range to another.
   */
  constructor(
    private mainContext: CanvasRenderingContext2D,
    private canvasWidth: number,
    private centerX: number,
    private centerY: number,
    private getRandomInt: (min: number, max: number) => number,
    private remap: (value: number, istart: number, istop: number, ostart: number, ostop: number) => number
  ) {
    this.x = this.getRandomInt(-this.centerX, this.centerX);
    this.y = this.getRandomInt(-this.centerY, this.centerY);
    this.counter = this.getRandomInt(1, this.canvasWidth);
    this.radiusMax = 1 + Math.random() * 2;
    this.speed = this.getRandomInt(5, 10);
    this.color = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
    this.isSpiky = Math.random() > 0.5;
    this.context = this.mainContext;
  }

  /**
   * Draws the star on the canvas.
   */
  drawStar() {
    this.counter -= this.speed;

    if (this.counter < 1) {
      this.counter = this.canvasWidth;
      this.x = this.getRandomInt(-this.centerX, this.centerX);
      this.y = this.getRandomInt(-this.centerY, this.centerY);
      this.radiusMax = this.getRandomInt(1, 10);
      this.speed = this.getRandomInt(1, 5);
    }

    let xRatio = this.x / this.counter;
    let yRatio = this.y / this.counter;

    let starX = this.remap(xRatio, 0, 1, 0, this.canvasWidth);
    let starY = this.remap(yRatio, 0, 1, 0, this.canvasWidth);

    let outerRadius = this.remap(this.counter, 0, this.canvasWidth, this.radiusMax, 0);

    const gradient = this.mainContext.createRadialGradient(starX, starY, 0, starX, starY, outerRadius * 2);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.mainContext.fillStyle = gradient;

    if (this.isSpiky) {
      let innerRadius = outerRadius / 2;
      let rot = Math.PI / 2 * 3;
      const spikes = 5;
      let step = Math.PI / spikes;

      this.mainContext.beginPath();
      this.mainContext.moveTo(starX, starY - outerRadius);

      for (let i = 0; i < spikes; i++) {
        let x = starX + Math.cos(rot) * outerRadius;
        let y = starY + Math.sin(rot) * outerRadius;
        this.mainContext.lineTo(x, y);
        rot += step;

        x = starX + Math.cos(rot) * innerRadius;
        y = starY + Math.sin(rot) * innerRadius;
        this.mainContext.lineTo(x, y);
        rot += step;
      }

      this.mainContext.lineTo(starX, starY - outerRadius);
      this.mainContext.closePath();
      this.mainContext.fill();
    } else {
      this.mainContext.beginPath();
      this.mainContext.arc(starX, starY, outerRadius, 0, Math.PI * 2);
      this.mainContext.fill();
    }
  }
}
