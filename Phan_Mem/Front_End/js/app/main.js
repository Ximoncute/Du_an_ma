// js/main.js
import { state } from '../core/state.js';
import { initDomSelectors, el } from '../core/dom.js';
import { injectTemplates } from '../templates/templates.js';
import { updateDateTime } from '../core/utils.js';
import { initAuthentication } from '../auth/auth-init.js';
import { initSettingsManager } from '../features/settings.js';
import { initProfileManager } from '../features/profile.js';
import { initSupportChat } from '../features/support.js';
import { initDeviceControls } from '../devices/devices-init.js';
import { updateDeviceOnlineCount, updateAllDevicesOnlineStatus } from '../devices/devices-state.js';
import { initSerialMonitor } from '../features/serial.js';
import { initCameraStream } from '../camera/camera-ui.js';
import { initIpConnectionLock } from '../connection/ip-connection.js';
import { initIpRegistryManager } from '../connection/ip-registry-init.js';
import { startSensorFluctuations } from '../charts/sensors.js';

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
  updateAllDevicesOnlineStatus(false);

  const savedIp = localStorage.getItem('activeIp');
  if (savedIp && el.ipLockInput) {
    el.ipLockInput.value = savedIp;
    if (state.auth.currentUser) {
      import('../connection/ip-connection.js').then(({ switchActiveNodeIp }) => {
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

      import('../charts/charts-state.js').then(({ useFallbackCharts }) => {
        if (tabId === 'dashboard' && useFallbackCharts.val && state.connection.activeIp) {
          import('../charts/charts-fallback.js').then(m => setTimeout(m.drawFallbackCharts, 50));
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

    import('../charts/charts-state.js').then(({ useFallbackCharts }) => {
      if (useFallbackCharts.val && state.connection.activeIp) {
        import('../charts/charts-fallback.js').then(m => setTimeout(m.drawFallbackCharts, 150));
      }
    });
  });
}
