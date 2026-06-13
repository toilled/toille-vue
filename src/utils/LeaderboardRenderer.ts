import { CanvasTexture } from "three";
import { LEADERBOARD_CANVAS_SIZE } from "../game/constants/CyberpunkCity";

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export function createLeaderboardCanvas(): { canvas: HTMLCanvasElement; texture: CanvasTexture } {
  const canvas = document.createElement("canvas");
  canvas.width = LEADERBOARD_CANVAS_SIZE;
  canvas.height = LEADERBOARD_CANVAS_SIZE;
  const texture = new CanvasTexture(canvas);
  texture.anisotropy = 16;
  return { canvas, texture };
}

export function drawLeaderboard(canvas: HTMLCanvasElement, texture: CanvasTexture, entries: LeaderboardEntry[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#100010";
  ctx.fillRect(0, 0, LEADERBOARD_CANVAS_SIZE, LEADERBOARD_CANVAS_SIZE);
  ctx.scale(2, 2);

  drawTitle(ctx);
  drawScores(ctx, entries);
  drawFooter(ctx);

  texture.needsUpdate = true;
}

function drawTitle(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 504, 504);

  ctx.fillStyle = "#00ffcc";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 10;
  ctx.fillText("LEADERBOARD", 256, 80);
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(20, 100);
  ctx.lineTo(492, 100);
  ctx.stroke();
}

function drawScores(ctx: CanvasRenderingContext2D, entries: LeaderboardEntry[]) {
  ctx.font = "bold 40px Courier New";
  ctx.textAlign = "left";
  let y = 160;

  if (entries.length === 0) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText("Loading...", 256, 250);
    return;
  }

  entries.forEach((entry, idx) => {
    const colors = ["#ffff00", "#cccccc", "#cd7f32", "#ffffff"];
    ctx.fillStyle = colors[idx] || colors[3];

    const rank = `${idx + 1}.`;
    const name = entry.name.substring(0, 8).toUpperCase();
    const scoreStr = entry.score.toString();

    ctx.fillText(rank, 40, y);
    ctx.fillText(name, 110, y);

    ctx.textAlign = "right";
    ctx.fillText(scoreStr, 470, y);
    ctx.textAlign = "left";

    y += 60;
  });
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#00ffcc";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CRASH TO SUBMIT SCORE", 256, 480);
}
