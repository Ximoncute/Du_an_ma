// js/templates/sidebar.js
export const sidebarTemplate = `
  <aside class="sidebar" id="appSidebar">
    <div class="sidebar-top">
      <div class="sidebar-header">
        <div class="logo-icon">
          <i class="fa-solid fa-microchip"></i>
        </div>
        <div class="logo-info">
          <span class="logo-title">SmartHome</span>
          <span class="logo-subtitle">IoT Dashboard</span>
        </div>
      </div>
      
      <ul class="sidebar-menu">
        <li class="menu-item active" data-tab="dashboard">
          <a href="#dashboard">
            <i class="fa-solid fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="menu-item" data-tab="devices">
          <a href="#devices">
            <i class="fa-solid fa-toggle-on"></i>
            <span>Thiết bị</span>
          </a>
        </li>
        <li class="menu-item" data-tab="settings">
          <a href="#settings">
            <i class="fa-solid fa-sliders"></i>
            <span>Cài đặt</span>
          </a>
        </li>
        <li class="menu-item" data-tab="profile">
          <a href="#profile">
            <i class="fa-solid fa-user-gear"></i>
            <span>Thông tin cá nhân</span>
          </a>
        </li>
        <li class="menu-item" data-tab="support">
          <a href="#support">
            <i class="fa-solid fa-headset"></i>
            <span>Tư vấn hỗ trợ</span>
          </a>
        </li>
      </ul>
    </div>
    
    <div class="sidebar-footer">
      <div class="connection-status" id="connectionStatusBlock" style="flex-wrap: wrap; gap: 8px; cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
          <div class="status-dot pulse" id="connectionDot"></div>
          <div class="status-info">
            <span class="status-text" id="connectionText">Đã kết nối</span>
            <span class="status-ip" id="connectionIp">192.168.1.100</span>
          </div>
        </div>
        <div style="width: 100%; display: flex; justify-content: flex-end; margin-top: 4px;">
          <button id="btnMqttToggle" class="btn-mqtt-status disconnected" title="Nhấp để kết nối MQTT">
            MQTT: OFF
          </button>
        </div>
      </div>
      
      <div class="sidebar-footer-row">
        <button class="btn-logout" id="btnLogout" title="Đăng xuất tài khoản">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Đăng xuất</span>
        </button>

        <button class="sidebar-collapse-btn" id="collapseSidebarBtn" title="Thu gọn menu">
          <i class="fa-solid fa-angle-left"></i>
        </button>
      </div>
    </div>
  </aside>
`;
