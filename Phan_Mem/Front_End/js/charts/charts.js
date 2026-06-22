// js/charts/charts.js
import { state } from '../core/state.js';
import { chartLabels, baseTempData, baseHumidData, baseLightData, tempChart, humidChart, lightChart, useFallbackCharts } from './charts-state.js';
import { drawFallbackCharts } from './charts-fallback.js';

export function initSensorCharts() {
  if (!state.connection.activeIp) return;

  if (typeof Chart === 'undefined') {
    useFallbackCharts.val = true;
    drawFallbackCharts();
    window.addEventListener('resize', drawFallbackCharts);
    return;
  }

  try {
    const fontConfig = { family: "'Inter', sans-serif", size: 11, weight: 500 };
    const commonOptions = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: "'Inter', sans-serif", size: 12, weight: 600 },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          padding: 10, cornerRadius: 8, displayColors: false
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: fontConfig, color: '#94a3b8' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { font: fontConfig, color: '#94a3b8' } }
      },
      elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 0, hoverRadius: 5 } }
    };

    const drawChart = (canvasId, data, color, chartRef, gradColors) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 180);
      grad.addColorStop(0, gradColors[0]);
      grad.addColorStop(1, gradColors[1]);
      if (chartRef.val) chartRef.val.destroy();
      chartRef.val = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [{ data, borderColor: color, backgroundColor: grad, fill: true }]
        },
        options: commonOptions
      });
    };

    drawChart('tempChart', baseTempData, '#4caf50', tempChart, ['rgba(76, 175, 80, 0.25)', 'rgba(76, 175, 80, 0.0)']);
    drawChart('humidChart', baseHumidData, '#1976d2', humidChart, ['rgba(25, 118, 210, 0.25)', 'rgba(25, 118, 210, 0.0)']);
    drawChart('lightChart', baseLightData, '#d97706', lightChart, ['rgba(217, 119, 6, 0.25)', 'rgba(217, 119, 6, 0.0)']);

  } catch (err) {
    useFallbackCharts.val = true;
    drawFallbackCharts();
    window.addEventListener('resize', drawFallbackCharts);
  }
}
