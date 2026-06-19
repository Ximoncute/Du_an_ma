// js/camera-scene.js
import { state } from './state.js';

export function drawCameraScene(ctx, w, h) {
  ctx.fillStyle = '#334155'; ctx.fillRect(100, 100, 1080, 520);
  ctx.fillStyle = '#0f172a'; ctx.beginPath();
  ctx.moveTo(100, 500); ctx.lineTo(1180, 500); ctx.lineTo(1280, 720); ctx.lineTo(0, 720);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
  for (let i = -200; i <= 1400; i += 200) {
    ctx.beginPath(); ctx.moveTo(w / 2 + (i - w / 2) * 0.6, 500); ctx.lineTo(i, 720); ctx.stroke();
  }
  ctx.fillStyle = '#020617'; ctx.fillRect(200, 180, 160, 200);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.fillRect(205, 185, 70, 90); ctx.fillRect(285, 185, 70, 90);
  ctx.fillRect(205, 285, 70, 90); ctx.fillRect(285, 285, 70, 90);

  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(900, 540); ctx.lineTo(900, 320); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.beginPath();
  ctx.moveTo(860, 320); ctx.lineTo(940, 320); ctx.lineTo(960, 260); ctx.lineTo(840, 260);
  ctx.closePath(); ctx.fill();

  if (state.devices.light_living.active) {
    const gradGlow = ctx.createLinearGradient(900, 320, 900, 540);
    gradGlow.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
    gradGlow.addColorStop(1, 'rgba(253, 224, 71, 0.0)');
    ctx.fillStyle = gradGlow; ctx.beginPath();
    ctx.moveTo(880, 320); ctx.lineTo(920, 320); ctx.lineTo(1050, 540); ctx.lineTo(750, 540);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(900, 320, 10, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#475569'; ctx.fillRect(450, 380, 380, 120);
  ctx.fillStyle = '#334155'; ctx.fillRect(420, 360, 50, 140); ctx.fillRect(810, 360, 50, 140);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(450, 480, 380, 20);
  ctx.fillStyle = '#090d16'; ctx.fillRect(510, 200, 260, 140);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 4; ctx.strokeRect(510, 200, 260, 140);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(520, 210, 240, 120);

  if (state.lcdText) {
    ctx.fillStyle = '#10b981'; ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.fillText(state.lcdText, 640, 275); ctx.textAlign = 'left';
  }
}

export function drawCameraHUD(ctx, w, h, now) {
  const timeSecs = Math.floor(now / 1000);
  if (timeSecs % 2 === 0) {
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(60, 50, 8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px "Courier New", monospace'; ctx.fillText('REC', 80, 58);
  ctx.font = '18px "Courier New", monospace';
  ctx.fillText('CAM_01_LIVINGROOM', 60, 95); ctx.fillText('SIGNAL: 98% [EXCELLENT]', 60, 130);

  const rawNow = new Date();
  const liveTimeStr = `${String(rawNow.getHours()).padStart(2, '0')}:${String(rawNow.getMinutes()).padStart(2, '0')}:${String(rawNow.getSeconds()).padStart(2, '0')}.${String(Math.floor(rawNow.getMilliseconds() / 100)).padStart(1, '0')}`;
  const liveDateStr = `${rawNow.getFullYear()}-${String(rawNow.getMonth() + 1).padStart(2, '0')}-${String(rawNow.getDate()).padStart(2, '0')}`;

  ctx.textAlign = 'right';
  ctx.fillText(liveDateStr, w - 60, 58); ctx.fillText(liveTimeStr, w - 60, 95);
  ctx.fillText(`ZOOM: ${state.camera.zoom.toFixed(1)}X`, w - 60, 130); ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.strokeRect(w / 2 - 80, h / 2 - 60, 160, 120);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 2;
  const drawCorner = (x, y, dx, dy) => {
    ctx.beginPath(); ctx.moveTo(x, y + dy); ctx.lineTo(x, y); ctx.lineTo(x + dx, y); ctx.stroke();
  };
  drawCorner(w / 2 - 95, h / 2 - 75, 25, 25); drawCorner(w / 2 + 95, h / 2 - 75, -25, 25);
  drawCorner(w / 2 - 95, h / 2 + 75, 25, -25); drawCorner(w / 2 + 95, h / 2 + 75, -25, -25);

  state.camera.scanlineY += 3;
  if (state.camera.scanlineY > h) state.camera.scanlineY = 0;
  const gradScan = ctx.createLinearGradient(0, state.camera.scanlineY - 4, 0, state.camera.scanlineY + 4);
  gradScan.addColorStop(0, 'rgba(56, 189, 248, 0)'); gradScan.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)'); gradScan.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = gradScan; ctx.fillRect(0, state.camera.scanlineY - 4, w, 8);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; ctx.lineWidth = 1; ctx.beginPath();
  ctx.moveTo(20, state.camera.scanlineY); ctx.lineTo(60, state.camera.scanlineY);
  ctx.moveTo(w - 60, state.camera.scanlineY); ctx.lineTo(w - 20, state.camera.scanlineY); ctx.stroke();
}
