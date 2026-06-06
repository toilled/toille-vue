import { CanvasTexture, NearestFilter, RepeatWrapping } from "three";
import { ROAD_WIDTH, CELL_SIZE } from "../game/config";

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (Math.random() > 0.88) {
    const rand = Math.random();
    if (rand > 0.8) ctx.fillStyle = "#ffffff";
    else if (rand > 0.55) ctx.fillStyle = "#ffaa00";
    else if (rand > 0.3) ctx.fillStyle = "#00ffcc";
    else if (rand > 0.1) ctx.fillStyle = "#ff00cc";
    else ctx.fillStyle = "#aa44ff";
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.fillRect(x, y, w, h);
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 6;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  } else {
    const darkRand = Math.random();
    if (darkRand > 0.92) {
      ctx.fillStyle = "#1a1a2e";
    } else if (darkRand > 0.84) {
      ctx.fillStyle = "#0a0a1a";
    } else {
      ctx.fillStyle = "#050505";
    }
    ctx.fillRect(x, y, w, h);
  }
}

const GRID_COLS = 16;
const GRID_ROWS = 64;
const GRID_PADDING_X = 8;
const GRID_PADDING_Y = 4;

function createGridCanvas(
  ctx: CanvasRenderingContext2D,
  fillColor: string,
  cellColor: string | null,
  drawCell: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void,
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, 1024, 1024);

  const w = (1024 / GRID_COLS) - GRID_PADDING_X;
  const h = (1024 / GRID_ROWS) - GRID_PADDING_Y;

  if (cellColor) ctx.fillStyle = cellColor;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = c * (w + GRID_PADDING_X) + GRID_PADDING_X / 2;
      const y = r * (h + GRID_PADDING_Y) + GRID_PADDING_Y / 2;
      drawCell(ctx, x, y, w, h);
    }
  }
}

// Reusable Texture for Windows
export function createWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    createGridCanvas(ctx, "#111111", null, drawWindow);
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
    createGridCanvas(ctx, "#ffffff", "#222222", (ctx, x, y, w, h) => {
      ctx.fillRect(x, y, w, h);
    });
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

export function createGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, 1024, 1024);

    const roadRatio = ROAD_WIDTH / CELL_SIZE;
    const roadPx = 1024 * roadRatio;
    const halfRoad = roadPx / 2;
    const laneOffset = halfRoad * 0.25;
    const laneWidth = 3;

    // Road surface
    ctx.fillStyle = "#0c0c10";
    ctx.fillRect(0, 0, 1024, halfRoad);
    ctx.fillRect(0, 1024 - halfRoad, 1024, halfRoad);
    ctx.fillRect(0, 0, halfRoad, 1024);
    ctx.fillRect(1024 - halfRoad, 0, halfRoad, 1024);

    // Glowing road edge strips (neon lane edges)
    const edgeGlowColors = ["rgba(255, 0, 204, 0.4)", "rgba(0, 255, 204, 0.4)"];
    // Top road - bottom edge glow
    ctx.fillStyle = edgeGlowColors[0];
    ctx.fillRect(0, halfRoad - 2, 1024, 2);
    ctx.fillStyle = edgeGlowColors[1];
    ctx.fillRect(0, 0, 1024, 2);
    // Bottom road - top edge glow
    ctx.fillStyle = edgeGlowColors[0];
    ctx.fillRect(0, 1024 - halfRoad, 1024, 2);
    ctx.fillStyle = edgeGlowColors[1];
    ctx.fillRect(0, 1024 - 2, 1024, 2);
    // Left road - right edge glow
    ctx.fillStyle = edgeGlowColors[0];
    ctx.fillRect(halfRoad - 2, 0, 2, 1024);
    ctx.fillStyle = edgeGlowColors[1];
    ctx.fillRect(0, 0, 2, 1024);
    // Right road - left edge glow
    ctx.fillStyle = edgeGlowColors[0];
    ctx.fillRect(1024 - halfRoad, 0, 2, 1024);
    ctx.fillStyle = edgeGlowColors[1];
    ctx.fillRect(1024 - 2, 0, 2, 1024);

    // Double lane lines (dashed) - two parallel lines per road
    ctx.setLineDash([16, 20]);
    ctx.lineWidth = laneWidth;

    // Top road lane lines
    ctx.strokeStyle = "#ff00cc";
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(0, laneOffset); ctx.lineTo(1024, laneOffset); ctx.stroke();
    ctx.strokeStyle = "#00ffcc";
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(0, halfRoad - laneOffset); ctx.lineTo(1024, halfRoad - laneOffset); ctx.stroke();

    // Bottom road lane lines
    ctx.strokeStyle = "#ff00cc";
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(0, 1024 - laneOffset); ctx.lineTo(1024, 1024 - laneOffset); ctx.stroke();
    ctx.strokeStyle = "#00ffcc";
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(0, 1024 - halfRoad + laneOffset); ctx.lineTo(1024, 1024 - halfRoad + laneOffset); ctx.stroke();

    // Left road lane lines
    ctx.strokeStyle = "#ff00cc";
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(laneOffset, 0); ctx.lineTo(laneOffset, 1024); ctx.stroke();
    ctx.strokeStyle = "#00ffcc";
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(halfRoad - laneOffset, 0); ctx.lineTo(halfRoad - laneOffset, 1024); ctx.stroke();

    // Right road lane lines
    ctx.strokeStyle = "#ff00cc";
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(1024 - laneOffset, 0); ctx.lineTo(1024 - laneOffset, 1024); ctx.stroke();
    ctx.strokeStyle = "#00ffcc";
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(1024 - halfRoad + laneOffset, 0); ctx.lineTo(1024 - halfRoad + laneOffset, 1024); ctx.stroke();

    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;

    // Center divider line (solid neon) down the middle of each road
    ctx.strokeStyle = "#ffff00";
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    // Top road center
    const centerOffset = halfRoad / 2;
    ctx.beginPath(); ctx.moveTo(0, centerOffset); ctx.lineTo(1024, centerOffset); ctx.stroke();
    // Bottom road center
    ctx.beginPath(); ctx.moveTo(0, 1024 - centerOffset); ctx.lineTo(1024, 1024 - centerOffset); ctx.stroke();
    // Left road center
    ctx.beginPath(); ctx.moveTo(centerOffset, 0); ctx.lineTo(centerOffset, 1024); ctx.stroke();
    // Right road center
    ctx.beginPath(); ctx.moveTo(1024 - centerOffset, 0); ctx.lineTo(1024 - centerOffset, 1024); ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Crosswalks at intersections
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    const crosswalkW = 6;
    const crosswalkSpacing = 8;
    const crosswalkCount = 6;
    for (let c = 0; c < crosswalkCount; c++) {
      const offset = crosswalkSpacing + c * (crosswalkSpacing + crosswalkW);
      if (offset + crosswalkW > halfRoad - 4) break;
      // Top intersection
      ctx.fillRect(offset, 0, crosswalkW, halfRoad);
      ctx.fillRect(offset, 1024 - halfRoad, crosswalkW, halfRoad);
      // Left intersection
      ctx.fillRect(0, offset, halfRoad, crosswalkW);
      ctx.fillRect(1024 - halfRoad, offset, halfRoad, crosswalkW);
    }

    // Noise/wet look
    ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }

    // Occasional neon puddle reflections
    ctx.fillStyle = "rgba(255, 0, 204, 0.04)";
    for (let i = 0; i < 8; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      ctx.beginPath();
      ctx.arc(px, py, 10 + Math.random() * 25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(0, 255, 204, 0.03)";
    for (let i = 0; i < 6; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      ctx.beginPath();
      ctx.arc(px, py, 8 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
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

    // Base cloud shape with stronger neon tint
    const gradient = ctx.createRadialGradient(128, 64, 0, 128, 64, 128);
    gradient.addColorStop(0, "rgba(80, 20, 100, 0.5)");
    gradient.addColorStop(0.3, "rgba(50, 15, 80, 0.3)");
    gradient.addColorStop(0.6, "rgba(30, 10, 60, 0.15)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 128);

    // Multiple neon glow patches (magenta/pink)
    ctx.globalCompositeOperation = "source-atop";
    for (let i = 0; i < 10; i++) {
      const x = 20 + Math.random() * 200;
      const y = 15 + Math.random() * 90;
      const r = 15 + Math.random() * 45;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      const alpha = 0.08 + Math.random() * 0.12;
      glow.addColorStop(0, `rgba(255, 0, 150, ${alpha})`);
      glow.addColorStop(1, "rgba(255, 0, 150, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cyan glow patches
    for (let i = 0; i < 7; i++) {
      const x = 30 + Math.random() * 180;
      const y = 20 + Math.random() * 80;
      const r = 12 + Math.random() * 35;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      const alpha = 0.06 + Math.random() * 0.1;
      glow.addColorStop(0, `rgba(0, 255, 200, ${alpha})`);
      glow.addColorStop(1, "rgba(0, 255, 200, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle yellow/orange glow patches for variety
    for (let i = 0; i < 4; i++) {
      const x = 40 + Math.random() * 160;
      const y = 25 + Math.random() * 70;
      const r = 10 + Math.random() * 25;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(255, 200, 0, 0.06)");
      glow.addColorStop(1, "rgba(255, 200, 0, 0)");
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
