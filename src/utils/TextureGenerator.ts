import { CanvasTexture, NearestFilter, RepeatWrapping } from "three";
import { ROAD_WIDTH, CELL_SIZE } from "../game/config";

// Reusable Texture for Windows
export function createWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#050505"; // Slightly lighter black
    ctx.fillRect(0, 0, 64, 128);

    const w = 4;
    const h = 6;
    const gapX = 4;
    const gapY = 6;

    for (let y = 4; y < 128; y += h + gapY) {
      for (let x = 4; x < 64; x += w + gapX) {
        if (Math.random() > 0.4) {
          const rand = Math.random();
          if (rand > 0.95) ctx.fillStyle = "#ffffff"; // Bright White
          else if (rand > 0.8) ctx.fillStyle = "#ffaa00"; // Warm Orange
          else if (rand > 0.5) ctx.fillStyle = "#00ccff"; // Cyan
          else ctx.fillStyle = "#ff00cc"; // Magenta

          ctx.globalAlpha = 0.6 + Math.random() * 0.4;
          ctx.fillRect(x, y, w, h);
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // Add some "dark" buildings or sections
    if (Math.random() > 0.8) {
       ctx.fillStyle = "rgba(0,0,0,0.8)";
       ctx.fillRect(0, 0, 64, 128);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  return texture;
}

export function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; // Higher res
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#080808"; // Dark asphalt
    ctx.fillRect(0, 0, 1024, 1024);

    // Roads are at the edges (tiled)
    const roadRatio = ROAD_WIDTH / CELL_SIZE;
    const roadPx = 1024 * roadRatio;
    const halfRoad = roadPx / 2;

    ctx.fillStyle = "#0a0a0a"; // Slightly lighter road color
    // Horizontal
    ctx.fillRect(0, 0, 1024, halfRoad);
    ctx.fillRect(0, 1024 - halfRoad, 1024, halfRoad);
    // Vertical
    ctx.fillRect(0, 0, halfRoad, 1024);
    ctx.fillRect(1024 - halfRoad, 0, halfRoad, 1024);

    // Dashed Center Lines
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);

    // Horizontal
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1024, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 1024);
    ctx.lineTo(1024, 1024);
    ctx.stroke();

    // Vertical
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1024, 0);
    ctx.lineTo(1024, 1024);
    ctx.stroke();

    ctx.setLineDash([]);

    // Intersection Stop Lines
    ctx.fillStyle = "#333333";
    const stopOffset = halfRoad * 0.8;
    const stopW = 8;

    // Top Intersection
    // Horizontal Stop line for vertical traffic entering intersection from top?
    // Actually, let's just put stop lines before the intersection

    // Vertical Road (top)
    ctx.fillRect(halfRoad, stopOffset, halfRoad, stopW);

    // Vertical Road (bottom)
    ctx.fillRect(halfRoad, 1024 - stopOffset, halfRoad, stopW);

    // Horizontal Road (left)
    ctx.fillRect(stopOffset, halfRoad, stopW, halfRoad);

    // Horizontal Road (right)
    ctx.fillRect(1024 - stopOffset, halfRoad, stopW, halfRoad);

    // Add noise / wet look
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < 2000; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  texture.anisotropy = 16;
  return texture;
}

// Generate Billboard Textures
export function createBillboardTextures() {
  const textures: CanvasTexture[] = [];
  for (let i = 0; i < 8; i++) { // Increased count
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dark background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 128, 64);

      // Neon border
      const colors = ["#ff00cc", "#00ffcc", "#ffff00", "#ff0000", "#00ff00", "#aa00ff", "#0000ff", "#ff8800"];
      const color = colors[i % colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 56);

      // "Text" / Content
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;

      switch (i) {
        case 0: // Lines
          ctx.fillRect(15, 15, 80, 5);
          ctx.fillRect(15, 30, 60, 5);
          ctx.fillRect(15, 45, 90, 5);
          break;
        case 1: // Circles
          ctx.beginPath();
          ctx.arc(32, 32, 20, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(32, 32, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.fillRect(64, 20, 40, 24);
          break;
        case 2: // Triangle
           ctx.beginPath();
           ctx.moveTo(64, 10);
           ctx.lineTo(20, 54);
           ctx.lineTo(108, 54);
           ctx.fill();
           break;
        case 3: // Grid
           for(let gx=10; gx<118; gx+=20) {
             for(let gy=10; gy<54; gy+=10) {
               ctx.fillRect(gx, gy, 15, 5);
             }
           }
           break;
        case 4: // Japanese-like chars (fake)
           ctx.font = "40px serif";
           ctx.fillText("CYBER", 10, 45);
           break;
        default:
          // Random blocks
          for (let k = 0; k < 6; k++) {
            ctx.fillStyle = k % 2 === 0 ? color : "#ffffff";
            ctx.fillRect(
              10 + Math.random() * 100,
              10 + Math.random() * 40,
              10 + Math.random() * 20,
              5 + Math.random() * 10,
            );
          }
          break;
      }
    }
    const texture = new CanvasTexture(canvas);
    textures.push(texture);
  }
  return textures;
}

export function createDroneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 32, 32);

    // Drone body (Quadcopter silhouette)
    ctx.strokeStyle = "#aaaaaa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(28, 28);
    ctx.moveTo(28, 4);
    ctx.lineTo(4, 28);
    ctx.stroke();

    // Rotors
    ctx.fillStyle = "#666666";
    ctx.beginPath();
    ctx.arc(4, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 28, 3, 0, Math.PI * 2);
    ctx.fill();

    // Central Light (White, to be tinted by vertex color)
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  return texture;
}

export function createRoughFloorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Base dark concrete
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, 128, 128);

    // Add random darker/lighter patches - MORE CONTRAST
    for (let i = 0; i < 20; i++) {
      const shade = Math.floor(Math.random() * 100);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      const w = 20 + Math.random() * 60;
      const h = 20 + Math.random() * 60;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(Math.random() * 128 - 20, Math.random() * 128 - 20, w, h);
    }
    ctx.globalAlpha = 1.0;

    // Add noise/cracks (small dots) - BRIGHTER
    for (let i = 0; i < 400; i++) {
      const val = Math.floor(Math.random() * 100) + 50;
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      const w = Math.random() * 3 + 1;
      const h = Math.random() * 3 + 1;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, w, h);
    }

    // Add some colored industrial stains
    const colors = ["#443300", "#003344", "#330033"];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.3;
      const w = Math.random() * 30 + 10;
      const h = Math.random() * 30 + 10;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, w, h);
    }
    ctx.globalAlpha = 1.0;

    // Add detailed lines/wires/cracks
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      ctx.moveTo(Math.random() * 128, Math.random() * 128);
      ctx.lineTo(Math.random() * 128, Math.random() * 128);
    }
    ctx.stroke();

    // Add some random larger darker plates
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(Math.random() * 100, Math.random() * 100, Math.random() * 40 + 20, Math.random() * 40 + 20);
    }
    ctx.globalAlpha = 1.0;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}
