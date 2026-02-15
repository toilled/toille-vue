import { CanvasTexture, NearestFilter, RepeatWrapping } from "three";
import { ROAD_WIDTH, CELL_SIZE } from "../game/config";

// Reusable Texture for Windows
export function createWindowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, 32, 64);
    // random windows
    for (let y = 2; y < 64; y += 4) {
      for (let x = 2; x < 32; x += 4) {
        if (Math.random() > 0.5) { // Increased density (was 0.6)
          ctx.fillStyle = Math.random() > 0.5 ? "#ff00cc" : "#00ccff";
          ctx.fillRect(x, y, 2, 2);
        }
      }
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
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0a0a15"; // Base ground color
    ctx.fillRect(0, 0, 512, 512);

    // Draw Cross Roads - AT EDGES so center is block
    ctx.fillStyle = "#050505";
    const roadRatio = ROAD_WIDTH / CELL_SIZE;
    const roadPx = 512 * roadRatio;
    const halfRoad = roadPx / 2;

    // Horizontal (Top and Bottom)
    ctx.fillRect(0, 0, 512, halfRoad);
    ctx.fillRect(0, 512 - halfRoad, 512, halfRoad);

    // Vertical (Left and Right)
    ctx.fillRect(0, 0, halfRoad, 512);
    ctx.fillRect(512 - halfRoad, 0, halfRoad, 512);

    // Road Lines (Dashed) - EDGE CENTERED
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    // Horizontal Line (at 0 and 512, visually merged)
    ctx.beginPath();
    ctx.moveTo(0, 0); // Top
    ctx.lineTo(512, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 512); // Bottom
    ctx.lineTo(512, 512);
    ctx.stroke();

    // Vertical Line
    ctx.beginPath();
    ctx.moveTo(0, 0); // Left
    ctx.lineTo(0, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, 0); // Right
    ctx.lineTo(512, 512);
    ctx.stroke();

    // Stop lines / Intersection details?
    // Add subtle noise?
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Add sand/dust overlay to make it blend better with desert
    ctx.fillStyle = "#C2B280";
    ctx.globalAlpha = 0.05; // Very subtle
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        // Concentrate slightly more near edges? No, uniform is fine for now
        ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1.0;
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
  for (let i = 0; i < 5; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Dark background
      ctx.fillStyle = "#100010";
      ctx.fillRect(0, 0, 128, 64);

      // Neon border
      const colors = ["#ff00cc", "#00ffcc", "#ffff00", "#ff0000", "#00ff00"];
      const color = colors[i % colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 120, 56);

      // "Text" / Content
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      switch (i) {
        case 0:
          // Lines
          ctx.fillRect(15, 15, 80, 5);
          ctx.fillRect(15, 30, 60, 5);
          ctx.fillRect(15, 45, 90, 5);
          break;
        case 1:
          // Circles
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
        default:
          // Random blocks
          for (let k = 0; k < 5; k++) {
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
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(28, 28);
    ctx.moveTo(28, 4);
    ctx.lineTo(4, 28);
    ctx.stroke();

    // Rotors
    ctx.fillStyle = "#444444";
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
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(16, 16, 5, 0, Math.PI * 2);
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
      const shade = Math.floor(Math.random() * 100); // Increased range 0-100 (was 0-40)
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      const w = 20 + Math.random() * 60;
      const h = 20 + Math.random() * 60;
      ctx.globalAlpha = 0.4; // Slightly more opaque
      ctx.fillRect(Math.random() * 128 - 20, Math.random() * 128 - 20, w, h);
    }
    ctx.globalAlpha = 1.0;

    // Add noise/cracks (small dots) - BRIGHTER
    for (let i = 0; i < 400; i++) {
      const val = Math.floor(Math.random() * 100) + 50; // Brighter dots (50-150)
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      const w = Math.random() * 3 + 1;
      const h = Math.random() * 3 + 1;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, w, h);
    }

    // Add some colored industrial stains (very subtle)
    const colors = ["#443300", "#003344", "#330033"]; // Slightly vivid
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.globalAlpha = 0.3;
      const w = Math.random() * 30 + 10;
      const h = Math.random() * 30 + 10;
      ctx.fillRect(Math.random() * 128, Math.random() * 128, w, h);
    }
    ctx.globalAlpha = 1.0;

    // Add detailed lines/wires/cracks
    ctx.strokeStyle = "#555555"; // Lighter lines
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      ctx.moveTo(Math.random() * 128, Math.random() * 128);
      ctx.lineTo(Math.random() * 128, Math.random() * 128);
    }
    ctx.stroke();

    // Add some random larger darker plates
    ctx.fillStyle = "#000000"; // Pure black for contrast
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

export function createSandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Base sand color (yellowish-brown)
    ctx.fillStyle = "#C2B280";
    ctx.fillRect(0, 0, 512, 512);

    // Add noise
    for (let i = 0; i < 20000; i++) {
      const shade = Math.floor(Math.random() * 60) - 30;
      // Base is roughly 194, 178, 128
      const r = Math.max(0, Math.min(255, 194 + shade));
      const g = Math.max(0, Math.min(255, 178 + shade));
      const b = Math.max(0, Math.min(255, 128 + shade));

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
      const w = Math.random() * 3 + 1;
      const h = Math.random() * 3 + 1;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, w, h);
    }

    // Add some larger patches/dunes shading
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#A09060" : "#E0D0A0";
      ctx.globalAlpha = 0.2;
      const w = Math.random() * 100 + 20;
      const h = Math.random() * 100 + 20;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, w, h);
    }
    ctx.globalAlpha = 1.0;
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = NearestFilter;
  return texture;
}
