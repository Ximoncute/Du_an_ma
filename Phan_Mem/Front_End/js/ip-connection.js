// js/ip-connection.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { checkWorkspaceLock, showIpError, hideIpError } from './auth-lock.js';
import { renderRegisteredNodes } from './ip-registry-render.js';
import { initSensorCharts } from './charts.js';
import { updateMetricDisplays } from './sensors.js';

export function initIpConnectionLock() {
  checkWorkspaceLock();

  if (el.btnIpConnect) {
    el.btnIpConnect.addEventListener('click', () => {
      const ip = el.ipLockInput.value.trim();
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipPattern.test(ip)) return showIpError('Định dạng địa chỉ IP không hợp lệ!');

      hideIpError();
      el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'none');
      el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'none');
      el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'flex');
      el.ipLockSpinnerText && (el.ipLockSpinnerText.textContent = `Đang kết nối tới ESP32 tại ${ip}...`);
      el.ipLockLogo && el.ipLockLogo.classList.add('connecting');

      setTimeout(() => {
        state.connection.activeIp = ip;
        localStorage.setItem('activeIp', ip);

        if (!state.connection.registeredIps.includes(ip)) {
          state.connection.registeredIps.push(ip);
          localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
        }

        el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
        el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
        el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
        el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');

        checkWorkspaceLock(); renderRegisteredNodes(); initSensorCharts();
        logSerial(`[Hệ thống] Kết nối thành công tới thiết bị Gateway tại địa chỉ: ${ip}`, false, true);
      }, 1200);
    });
  }

  el.ipLockInput && el.ipLockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') el.btnIpConnect.click();
  });

  if (el.connectionStatusBlock) {
    el.connectionStatusBlock.style.cursor = 'pointer';
    el.connectionStatusBlock.title = 'Click để ngắt kết nối thiết bị';
    el.connectionStatusBlock.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn ngắt kết nối tới thiết bị ESP32 hiện tại?')) {
        logSerial(`[Hệ thống] Đã ngắt kết nối thiết bị có IP: ${state.connection.activeIp}`, true);
        state.connection.activeIp = null;
        localStorage.removeItem('activeIp');
        if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();
        checkWorkspaceLock(); renderRegisteredNodes();
      }
    });
  }
}

export function switchActiveNodeIp(ip) {
  el.ipLockOverlay && el.ipLockOverlay.classList.remove('hidden');
  el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'none');
  el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'none');
  el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'flex');
  el.ipLockSpinnerText && (el.ipLockSpinnerText.textContent = `Đang chuyển kết nối tới Node tại ${ip}...`);
  el.ipLockLogo && el.ipLockLogo.classList.add('connecting');

  if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();

  setTimeout(() => {
    state.connection.activeIp = ip;
    localStorage.setItem('activeIp', ip);

    el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
    el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
    el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
    el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');

    checkWorkspaceLock(); renderRegisteredNodes();

    state.sensors.temp = 28.5; state.sensors.humid = 72; state.sensors.light = 450;
    updateMetricDisplays(); initSensorCharts();
    logSerial(`[Hệ thống] Đã chuyển kết nối thành công tới IP Node: ${ip}`, false, true);
  }, 1000);
}
