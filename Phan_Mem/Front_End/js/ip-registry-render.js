// js/ip-registry-render.js
import { state } from './state.js';
import { el } from './dom.js';
import { switchActiveNodeIp } from './ip-connection.js';

export function renderRegisteredNodes() {
  if (!el.registeredNodeList) return;
  el.registeredNodeList.innerHTML = '';

  state.connection.registeredIps.forEach(ip => {
    const isActive = (ip === state.connection.activeIp);
    const li = document.createElement('li');
    li.className = `node-item${isActive ? ' active' : ''}`;
    li.setAttribute('data-ip', ip);

    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'node-item-info';

    const icon = document.createElement('div');
    icon.className = 'node-item-icon';
    icon.innerHTML = isActive ? '<i class="fa-solid fa-link"></i>' : '<i class="fa-solid fa-microchip"></i>';

    const details = document.createElement('div');
    const ipText = document.createElement('div');
    ipText.className = 'node-ip-text';
    ipText.textContent = ip;

    const statusText = document.createElement('div');
    statusText.className = 'node-status-desc';
    statusText.textContent = isActive ? 'Đang hoạt động (Connected)' : 'Ngoại tuyến (Nhấp để kết nối)';

    details.appendChild(ipText);
    details.appendChild(statusText);
    infoWrapper.appendChild(icon);
    infoWrapper.appendChild(details);

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'node-item-actions';

    if (!isActive) {
      const connectBtn = document.createElement('button');
      connectBtn.className = 'btn-connect-node';
      connectBtn.textContent = 'Kết nối';
      connectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchActiveNodeIp(ip);
      });
      actionsWrapper.appendChild(connectBtn);

      if (ip !== '192.168.1.100') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-node';
        deleteBtn.title = 'Xóa địa chỉ IP này';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Bạn có chắc chắn muốn xóa địa chỉ IP ${ip} khỏi danh sách?`)) {
            state.connection.registeredIps = state.connection.registeredIps.filter(item => item !== ip);
            localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
            renderRegisteredNodes();
          }
        });
        actionsWrapper.appendChild(deleteBtn);
      }
    }

    li.appendChild(infoWrapper);
    li.appendChild(actionsWrapper);
    li.addEventListener('click', () => {
      if (!isActive) switchActiveNodeIp(ip);
    });

    el.registeredNodeList.appendChild(li);
  });
}
