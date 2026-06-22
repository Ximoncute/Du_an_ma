// js/settings.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { switchActiveNodeIp } from '../connection/ip-connection.js';

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

  if (el.btnSaveThresholds) {
    el.btnSaveThresholds.addEventListener('click', () => {
      const tempVal = parseFloat(el.settingsTempThreshold.value);
      const humidVal = parseFloat(el.settingsHumidThreshold.value);
      const lightVal = parseFloat(el.settingsLightThreshold.value);

      if (isNaN(tempVal) || isNaN(humidVal) || isNaN(lightVal)) {
        alert('Vui lòng nhập giá trị hợp lệ cho các ngưỡng cảnh báo!');
        return;
      }

      state.settings.tempThreshold = tempVal;
      state.settings.humidThreshold = humidVal;
      state.settings.lightThreshold = lightVal;

      localStorage.setItem('settingsTempThreshold', tempVal);
      localStorage.setItem('settingsHumidThreshold', humidVal);
      localStorage.setItem('settingsLightThreshold', lightVal);

      logSerial(`[Cấu hình] Đã lưu các ngưỡng mới: Nhiệt độ ${tempVal}°C, Độ ẩm ${humidVal}%, Ánh sáng ${lightVal} lux`, false, true);
      publishThresholds();

      // Phản hồi trực quan trên nút bấm
      const originalText = el.btnSaveThresholds.textContent;
      el.btnSaveThresholds.textContent = 'Đã lưu thành công!';
      el.btnSaveThresholds.style.backgroundColor = '#22c55e'; // Màu xanh lá sáng
      el.btnSaveThresholds.style.borderColor = '#22c55e';
      el.btnSaveThresholds.style.color = '#ffffff';
      el.btnSaveThresholds.disabled = true;

      setTimeout(() => {
        el.btnSaveThresholds.textContent = originalText;
        el.btnSaveThresholds.style.backgroundColor = '';
        el.btnSaveThresholds.style.borderColor = '';
        el.btnSaveThresholds.style.color = '';
        el.btnSaveThresholds.disabled = false;
      }, 2000);
    });
  }
}
