// js/ip-registry-init.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { renderRegisteredNodes } from './ip-registry-render.js';

export function initIpRegistryManager() {
  renderRegisteredNodes();

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

      state.connection.registeredIps.push(ip);
      localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
      el.newNodeIpInput.value = '';
      el.addNodeFormContainer.classList.remove('active');
      renderRegisteredNodes();
      logSerial(`[Hệ thống] Đăng ký thành công IP Node mới: ${ip}`, false, true);
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
