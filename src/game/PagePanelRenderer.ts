import {
  Scene,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  CanvasTexture,
  Group,
  AdditiveBlending,
  DoubleSide,
  CylinderGeometry,
  SphereGeometry,
} from 'three';
import { getHeight } from '../utils/HeightMap';
import type { Page } from '../interfaces/Page';

const PANEL_WIDTH = 220;
const PANEL_HEIGHT = 280;
const CANVAS_SIZE = 512;
const PANEL_FLOAT_HEIGHT = 350;
const BEAM_SEGMENTS = 8;

interface PanelState {
  group: Group;
  beam: Mesh;
  beamBaseScale: number;
  phase: number;
}

const PAGE_POSITIONS = [
  { x: -680, z: -520 },
  { x: 680, z: -520 },
  { x: -680, z: 520 },
  { x: 680, z: 520 },
];

export class PagePanelRenderer {
  private scene: Scene;
  private panels: PanelState[] = [];
  private pageMeshes: Mesh[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  getPageMeshes(): Mesh[] {
    return this.pageMeshes;
  }

  createPanels(pages: Page[]) {
    pages.forEach((page, index) => {
      if (index >= PAGE_POSITIONS.length) return;
      const pos = PAGE_POSITIONS[index];
      const state = this.createPanel(page, pos);
      this.panels.push(state);
      this.scene.add(state.group);
    });
  }

  private createPanel(page: Page, pos: { x: number; z: number }): PanelState {
    const group = new Group();
    const phase = Math.random() * Math.PI * 2;
    const accent = page.accent || '#00ffcc';

    const groundY = getHeight(pos.x, pos.z);
    const panelY = PANEL_FLOAT_HEIGHT;
    const beamHeight = panelY - groundY;
    const meshes: Mesh[] = [];

    const canvas = this.createPageCanvas(page);
    const texture = new CanvasTexture(canvas);
    texture.anisotropy = 16;

    const geo = new PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT);
    const mat = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new Mesh(geo, mat);
    mesh.userData = { pageLink: page.link, isPagePanel: true };
    group.add(mesh);
    meshes.push(mesh);

    const glowGeo = new PlaneGeometry(PANEL_WIDTH + 8, PANEL_HEIGHT + 8);
    const glowMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.35,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glowMesh = new Mesh(glowGeo, glowMat);
    glowMesh.position.z = -1;
    glowMesh.userData = { pageLink: page.link, isPagePanel: true };
    group.add(glowMesh);
    meshes.push(glowMesh);

    const outerGlowGeo = new PlaneGeometry(PANEL_WIDTH + 20, PANEL_HEIGHT + 20);
    const outerGlowMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.12,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const outerGlow = new Mesh(outerGlowGeo, outerGlowMat);
    outerGlow.position.z = -2;
    outerGlow.userData = { pageLink: page.link, isPagePanel: true };
    group.add(outerGlow);
    meshes.push(outerGlow);

    group.position.set(pos.x, panelY, pos.z);

    group.lookAt(-pos.x * 0.5, panelY, -pos.z * 0.5);

    const beamGeo = new CylinderGeometry(0.8, 1.2, 1, BEAM_SEGMENTS, 1, true);
    const beamMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.15,
      side: DoubleSide,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const beam = new Mesh(beamGeo, beamMat);
    beam.position.y = -beamHeight / 2;
    beam.scale.y = beamHeight;
    beam.userData = { pageLink: page.link, isPagePanel: true };
    group.add(beam);
    meshes.push(beam);

    const coreGeo = new CylinderGeometry(0.3, 0.5, 1, 6);
    const coreMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.3,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const core = new Mesh(coreGeo, coreMat);
    core.position.y = -beamHeight / 2;
    core.scale.y = beamHeight;
    group.add(core);
    meshes.push(core);

    const orbGeo = new SphereGeometry(3, 12, 12);
    const orbMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.8,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const orb = new Mesh(orbGeo, orbMat);
    orb.position.y = -beamHeight;
    orb.userData = { pageLink: page.link, isPagePanel: true };
    group.add(orb);
    meshes.push(orb);

    const glowOrbGeo = new SphereGeometry(6, 16, 16);
    const glowOrbMat = new MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.25,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const glowOrb = new Mesh(glowOrbGeo, glowOrbMat);
    glowOrb.position.y = -beamHeight;
    group.add(glowOrb);
    meshes.push(glowOrb);

    this.pageMeshes.push(...meshes);

    return { group, beam, beamBaseScale: 1, phase };
  }

  private createPageCanvas(page: Page): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d')!;

    const accent = page.accent || '#00ffcc';

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let y = 0; y < CANVAS_SIZE; y += 4) {
      ctx.fillStyle = `rgba(255,255,255,0.015)`;
      ctx.fillRect(0, y, CANVAS_SIZE, 1);
    }

    ctx.shadowColor = accent;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, CANVAS_SIZE - 16, CANVAS_SIZE - 16);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, CANVAS_SIZE - 36, CANVAS_SIZE - 36);
    ctx.globalAlpha = 1;

    this.drawCorners(ctx, accent);

    const gradient = ctx.createLinearGradient(0, 50, 0, 150);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, accent);
    gradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = gradient;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 50);
    ctx.lineTo(CANVAS_SIZE - 30, 50);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (page.icon) {
      ctx.font = '72px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(page.icon, CANVAS_SIZE / 2, 95);
    }

    ctx.font = 'bold 34px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10;
    ctx.fillText(page.title, CANVAS_SIZE / 2, 185);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 215);
    ctx.lineTo(CANVAS_SIZE - 100, 215);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const bodyText = page.body[0] || '';
    const truncated = bodyText.length > 140 ? bodyText.substring(0, 140) + '...' : bodyText;
    ctx.font = '15px Courier New, monospace';
    ctx.fillStyle = '#aaaacc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    this.wrapText(ctx, truncated, CANVAS_SIZE / 2, 240, CANVAS_SIZE - 80, 20);

    ctx.font = 'bold 12px Courier New, monospace';
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.65;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('> CLICK TO ENTER <', CANVAS_SIZE / 2, CANVAS_SIZE - 18);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_SIZE / 2 - 70, CANVAS_SIZE - 35);
    ctx.lineTo(CANVAS_SIZE / 2 + 70, CANVAS_SIZE - 35);
    ctx.stroke();
    ctx.globalAlpha = 1;

    return canvas;
  }

  private drawCorners(ctx: CanvasRenderingContext2D, accent: string) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    const cs = [
      { x: 8, y: 8, dx: 1, dy: 1 },
      { x: CANVAS_SIZE - 8, y: 8, dx: -1, dy: 1 },
      { x: 8, y: CANVAS_SIZE - 8, dx: 1, dy: -1 },
      { x: CANVAS_SIZE - 8, y: CANVAS_SIZE - 8, dx: -1, dy: -1 },
    ];
    for (const c of cs) {
      ctx.beginPath();
      ctx.moveTo(c.x, c.y + c.dy * 28);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x + c.dx * 28, c.y);
      ctx.stroke();
    }
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    if (typeof ctx.measureText !== 'function') {
      ctx.fillText(text.substring(0, 80), x, y);
      return;
    }
    const words = text.split(' ');
    let line = '';
    let lineY = y;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, lineY);
        line = word;
        lineY += lineHeight;
      } else {
        line = testLine;
      }
      if (lineY - y > lineHeight * 5) break;
    }
    if (line) {
      ctx.fillText(line, x, lineY);
    }
  }

  update(time: number) {
    for (const p of this.panels) {
      const bob = Math.sin(time * 0.0008 + p.phase) * 4;
      p.group.position.y = PANEL_FLOAT_HEIGHT + bob;

      const beamPulse = 0.12 + Math.sin(time * 0.002 + p.phase) * 0.05;
      if (p.beam.material instanceof MeshBasicMaterial) {
        p.beam.material.opacity = beamPulse;
      }
    }
  }

  dispose() {
    for (const p of this.panels) {
      this.scene.remove(p.group);
      p.group.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof MeshBasicMaterial) {
            if (child.material.map instanceof CanvasTexture) {
              child.material.map.dispose();
            }
            child.material.dispose();
          }
        }
      });
    }
    this.panels = [];
    this.pageMeshes = [];
  }
}
