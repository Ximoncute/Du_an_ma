// js/auth-lock.js
import { state } from './state.js';
import { el } from './dom.js';

export function checkWorkspaceLock() {
  if (!state.auth.currentUser) {
    if (el.ipLockOverlay) el.ipLockOverlay.classList.add('hidden');
    return;
  }

  const activeIp = state.connection.activeIp;
  const statusText = document.getElementById('connectionText');
  const statusIp = document.getElementById('connectionIp');
  const statusDot = document.getElementById('connectionDot');

  if (!activeIp) {
    if (el.ipLockOverlay) el.ipLockOverlay.classList.remove('hidden');
    if (statusText) statusText.textContent = 'Chưa kết nối';
    if (statusIp) statusIp.textContent = '---.---.---.---';
    if (statusDot) statusDot.classList.remove('pulse');
    if (el.connectionStatusBlock) el.connectionStatusBlock.style.backgroundColor = '#f1f5f9';
    if (statusText) statusText.style.color = 'var(--text-muted)';
  } else {
    if (el.ipLockOverlay) el.ipLockOverlay.classList.add('hidden');
    if (statusText) statusText.textContent = 'Đã kết nối';
    if (statusIp) statusIp.textContent = activeIp;
    if (statusDot) statusDot.classList.add('pulse');
    if (el.connectionStatusBlock) el.connectionStatusBlock.style.backgroundColor = '';
    if (statusText) statusText.style.color = '';

    const espIpTitle = document.getElementById('state-title-esp32');
    if (espIpTitle) espIpTitle.textContent = `Băng tần 2.4GHz`;
    const espIpTime = document.querySelector('[data-device-id="esp32_node"] .state-time');
    if (espIpTime) espIpTime.textContent = `IP: ${activeIp}`;
    if (el.ipLockInput) el.ipLockInput.value = activeIp;
  }
}

export function showIpError(msg) {
  if (el.ipLockError) {
    el.ipLockError.style.display = 'flex';
    el.ipLockError.querySelector('span').textContent = msg;
  }
}

export function hideIpError() {
  if (el.ipLockError) {
    el.ipLockError.style.display = 'none';
  }
}
