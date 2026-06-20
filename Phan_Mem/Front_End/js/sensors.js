// js/sensors.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { baseTempData, baseHumidData, baseLightData, tempChart, humidChart, lightChart, useFallbackCharts } from './charts-state.js';
import { drawFallbackCharts } from './charts-fallback.js';

export function startSensorFluctuations() {
  setInterval(() => {
    if (!state.connection.activeIp) return;
    if (state.connection.mqttConnected) return; // Không tự tạo dữ liệu giả lập khi đã kết nối phần cứng thực tế

    const tempDelta = (Math.random() - 0.5) * 0.2;
    state.sensors.temp = Math.max(15, Math.min(45, state.sensors.temp + tempDelta));

    const humidDelta = Math.floor(Math.random() * 3) - 1;
    state.sensors.humid = Math.max(10, Math.min(100, state.sensors.humid + humidDelta));

    const lightDelta = Math.floor(Math.random() * 11) - 5;
    state.sensors.light = Math.max(0, Math.min(1000, state.sensors.light + lightDelta));

    updateMetricDisplays();
  }, 3000);
}

export function updateMetricDisplays() {
  if (!state.connection.activeIp) return;

  if (el.valTemp) el.valTemp.textContent = state.sensors.temp.toFixed(1);
  if (el.valHumid) el.valHumid.textContent = state.sensors.humid;
  if (el.valLight) el.valLight.textContent = state.sensors.light;

  if (el.chartValTemp) el.chartValTemp.textContent = `${state.sensors.temp.toFixed(1)} °C`;
  if (el.chartValHumid) el.chartValHumid.textContent = `${state.sensors.humid} %`;
  if (el.chartValLight) el.chartValLight.textContent = `${state.sensors.light} lux`;

  baseTempData[baseTempData.length - 1] = parseFloat(state.sensors.temp.toFixed(1));
  baseHumidData[baseHumidData.length - 1] = state.sensors.humid;
  baseLightData[baseLightData.length - 1] = state.sensors.light;

  if (useFallbackCharts.val) {
    drawFallbackCharts();
  } else {
    if (tempChart.val) {
      tempChart.val.data.datasets[0].data[tempChart.val.data.datasets[0].data.length - 1] = parseFloat(state.sensors.temp.toFixed(1));
      tempChart.val.update('none');
    }
    if (humidChart.val) {
      humidChart.val.data.datasets[0].data[humidChart.val.data.datasets[0].data.length - 1] = state.sensors.humid;
      humidChart.val.update('none');
    }
    if (lightChart.val) {
      lightChart.val.data.datasets[0].data[lightChart.val.data.datasets[0].data.length - 1] = state.sensors.light;
      lightChart.val.update('none');
    }
  }

  if (state.serial.connected) {
    if (state.sensors.temp > state.settings.tempThreshold) {
      logSerial(`[CẢNH BÁO] Nhiệt độ vượt ngưỡng cài đặt: ${state.sensors.temp.toFixed(1)}°C (Ngưỡng: ${state.settings.tempThreshold}°C)`, true);
    }
    if (state.sensors.light > state.settings.lightThreshold) {
      logSerial(`[CẢNH BÁO] Ánh sáng vượt ngưỡng cài đặt: ${state.sensors.light} lux (Ngưỡng: ${state.settings.lightThreshold} lux)`, true);
    }
    logSerial(`[ESP32] TEMP=${state.sensors.temp.toFixed(1)} C, HUMID=${state.sensors.humid} %, LIGHT=${state.sensors.light} Lux`);
  }
}
