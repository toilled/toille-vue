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
          if (rand > 0.95)
            ctx.fillStyle = "#ffffff"; // Bright White
          else if (rand > 0.8)
            ctx.fillStyle = "#ffaa00"; // Warm Orange
          else if (rand > 0.5)
            ctx.fillStyle = "#00ccff"; // Cyan
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
  for (let i = 0; i < 8; i++) {
    // Increased count
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dark background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 128, 64);

      // Neon border
      const colors = [
        "#ff00cc",
        "#00ffcc",
        "#ffff00",
        "#ff0000",
        "#00ff00",
        "#aa00ff",
        "#0000ff",
        "#ff8800",
      ];
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
          for (let gx = 10; gx < 118; gx += 20) {
            for (let gy = 10; gy < 54; gy += 10) {
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
