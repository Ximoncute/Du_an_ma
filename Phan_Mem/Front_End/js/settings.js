// js/settings.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { switchActiveNodeIp } from './ip-connection.js';

export function initSettingsManager() {
  if (el.settingsGatewayIp) {
    el.settingsGatewayIp.value = state.connection.activeIp || '192.168.1.100';
  }
  if (el.settingsTempThreshold) {
    el.settingsTempThreshold.value = state.settings.tempThreshold;
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

  if (el.settingsTempThreshold) {
    el.settingsTempThreshold.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        state.settings.tempThreshold = val;
        localStorage.setItem('settingsTempThreshold', val);
        logSerial(`[Cấu hình] Đã cập nhật ngưỡng cảnh báo nhiệt độ: ${val}°C`, false, true);
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
      }
    });
  }
}
