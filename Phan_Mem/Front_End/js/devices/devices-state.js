// js/devices/devices-state.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';

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
  if (valTotal) valTotal.textContent = `/ ${total}`;
  if (el.onlineCount) el.onlineCount.textContent = `${online}/${total} thiết bị online`;

  const pill = el.onlineCount ? el.onlineCount.parentElement : null;
  if (pill) {
    if (online > 0) {
      pill.className = 'pill-status online';
    } else {
      pill.className = 'pill-status offline';
    }
  }

  // Update card devices footer, icon-box, and icon dynamically
  const cardDevicesFooter = document.querySelector('#card-devices .metric-footer');
  if (cardDevicesFooter) {
    cardDevicesFooter.textContent = online > 0 ? 'Kết nối ổn định' : 'Mất kết nối';
  }

  const cardDevicesIconBox = document.querySelector('#card-devices .metric-icon-box');
  if (cardDevicesIconBox) {
    const icon = cardDevicesIconBox.querySelector('i');
    if (online > 0) {
      cardDevicesIconBox.className = 'metric-icon-box green';
      if (icon) icon.className = 'fa-solid fa-circle-check';
    } else {
      cardDevicesIconBox.className = 'metric-icon-box red';
      if (icon) icon.className = 'fa-solid fa-circle-xmark';
    }
  }
}

export function updateAllDevicesOnlineStatus(isOnline) {
  // Update state.devices statuses
  state.devices.light_living.status = isOnline ? 'online' : 'offline';
  
  // If not online, remove active class and reset toggles
  if (!isOnline) {
    state.devices.light_living.active = false;
    state.devices.light_living.stateText = 'Đã tắt';
    if (el.toggleLightLiving) el.toggleLightLiving.checked = false;
    const lightTitle = document.getElementById('state-title-light_living');
    if (lightTitle) lightTitle.textContent = 'Đã tắt';
  }

  // Handle door hallway warning state
  const doorCard = document.querySelector(`.device-card[data-device-id="door_hallway"]`);
  const doorBadge = doorCard ? doorCard.querySelector('.device-status-badge') : null;
  const isDoorWarning = doorBadge && doorBadge.classList.contains('alert');
  
  state.devices.door_hallway.status = isOnline ? (isDoorWarning ? 'warning' : 'online') : 'offline';
  if (!isOnline) {
    state.devices.door_hallway.active = false;
    state.devices.door_hallway.stateText = 'Đã đóng';
    if (el.toggleDoorHallway) el.toggleDoorHallway.checked = false;
    const doorTitle = document.getElementById('state-title-door_hallway');
    if (doorTitle) {
      doorTitle.textContent = 'Đã đóng';
      doorTitle.style.color = '';
    }
  }

  // Update badges for dashboard devices
  const lightCard = document.querySelector(`.device-card[data-device-id="light_living"]`);
  if (lightCard) {
    const badge = lightCard.querySelector('.device-status-badge');
    if (badge) {
      badge.textContent = isOnline ? 'Online' : 'Offline';
      badge.className = isOnline ? 'device-status-badge' : 'device-status-badge offline';
    }
    if (!isOnline) lightCard.classList.remove('active');
  }

  if (doorCard) {
    const badge = doorCard.querySelector('.device-status-badge');
    if (badge) {
      if (isOnline) {
        if (isDoorWarning) {
          badge.textContent = 'Cảnh báo';
          badge.className = 'device-status-badge alert';
        } else {
          badge.textContent = 'Online';
          badge.className = 'device-status-badge';
        }
      } else {
        badge.textContent = 'Offline';
        badge.className = 'device-status-badge offline';
      }
    }
    if (!isOnline) doorCard.classList.remove('active');
  }

  // Update badges for Devices list tab (which are statically built at start)
  const espCard = document.querySelector(`.device-card[data-device-id="esp32_node"]`);
  if (espCard) {
    const badge = espCard.querySelector('.device-status-badge');
    if (badge) {
      badge.textContent = isOnline ? 'Online' : 'Offline';
      badge.className = isOnline ? 'device-status-badge' : 'device-status-badge offline';
    }
  }

  const dhtCard = document.querySelector(`.device-card[data-device-id="dht11_node"]`);
  if (dhtCard) {
    const badge = dhtCard.querySelector('.device-status-badge');
    if (badge) {
      badge.textContent = isOnline ? 'Online' : 'Offline';
      badge.className = isOnline ? 'device-status-badge' : 'device-status-badge offline';
    }
  }

  // Finally update online device counter
  updateDeviceOnlineCount();
}
