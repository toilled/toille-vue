import { CanvasTexture, NearestFilter, RepeatWrapping } from "three";
import { ROAD_WIDTH, CELL_SIZE } from "../game/config";

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (Math.random() > 0.95) {
    const rand = Math.random();
    if (rand > 0.9) ctx.fillStyle = "#ffffff";
    else if (rand > 0.7) ctx.fillStyle = "#ffaa00";
    else if (rand > 0.4) ctx.fillStyle = "#00ffcc";
    else ctx.fillStyle = "#ff00cc";
    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1.0;
  } else {
    ctx.fillStyle = "#050505";
    ctx.fillRect(x, y, w, h);
  }
}

// Reusable Texture for Windows
export function createWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, 1024, 1024);

    const cols = 16;
    const rows = 64;
    const paddingX = 8;
    const paddingY = 4;
    const w = (1024 / cols) - paddingX;
    const h = (1024 / rows) - paddingY;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (w + paddingX) + paddingX / 2;
        const y = r * (h + paddingY) + paddingY / 2;
        drawWindow(ctx, x, y, w, h);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  texture.anisotropy = 16;
  return texture;
}

export function createGroundNormalMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Base flat normal is (128, 128, 255)
    ctx.fillStyle = "rgb(128, 128, 255)";
    ctx.fillRect(0, 0, 1024, 1024);

    if (!ctx.getImageData) {
      return new CanvasTexture(canvas);
    }
    // Generate noise for asphalt bumps
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Random bump value between -32 and +32
      const noiseX = (Math.random() - 0.5) * 64;
      const noiseY = (Math.random() - 0.5) * 64;

      // Modify R and G channels, keep B at 255
      data[i] = Math.max(0, Math.min(255, 128 + noiseX));     // R (X vector)
      data[i+1] = Math.max(0, Math.min(255, 128 + noiseY));   // G (Y vector)
      // data[i+2] = 255; // B (Z vector) already set by fillRect
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

export function createWindowRoughnessMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff"; // White = rough (frames)
    ctx.fillRect(0, 0, 1024, 1024);

    const cols = 16;
    const rows = 64;
    const paddingX = 8;
    const paddingY = 4;
    const w = (1024 / cols) - paddingX;
    const h = (1024 / rows) - paddingY;

    ctx.fillStyle = "#222222"; // Dark = smooth (glass)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * (w + paddingX) + paddingX / 2;
        const y = r * (h + paddingY) + paddingY / 2;
        ctx.fillRect(x, y, w, h);
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
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
    ctx.strokeStyle = "#444444"; // Not lit
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

function drawBillboardContent(ctx: CanvasRenderingContext2D, i: number, color: string) {
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;

  switch (i) {
    case 0:
      ctx.fillRect(15, 15, 80, 5);
      ctx.fillRect(15, 30, 60, 5);
      ctx.fillRect(15, 45, 90, 5);
      break;
    case 1:
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
    case 2:
      ctx.beginPath();
      ctx.moveTo(64, 10);
      ctx.lineTo(20, 54);
      ctx.lineTo(108, 54);
      ctx.fill();
      break;
    case 3:
      for (let gx = 10; gx < 118; gx += 20) {
        for (let gy = 10; gy < 54; gy += 10) {
          ctx.fillRect(gx, gy, 15, 5);
        }
      }
      break;
    case 4:
      ctx.font = "40px serif";
      ctx.fillText("CYBER", 10, 45);
      break;
    default:
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

// Generate Billboard Textures
export function createBillboardTextures() {
  const textures: CanvasTexture[] = [];
  const colors = [
    "#ff00cc", "#00ffcc", "#ffff00", "#ff0000",
    "#00ff00", "#aa00ff", "#0000ff", "#ff8800",
  ];

  for (let i = 0; i < 8; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 128, 64);
      const color = colors[i % colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 56);
      drawBillboardContent(ctx, i, color);
    }
    const texture = new CanvasTexture(canvas);
    textures.push(texture);
  }
  return textures;
}

export function createCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx && ctx.createRadialGradient) {
    ctx.clearRect(0, 0, 256, 128);

    const gradient = ctx.createRadialGradient(128, 64, 0, 128, 64, 128);
    gradient.addColorStop(0, "rgba(60, 20, 80, 0.4)");
    gradient.addColorStop(0.4, "rgba(40, 10, 60, 0.2)");
    gradient.addColorStop(0.7, "rgba(20, 5, 40, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 128);

    ctx.globalCompositeOperation = "source-atop";
    for (let i = 0; i < 8; i++) {
      const x = 30 + Math.random() * 180;
      const y = 20 + Math.random() * 80;
      const r = 20 + Math.random() * 40;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(255, 0, 150, 0.15)");
      glow.addColorStop(1, "rgba(255, 0, 150, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      const x = 40 + Math.random() * 160;
      const y = 30 + Math.random() * 60;
      const r = 15 + Math.random() * 30;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(0, 255, 200, 0.1)");
      glow.addColorStop(1, "rgba(0, 255, 200, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}
