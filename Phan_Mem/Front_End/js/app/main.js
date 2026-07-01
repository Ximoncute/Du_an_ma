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

  // Kiểm tra ping kết nối tới Back-End và lặp lại mỗi 5 giây
  checkBackendStatus();
  setInterval(checkBackendStatus, 5000);
});

let isAppInitialized = false;

function checkBackendStatus() {
  const API_BASE = 'http://127.0.0.1:5000';
  // Thêm query timestamp và cache: 'no-store' để trình duyệt không lấy dữ liệu cũ từ cache
  fetch(`${API_BASE}/?_=${Date.now()}`, { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('Response error');
      return res.json();
    })
    .then(data => {
      // Xác minh phản hồi đúng định dạng của Back-End API
      if (data && data.status === 'Running') {
        removeBackendOfflineOverlay();
        
        if (!isAppInitialized) {
          isAppInitialized = true;
          // Khởi tạo toàn bộ tính năng Dashboard
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
        }
      } else {
        throw new Error('Invalid server status');
      }
    })
    .catch(err => {
      const errMsg = err && err.message ? err.message : err;
      console.warn('[Hệ thống] Mất kết nối tới máy chủ Back-End:', errMsg);
      showBackendOfflineOverlay();
    });
}

function removeBackendOfflineOverlay() {
  const overlay = document.getElementById('backend-offline-overlay');
  if (overlay) {
    overlay.remove();
  }
}

function showBackendOfflineOverlay() {
  if (document.getElementById('backend-offline-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'backend-offline-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.97)';
  overlay.style.backdropFilter = 'blur(16px)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = '#f8fafc';
  overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  
  overlay.innerHTML = `
    <div style="text-align: center; max-width: 480px; padding: 40px; border-radius: 24px; background: rgba(30, 41, 59, 0.7); border: 2px solid rgba(239, 68, 68, 0.25); box-shadow: 0 0 35px rgba(239, 68, 68, 0.15), 0 20px 50px rgba(0, 0, 0, 0.6); position: relative; overflow: hidden;">
      <!-- Glowing Red Border Effect -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 5px; background: linear-gradient(90deg, #ef4444, #b91c1c);"></div>
      
      <div style="font-size: 72px; margin-bottom: 24px; color: #ef4444; animation: pulse 1.8s infinite;">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      
      <h2 style="font-size: 23px; font-weight: 750; margin-bottom: 14px; letter-spacing: -0.5px; color: #fca5a5; text-transform: uppercase;">
        Mất Kết Nối Hệ Thống
      </h2>
      
      <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.6; margin-bottom: 30px; font-weight: 400;">
        Không thể thiết lập kết nối an toàn với máy chủ dịch vụ trung tâm. Ứng dụng đã tự động khóa để bảo vệ dữ liệu điều khiển và an toàn của hệ sinh thái SmartHome.
      </p>
      
      <div style="background: rgba(239, 68, 68, 0.07); border: 1px solid rgba(239, 68, 68, 0.18); padding: 12px 18px; border-radius: 12px; font-size: 13px; color: #fca5a5; margin-bottom: 28px; text-align: center; font-weight: 500; font-family: monospace;">
        <i class="fa-solid fa-triangle-exclamation" style="margin-right: 6px;"></i> ERROR_CODE: SEC_CONNECTION_REFUSED
      </div>
      
      <button id="btnRetryBackend" style="background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; border: none; padding: 13px 28px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);">
        <i class="fa-solid fa-rotate-right" style="margin-right: 8px;"></i> Thử kết nối lại
      </button>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3)); }
        50% { transform: scale(1.04); filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.6)); }
        100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3)); }
      }
      #btnRetryBackend:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
      }
      #btnRetryBackend:active {
        transform: translateY(0);
      }
    </style>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btnRetryBackend').addEventListener('click', () => {
    checkBackendStatus();
  });
}

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
