// js/settings.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { switchActiveNodeIp } from './ip-connection.js';

export function initSettingsManager() {
  if (el.settingsGatewayIp) {
    el.settingsGatewayIp.value = state.connection.activeIp || '';
  }
  if (el.settingsTempThreshold) {
    el.settingsTempThreshold.value = state.settings.tempThreshold;
  }
  if (el.settingsHumidThreshold) {
    el.settingsHumidThreshold.value = state.settings.humidThreshold;
  }
  if (el.settingsLightThreshold) {
    el.settingsLightThreshold.value = state.settings.lightThreshold;
  }

  if (el.btnSaveGatewayIp) {
    el.btnSaveGatewayIp.addEventListener('click', () => {
      const ip = el.settingsGatewayIp.value.trim();
      switchActiveNodeIp(ip);
    });
  }

  // Hàm helper để gửi đồng thời cả 3 ngưỡng cài đặt xuống ESP32
  function publishThresholds() {
    if (state.connection.mqttClient && state.connection.mqttConnected && state.connection.activeIp) {
      const cleanIp = state.connection.activeIp.replace(/\./g, '_');
      const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
      state.connection.mqttClient.publish(controlTopic, JSON.stringify({
        command: 'settings',
        tempThreshold: state.settings.tempThreshold,
        humidThreshold: state.settings.humidThreshold,
        lightThreshold: state.settings.lightThreshold
      }));
    }
  }

  if (el.settingsTempThreshold) {
    el.settingsTempThreshold.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        state.settings.tempThreshold = val;
        localStorage.setItem('settingsTempThreshold', val);
        logSerial(`[Cấu hình] Đã cập nhật ngưỡng cảnh báo nhiệt độ: ${val}°C`, false, true);
        publishThresholds();
      }
    });
  }

  if (el.settingsHumidThreshold) {
    el.settingsHumidThreshold.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        state.settings.humidThreshold = val;
        localStorage.setItem('settingsHumidThreshold', val);
        logSerial(`[Cấu hình] Đã cập nhật ngưỡng cảnh báo độ ẩm: ${val}%`, false, true);
        publishThresholds();
      }
    });
  }

  if (el.settingsLightThreshold) {
    el.settingsLightThreshold.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        state.settings.lightThreshold = val;
        localStorage.setItem('settingsLightThreshold', val);
        logSerial(`[Cấu hình] Đã cập nhật ngưỡng cảnh báo ánh sáng: ${val} lux`, false, true);
        publishThresholds();
      }
    });
  }
}
