// js/charts-fallback.js
import { state } from './state.js';
import { chartLabels, baseTempData, baseHumidData, baseLightData, useFallbackCharts } from './charts-state.js';

export function drawFallbackCharts() {
  if (!useFallbackCharts.val || !state.connection.activeIp) return;
  drawStaticChart2D('tempChart', baseTempData, '#4caf50');
  drawStaticChart2D('humidChart', baseHumidData, '#1976d2');
  drawStaticChart2D('lightChart', baseLightData, '#d97706');
}

export function drawStaticChart2D(canvasId, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = rect.width || 300; canvas.height = rect.height || 180;
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const padL = 35, padR = 15, padT = 20, padB = 25;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  const minVal = Math.min(...values) * 0.9, maxVal = Math.max(...values) * 1.1;
  const valRange = maxVal - minVal || 1;
  ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  for (let r = 0; r <= 3; r++) {
    const y = padT + (chartH / 3) * r;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = '#94a3b8'; ctx.font = '10px Inter';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText((maxVal - (valRange / 3) * r).toFixed(0), padL - 6, y); ctx.setLineDash([4, 4]);
  }
  ctx.setLineDash([]); ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < chartLabels.length; i++) {
    ctx.fillText(chartLabels[i], padL + (chartW / (chartLabels.length - 1)) * i, h - padB + 6);
  }
  const points = [];
  for (let i = 0; i < values.length; i++) {
    points.push({
      x: padL + (chartW / (chartLabels.length - 1)) * i,
      y: h - padB - ((values[i] - minVal) / valRange) * chartH
    });
  }
  const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
  if (color === '#4caf50') {
    grad.addColorStop(0, 'rgba(76, 175, 80, 0.22)'); grad.addColorStop(1, 'rgba(76, 175, 80, 0.0)');
  } else if (color === '#1976d2') {
    grad.addColorStop(0, 'rgba(25, 118, 210, 0.22)'); grad.addColorStop(1, 'rgba(25, 118, 210, 0.0)');
  } else {
    grad.addColorStop(0, 'rgba(217, 119, 6, 0.22)'); grad.addColorStop(1, 'rgba(217, 119, 6, 0.0)');
  }
  ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(points[0].x, h - padB);
  for (let i = 0; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.lineTo(points[points.length - 1].x, h - padB); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2, yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y); ctx.stroke();
  ctx.fillStyle = color; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (let i = 0; i < points.length; i++) {
    ctx.beginPath(); ctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText(values[i].toFixed(1), points[i].x, points[i].y - 5);
  }
}
