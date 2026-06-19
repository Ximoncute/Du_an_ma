// js/devices-state.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';

export function setDeviceActiveState(deviceId, active) {
  if (!state.connection.activeIp) return;
  state.devices[deviceId].active = active;
  const card = document.querySelector(`.device-card[data-device-id="${deviceId}"]`);
  const titleEl = document.getElementById(`state-title-${deviceId}`);
  const timeEl = document.getElementById(`state-time-${deviceId}`);

  if (active) {
    card && card.classList.add('active');
    state.devices[deviceId].stateText = (deviceId === 'light_living') ? 'Đang bật' : 'Đã mở';
  } else {
    card && card.classList.remove('active');
    state.devices[deviceId].stateText = (deviceId === 'light_living') ? 'Đã tắt' : 'Đã đóng';
  }

  if (titleEl) titleEl.textContent = state.devices[deviceId].stateText;
  if (timeEl) timeEl.textContent = 'Vừa xong';
}

export function triggerDoorWarning(warningActive) {
  if (!state.connection.activeIp) return;
  const card = document.querySelector(`.device-card[data-device-id="door_hallway"]`);
  const badge = card.querySelector('.device-status-badge');
  const titleEl = document.getElementById('state-title-door_hallway');

  if (warningActive) {
    state.devices.door_hallway.status = 'warning';
    badge.textContent = 'Cảnh báo';
    badge.className = 'device-status-badge alert';
    titleEl.textContent = 'Cửa mở quá lâu!';
    titleEl.style.color = 'var(--alert-red)';
    logSerial(`[Hệ thống] CẢNH BÁO: Phát hiện cửa hành lang mở quá lâu không đóng!`, true);
  } else {
    state.devices.door_hallway.status = 'online';
    badge.textContent = 'Online';
    badge.className = 'device-status-badge';
    titleEl.textContent = state.devices.door_hallway.active ? 'Đã mở' : 'Đã đóng';
    titleEl.style.color = '';
  }
}

export function filterDevices(filter) {
  const cards = el.devicesGrid.querySelectorAll('.device-card');
  cards.forEach(card => {
    const deviceId = card.getAttribute('data-device-id');
    if (!deviceId) return;
    const device = state.devices[deviceId];
    if (!device) return;

    if (filter === 'all') {
      card.style.display = 'flex';
    } else if (filter === 'online') {
      card.style.display = (device.status === 'online') ? 'flex' : 'none';
    } else if (filter === 'warning') {
      card.style.display = (device.status === 'warning') ? 'flex' : 'none';
    }
  });
}

export function updateDeviceOnlineCount() {
  const devices = Object.values(state.devices);
  const total = devices.length;
  const online = devices.filter(d => d.status === 'online' || d.status === 'warning').length;

  if (el.valOnline) el.valOnline.textContent = online;
  const valTotal = document.getElementById('val-total');
  if (valTotal) valTotal.textContent = `/${total}`;
  if (el.onlineCount) el.onlineCount.textContent = `${online}/${total} thiết bị online`;
}
