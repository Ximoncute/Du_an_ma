// js/connection/ip-registry-init.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { renderRegisteredNodes } from './ip-registry-render.js';

const API_BASE = 'http://127.0.0.1:5000/api';

export function initIpRegistryManager() {
  // Đồng bộ danh sách IP thiết bị từ Back-End
  fetch(`${API_BASE}/devices`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        state.connection.registeredIps = data.data.map(d => d.ip);
        localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
      }
      renderRegisteredNodes();
    })
    .catch(err => {
      console.warn('[Cảnh báo] Không thể tải danh sách IP từ Backend, sử dụng cache LocalStorage.', err);
      renderRegisteredNodes();
    });

  if (el.btnAddNode) {
    el.btnAddNode.addEventListener('click', () => {
      el.addNodeFormContainer.classList.toggle('active');
      if (el.addNodeFormContainer.classList.contains('active')) {
        el.newNodeIpInput.focus();
      }
    });
  }

  if (el.btnSubmitNewNode) {
    el.btnSubmitNewNode.addEventListener('click', () => {
      const ip = el.newNodeIpInput.value.trim();
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

      if (!ipPattern.test(ip)) {
        alert('Địa chỉ IP không hợp lệ! Vui lòng nhập đúng định dạng IPv4 (ví dụ: 192.168.1.105)');
        return;
      }
      if (state.connection.registeredIps.includes(ip)) {
        alert('Địa chỉ IP này đã có trong danh sách!');
        return;
      }

      // Lưu IP mới lên Back-End MongoDB
      fetch(`${API_BASE}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, name: `Thiết bị ESP32 (${ip})` })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          state.connection.registeredIps.push(ip);
          localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
          el.newNodeIpInput.value = '';
          el.addNodeFormContainer.classList.remove('active');
          renderRegisteredNodes();
          logSerial(`[Hệ thống] Đăng ký thành công IP Node mới lên MongoDB: ${ip}`, false, true);
        } else {
          alert(data.message || 'Không thể đăng ký IP lên Back-End');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Lỗi: Không kết nối được tới server Back-End!');
      });
    });
  }

  if (el.newNodeIpInput) {
    el.newNodeIpInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') el.btnSubmitNewNode.click();
    });
  }

  if (el.btnCancelAddNode) {
    el.btnCancelAddNode.addEventListener('click', () => {
      el.newNodeIpInput.value = '';
      el.addNodeFormContainer.classList.remove('active');
    });
  }
}
