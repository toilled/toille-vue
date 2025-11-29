<template>
  <canvas id="outerspace" ref="canvasRef" @click="handleClick"></canvas>
  <div class="score-counter" v-if="score > 0">Score: {{ score }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from "vue";

const score = ref(0);
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Shaders
const NEBULA_VS = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
    v_uv = a_position * 0.5 + 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const NEBULA_FS = `
precision mediump float;
uniform sampler2D u_texture;
varying vec2 v_uv;
void main() {
    gl_FragColor = texture2D(u_texture, v_uv);
}
`;

const STAR_VS = `
attribute vec2 a_position;
attribute float a_z;
attribute float a_size;
attribute vec3 a_color;
attribute float a_type;
attribute float a_twinkle;

uniform vec2 u_resolution;
uniform float u_time;

varying vec3 v_color;
varying float v_type;
varying float v_alpha;

void main() {
    float x = a_position.x;
    float y = a_position.y;
    float z = a_z;

    // Perspective projection
    // Matches logic: screenX = centerX + (x/z)*width
    // In clip space: (x/z) * 2.0
    gl_Position = vec4((x / z) * 2.0, -(y / z) * 2.0, 0.0, 1.0);

    // Point Size
    // Matches logic: outerRadius = size * (1.0 - z/width)
    float outerRadius = a_size * (1.0 - z / u_resolution.x);
    gl_PointSize = outerRadius * 2.0;

    // Twinkle
    float twinkle = sin(u_time * 0.003 + a_twinkle) * 0.15;
    float alpha = 0.7 + twinkle;
    v_alpha = clamp(alpha, 0.2, 1.0);

    v_color = a_color;
    v_type = a_type;
}
`;

const STAR_FS = `
precision mediump float;
uniform sampler2D u_atlas;
varying vec3 v_color;
varying float v_type;
varying float v_alpha;

void main() {
    vec2 uv = gl_PointCoord;

    // Atlas: Left half (0.0-0.5) is Round, Right half (0.5-1.0) is Spiky
    // Type 0.0 -> Round, Type 1.0 -> Spiky
    float u = uv.x * 0.5 + (v_type > 0.5 ? 0.5 : 0.0);

    vec4 tex = texture2D(u_atlas, vec2(u, uv.y));

    // Texture is white with gradient alpha. Multiply by color.
    gl_FragColor = vec4(v_color, 1.0) * tex * v_alpha;
}
`;

const LINE_VS = `
attribute vec2 a_position;
attribute float a_alpha;
varying float v_alpha;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_alpha = a_alpha;
}
`;

const LINE_FS = `
precision mediump float;
varying float v_alpha;
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
}
`;

// WebGL Context and State
let gl: WebGLRenderingContext | null = null;
let nebulaProgram: WebGLProgram | null = null;
let starProgram: WebGLProgram | null = null;
let lineProgram: WebGLProgram | null = null;

let nebulaTexture: WebGLTexture | null = null;
let starAtlasTexture: WebGLTexture | null = null;

let starBuffer: WebGLBuffer | null = null;
let lineBuffer: WebGLBuffer | null = null;
let quadBuffer: WebGLBuffer | null = null;

let canvasWidth = 0;
let canvasHeight = 0;
let centerX = 0;
let centerY = 0;

let animationFrameId: number;

// Game State
const NUMBER_OF_STARS = 500;
const STAR_COLORS = [
  { r: 1.0, g: 1.0, b: 1.0 }, // white
  { r: 0.67, g: 0.75, b: 1.0 }, // blue (170, 191, 255)
  { r: 1.0, g: 0.8, b: 0.67 }, // red (255, 204, 170)
  { r: 1.0, g: 1.0, b: 0.67 }, // yellow (255, 255, 170)
];

class Star {
  x: number;
  y: number;
  counter: number;
  radiusMax: number;
  speed: number;
  type: number; // 0 or 1
  color: { r: number, g: number, b: number };
  twinkleOffset: number;
  
  // For hit testing
  screenX: number = 0;
  screenY: number = 0;
  screenRadius: number = 0;

  constructor() {
      this.x = 0;
      this.y = 0;
      this.counter = 0;
      this.radiusMax = 0;
      this.speed = 0;
      this.type = 0;
      this.color = STAR_COLORS[0];
      this.twinkleOffset = 0;
      this.reset(true);
  }

  reset(initial = false) {
      const depth = Math.max(canvasWidth, canvasHeight);
      this.counter = initial ? getRandomInt(1, depth) : depth;

      this.x = getRandomInt(-centerX, centerX);
      this.y = getRandomInt(-centerY, centerY);
      this.radiusMax = 1 + Math.random() * 2; // Keep small to match original look
      this.speed = getRandomInt(5, 10);
      this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      this.type = Math.random() > 0.5 ? 1.0 : 0.0;
      this.twinkleOffset = Math.random() * Math.PI * 2;
  }

  update() {
      this.counter -= this.speed;
      if (this.counter < 1) {
          this.reset();
      }

      const starX = (this.x / this.counter) * canvasWidth;
      const starY = (this.y / this.counter) * canvasHeight;

      this.screenX = centerX + starX;
      this.screenY = centerY + starY;

      const depth = Math.max(canvasWidth, canvasHeight);
      this.screenRadius = this.radiusMax * (1.0 - this.counter / depth);
  }
}

class ShootingStar {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  active: boolean = false;
  opacity: number = 0;

  trigger() {
      if (this.active) return;
      this.active = true;
      this.opacity = 1;

      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;

      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 10;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
  }

  update() {
      if (!this.active) {
          if (Math.random() < 0.005) this.trigger();
          return;
      }
      this.x += this.vx;
      this.y += this.vy;
      this.opacity -= 0.015;
      if (this.opacity <= 0) this.active = false;
  }
}

const stars: Star[] = [];
const shootingStar = new ShootingStar();
// Float32Array for Star Data
// Structure per star: x, y, z, size, r, g, b, type, twinkleOffset (9 floats)
const STAR_VERTEX_SIZE = 9;
const starData = new Float32Array(NUMBER_OF_STARS * STAR_VERTEX_SIZE);

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shader Helpers
function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function initWebGL() {
    if (!canvasRef.value) return;

    // Resize canvas
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvasRef.value.width = canvasWidth;
    canvasRef.value.height = canvasHeight;
    centerX = canvasWidth * 0.5;
    centerY = canvasHeight * 0.5;

    gl = canvasRef.value.getContext('webgl', { alpha: false });
    if (!gl) return;

    // Enable Blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create Programs (if not exists)
    if (!nebulaProgram) nebulaProgram = createProgram(gl, NEBULA_VS, NEBULA_FS);
    if (!starProgram) starProgram = createProgram(gl, STAR_VS, STAR_FS);
    if (!lineProgram) lineProgram = createProgram(gl, LINE_VS, LINE_FS);

    // Init Buffers (if not exists)
    if (!quadBuffer) {
        quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1,  1,
            -1,  1,
            1, -1,
            1,  1
        ]), gl.STATIC_DRAW);
    }

    if (!starBuffer) {
        starBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, starData.byteLength, gl.DYNAMIC_DRAW);
    }

    if (!lineBuffer) {
        lineBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, 4 * 3 * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);
    }

    // Init Textures (always re-create nebula on resize, atlas is static but check existence)
    createNebulaTexture();
    if (!starAtlasTexture) createStarAtlasTexture();
}

function createNebulaTexture() {
    if (!gl) return;

    // Create temporary 2D canvas to draw gradient
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const ctx = tempCanvas.getContext('2d')!;

    // Replicate Nebula Logic
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // First nebula
    const g1 = ctx.createRadialGradient(
        canvasWidth * 0.5, canvasHeight * 0.5, 0,
        canvasWidth * 0.5, canvasHeight * 0.5, canvasWidth * 0.6
    );
    g1.addColorStop(0, 'rgba(100, 50, 150, 0.4)');
    g1.addColorStop(0.5, 'rgba(50, 20, 100, 0.2)');
    g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0,0, canvasWidth, canvasHeight);

    // Second nebula
    const g2 = ctx.createRadialGradient(
        canvasWidth * 0.3, canvasHeight * 0.3, 0,
        canvasWidth * 0.3, canvasHeight * 0.3, canvasWidth * 0.3
    );
    g2.addColorStop(0, 'rgba(255, 100, 200, 0.3)');
    g2.addColorStop(0.5, 'rgba(100, 150, 255, 0.1)');
    g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0,0, canvasWidth, canvasHeight);

    // Upload to texture
    if (nebulaTexture) gl.deleteTexture(nebulaTexture);
    nebulaTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, nebulaTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function createStarAtlasTexture() {
    if (!gl) return;

    const size = 64;
    const half = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size; // 32 for Round, 32 for Spiky
    canvas.height = half;
    const ctx = canvas.getContext('2d')!;

    // Clear
    ctx.clearRect(0,0, size, half);

    // Left: Round (0-31)
    const rGrad = ctx.createRadialGradient(half/2, half/2, 0, half/2, half/2, half/2);
    rGrad.addColorStop(0, 'rgba(255,255,255,1)');
    rGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.arc(half/2, half/2, half/2, 0, Math.PI*2);
    ctx.fill();

    // Right: Spiky (32-63)
    const sGrad = ctx.createRadialGradient(half + half/2, half/2, 0, half + half/2, half/2, half/2);
    sGrad.addColorStop(0, 'rgba(255,255,255,1)');
    sGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sGrad;

    // Draw Star Shape
    let innerRadius = half/4;
    let outerRadius = half/2;
    let rot = Math.PI / 2 * 3;
    const spikes = 5;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(half + half/2, half/2 - outerRadius);
    for(let i=0; i<spikes; i++) {
        let x = half + half/2 + Math.cos(rot) * outerRadius;
        let y = half/2 + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = half + half/2 + Math.cos(rot) * innerRadius;
        y = half/2 + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.closePath();
    ctx.fill();

    if (starAtlasTexture) gl.deleteTexture(starAtlasTexture);
    starAtlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, starAtlasTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function renderLoop() {
    if (!gl || !nebulaProgram || !starProgram || !lineProgram || !quadBuffer || !starBuffer || !lineBuffer) return;

    // Update Stars
    let offset = 0;
    for(let i=0; i<NUMBER_OF_STARS; i++) {
        stars[i].update();
        starData[offset++] = stars[i].x;
        starData[offset++] = stars[i].y;
        starData[offset++] = stars[i].counter;
        starData[offset++] = stars[i].radiusMax;
        starData[offset++] = stars[i].color.r;
        starData[offset++] = stars[i].color.g;
        starData[offset++] = stars[i].color.b;
        starData[offset++] = stars[i].type;
        starData[offset++] = stars[i].twinkleOffset;
    }

    // Update Shooting Star
    shootingStar.update();

    // -- Draw --
    gl.viewport(0, 0, canvasWidth, canvasHeight);

    // 1. Nebula
    gl.useProgram(nebulaProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    const posLocNeb = gl.getAttribLocation(nebulaProgram, 'a_position');
    gl.enableVertexAttribArray(posLocNeb);
    gl.vertexAttribPointer(posLocNeb, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, nebulaTexture);
    gl.uniform1i(gl.getUniformLocation(nebulaProgram, 'u_texture'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 2. Stars
    gl.useProgram(starProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, starData, gl.DYNAMIC_DRAW); // Re-upload

    const aPos = gl.getAttribLocation(starProgram, 'a_position');
    const aZ = gl.getAttribLocation(starProgram, 'a_z');
    const aSize = gl.getAttribLocation(starProgram, 'a_size');
    const aColor = gl.getAttribLocation(starProgram, 'a_color');
    const aType = gl.getAttribLocation(starProgram, 'a_type');
    const aTwinkle = gl.getAttribLocation(starProgram, 'a_twinkle');

    const stride = STAR_VERTEX_SIZE * 4; // bytes

    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(aZ);
    gl.vertexAttribPointer(aZ, 1, gl.FLOAT, false, stride, 2 * 4);

    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, stride, 3 * 4);

    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 4 * 4);

    gl.enableVertexAttribArray(aType);
    gl.vertexAttribPointer(aType, 1, gl.FLOAT, false, stride, 7 * 4);

    gl.enableVertexAttribArray(aTwinkle);
    gl.vertexAttribPointer(aTwinkle, 1, gl.FLOAT, false, stride, 8 * 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, starAtlasTexture);
    gl.uniform1i(gl.getUniformLocation(starProgram, 'u_atlas'), 0);

    gl.uniform2f(gl.getUniformLocation(starProgram, 'u_resolution'), canvasWidth, canvasHeight);
    gl.uniform1f(gl.getUniformLocation(starProgram, 'u_time'), Date.now());

    gl.drawArrays(gl.POINTS, 0, NUMBER_OF_STARS);

    // 3. Shooting Star
    if (shootingStar.active) {
        gl.useProgram(lineProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);

        // Map line to clip space
        // Logic: x -> (x/width)*2 - 1 ?
        // No, I need a simple projection for 2D UI overlay style, or match the perspective?
        // Shooting star is drawn in 2D space in original.
        // So I'll just map 0..width to -1..1

        const x1 = (shootingStar.x / canvasWidth) * 2 - 1;
        const y1 = -((shootingStar.y / canvasHeight) * 2 - 1); // Flip Y
        const x2 = ((shootingStar.x - shootingStar.vx * 3) / canvasWidth) * 2 - 1;
        const y2 = -(((shootingStar.y - shootingStar.vy * 3) / canvasHeight) * 2 - 1);

        const lineData = new Float32Array([
            x1, y1, shootingStar.opacity,
            x2, y2, 0.0
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.DYNAMIC_DRAW);

        const laPos = gl.getAttribLocation(lineProgram, 'a_position');
        const laAlpha = gl.getAttribLocation(lineProgram, 'a_alpha');

        gl.enableVertexAttribArray(laPos);
        gl.vertexAttribPointer(laPos, 2, gl.FLOAT, false, 3*4, 0);

        gl.enableVertexAttribArray(laAlpha);
        gl.vertexAttribPointer(laAlpha, 1, gl.FLOAT, false, 3*4, 2*4);

        gl.drawArrays(gl.LINES, 0, 2);
    }

    animationFrameId = requestAnimationFrame(renderLoop);
}

const handleClick = (event: MouseEvent) => {
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Iterate backwards (top-most first)
  for (let i = stars.length - 1; i >= 0; i--) {
    const star = stars[i];
    // Distance check using stored screen coordinates
    const dx = clickX - star.screenX;
    const dy = clickY - star.screenY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const hitRadius = Math.max(star.screenRadius, 5); // Minimum 5px hit area

    if (distance <= hitRadius) {
      score.value++;
      break;
    }
  }
};

onMounted(() => {
    // Initialize
    for (let i = 0; i < NUMBER_OF_STARS; i++) {
        stars.push(new Star());
    }

    initWebGL();

    // Start loop
    renderLoop();

    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    cancelAnimationFrame(animationFrameId);
});

function handleResize() {
    // Just re-run init to update canvas size and texture.
    // Programs/buffers reuse existing if present.
    initWebGL();
}
</script>

<style scoped>
#outerspace {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.score-counter {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-family: sans-serif;
  font-size: 24px;
  pointer-events: none;
  z-index: 10;
}
</style>
