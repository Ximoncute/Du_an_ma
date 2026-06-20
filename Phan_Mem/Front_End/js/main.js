// js/main.js
import { state } from './state.js';
import { initDomSelectors, el } from './dom.js';
import { injectTemplates } from './templates.js';
import { updateDateTime } from './utils.js';
import { initAuthentication } from './auth-init.js';
import { initSettingsManager } from './settings.js';
import { initProfileManager } from './profile.js';
import { initSupportChat } from './support.js';
import { initDeviceControls } from './devices-init.js';
import { updateDeviceOnlineCount } from './devices-state.js';
import { initSerialMonitor } from './serial.js';
import { initCameraStream } from './camera-ui.js';
import { initIpConnectionLock } from './ip-connection.js';
import { initIpRegistryManager } from './ip-registry-init.js';
import { startSensorFluctuations } from './sensors.js';

document.addEventListener('DOMContentLoaded', () => {
  injectTemplates();
  initDomSelectors();

  updateDateTime();
  setInterval(updateDateTime, 1000);

  initAuthentication();
  initSettingsManager();
  initProfileManager();
  initSupportChat();
  initTabNavigation();
  initSidebarCollapse();
  initDeviceControls();
  initSerialMonitor();
  initCameraStream();
  initIpConnectionLock();
  initIpRegistryManager();
  startSensorFluctuations();
  updateDeviceOnlineCount();

  const savedIp = localStorage.getItem('activeIp');
  if (savedIp && el.ipLockInput) {
    el.ipLockInput.value = savedIp;
    if (state.auth.currentUser) {
      import('./ip-connection.js').then(({ switchActiveNodeIp }) => {
        switchActiveNodeIp(savedIp);
      });
    }
  }
});

function initTabNavigation() {
  el.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      el.menuItems.forEach(mi => mi.classList.remove('active'));
      item.classList.add('active');
      el.tabContents.forEach(tc => tc.classList.remove('active'));
      const activeTab = document.getElementById(`tab-${tabId}`);
      if (activeTab) activeTab.classList.add('active');
      window.location.hash = tabId;

      import('./charts-state.js').then(({ useFallbackCharts }) => {
        if (tabId === 'dashboard' && useFallbackCharts.val && state.connection.activeIp) {
          import('./charts-fallback.js').then(m => setTimeout(m.drawFallbackCharts, 50));
        }
      });
    });
  });

  const hash = window.location.hash.substring(1);
  if (hash) {
    const activeMenuItem = document.querySelector(`.sidebar-menu .menu-item[data-tab="${hash}"]`);
    if (activeMenuItem) activeMenuItem.click();
  }
}

function initSidebarCollapse() {
  if (!el.collapseBtn || !el.sidebar || !el.mainWorkspace) return;
  el.collapseBtn.addEventListener('click', () => {
    el.sidebar.classList.toggle('collapsed');
    const isCollapsed = el.sidebar.classList.contains('collapsed');

    if (isCollapsed) {
      el.sidebar.style.width = '80px';
      el.mainWorkspace.style.marginLeft = '80px';
      el.mainWorkspace.style.width = 'calc(100% - 80px)';
      el.collapseBtn.querySelector('i').className = 'fa-solid fa-angle-right';
      document.querySelectorAll('.logo-info, .status-info, .sidebar-menu span').forEach(node => {
        node.style.display = 'none';
      });
    } else {
      el.sidebar.style.width = 'var(--sidebar-width)';
      el.mainWorkspace.style.marginLeft = 'var(--sidebar-width)';
      el.mainWorkspace.style.width = 'calc(100% - var(--sidebar-width))';
      el.collapseBtn.querySelector('i').className = 'fa-solid fa-angle-left';
      setTimeout(() => {
        if (!el.sidebar.classList.contains('collapsed')) {
          document.querySelectorAll('.logo-info, .status-info, .sidebar-menu span').forEach(node => {
            node.style.display = node.tagName === 'SPAN' ? 'inline' : 'flex';
          });
        }
      }, 100);
    }

    import('./charts-state.js').then(({ useFallbackCharts }) => {
      if (useFallbackCharts.val && state.connection.activeIp) {
        import('./charts-fallback.js').then(m => setTimeout(m.drawFallbackCharts, 150));
      }
    });
  });
}
