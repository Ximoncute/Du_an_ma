// js/camera-feed.js
import { state } from './state.js';
import { el } from './dom.js';
import { drawCameraScene, drawCameraHUD } from './camera-scene.js';

export function renderLiveCameraFeed() {
  if (!state.camera.isOpen) return;

  const canvas = el.cameraCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = 1280, h = 720;

  const now = performance.now();
  const elapsed = now - state.camera.lastFrameTime;
  state.camera.lastFrameTime = now;
  state.camera.fps = Math.round(1000 / (elapsed || 33));

  if (el.cameraFps) el.cameraFps.textContent = `${state.camera.fps} FPS`;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-w / 2 + state.camera.panX, -h / 2);

  drawCameraScene(ctx, w, h);

  ctx.restore();

  drawCameraHUD(ctx, w, h, now);

  state.camera.animFrameId = requestAnimationFrame(renderLiveCameraFeed);
}
