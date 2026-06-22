// js/charts/sensors.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { chartLabels, baseTempData, baseHumidData, baseLightData, tempChart, humidChart, lightChart, useFallbackCharts } from './charts-state.js';
import { drawFallbackCharts } from './charts-fallback.js';

export function startSensorFluctuations() {
  // Đã vô hiệu hóa sinh dữ liệu giả lập tự động theo yêu cầu của người dùng để tránh nhảy số khi không có kết nối thực
}

export function updateMetricDisplays() {
  if (!state.connection.activeIp) return;

  if (el.valTemp) el.valTemp.textContent = state.sensors.temp.toFixed(1);
  if (el.valHumid) el.valHumid.textContent = state.sensors.humid;
  if (el.valLight) el.valLight.textContent = state.sensors.light;

  if (el.chartValTemp) el.chartValTemp.textContent = `${state.sensors.temp.toFixed(1)} °C`;
  if (el.chartValHumid) el.chartValHumid.textContent = `${state.sensors.humid} %`;
  if (el.chartValLight) el.chartValLight.textContent = `${state.sensors.light} lux`;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

  // Đẩy phần tử mới vào cuối mảng dữ liệu thực tế
  chartLabels.push(timeStr);
  baseTempData.push(parseFloat(state.sensors.temp.toFixed(1)));
  baseHumidData.push(state.sensors.humid);
  baseLightData.push(state.sensors.light);

  // Giới hạn mảng tối đa 8 điểm để đồ thị cuộn tròn đẹp mắt
  const MAX_POINTS = 8;
  while (chartLabels.length > MAX_POINTS) {
    chartLabels.shift();
    baseTempData.shift();
    baseHumidData.shift();
    baseLightData.shift();
  }

  if (useFallbackCharts.val) {
    drawFallbackCharts();
  } else {
    if (tempChart.val) {
      tempChart.val.update('none');
    }
    if (humidChart.val) {
      humidChart.val.update('none');
    }
    if (lightChart.val) {
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
