/**
 * Represents a single spaceship in the starfield.
 * @class
 */
export class Spaceship {
  /**
   * The x-coordinate of the spaceship.
   * @type {number}
   */
  x: number;

  /**
   * The y-coordinate of the spaceship.
   * @type {number}
   */
  y: number;

  /**
   * A counter used to animate the spaceship's movement.
   * @type {number}
   */
  counter: number;

  /**
   * The maximum radius of the spaceship.
   * @type {number}
   */
  radiusMax: number;

  /**
   * The speed at which the spaceship moves.
   * @type {number}
   */
  speed: number;

  /**
   * The color of the spaceship.
   * @type {string}
   */
  color: string;

  /**
   * The rendering context of the canvas.
   * @type {CanvasRenderingContext2D}
   */
  context: CanvasRenderingContext2D;

  /**
   * Creates a new Spaceship instance.
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
    this.speed = this.getRandomInt(15, 20);
    this.color = `rgba(255, 255, 255, ${0.8 + Math.random() * 0.2})`;
    this.context = this.mainContext;
  }

  /**
   * Updates the spaceship's position.
   */
  update() {
    this.counter -= this.speed;

    if (this.counter < 1) {
      this.counter = this.canvasWidth;
      this.x = this.getRandomInt(-this.centerX, this.centerX);
      this.y = this.getRandomInt(-this.centerY, this.centerY);
      this.radiusMax = this.getRandomInt(1, 10);
      this.speed = this.getRandomInt(15, 20);
    }
  }

  /**
   * Draws the spaceship on the canvas.
   */
  draw() {
    let xRatio = this.x / this.counter;
    let yRatio = this.y / this.counter;

    let shipX = this.remap(xRatio, 0, 1, 0, this.canvasWidth);
    let shipY = this.remap(yRatio, 0, 1, 0, this.canvasWidth);

    let shipSize = this.remap(this.counter, 0, this.canvasWidth, this.radiusMax, 0);

    // Draw the spaceship body
    this.mainContext.fillStyle = 'rgba(200, 200, 255, 1)';
    this.mainContext.beginPath();
    this.mainContext.moveTo(shipX, shipY - shipSize);
    this.mainContext.lineTo(shipX + shipSize / 2, shipY + shipSize);
    this.mainContext.lineTo(shipX - shipSize / 2, shipY + shipSize);
    this.mainContext.closePath();
    this.mainContext.fill();

    // Draw the cockpit
    this.mainContext.fillStyle = 'rgba(100, 100, 200, 1)';
    this.mainContext.beginPath();
    this.mainContext.arc(shipX, shipY, shipSize / 2, 0, Math.PI * 2);
    this.mainContext.fill();
  }
}
