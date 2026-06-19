// js/templates/dashboard-devices.js
export const dashboardDevicesTemplate = `
  <div class="devices-section-header">
    <span class="devices-section-title">Thiết bị điều khiển</span>
    <ul class="filter-tabs" id="deviceFilters">
      <li class="filter-tab active" data-filter="all">Tất cả</li>
      <li class="filter-tab" data-filter="online">Online</li>
      <li class="filter-tab" data-filter="warning">Cảnh báo</li>
    </ul>
  </div>

  <div class="devices-grid" id="devicesGrid">
    <!-- Device 1: Smart Light -->
    <div class="device-card active" data-device-id="light_living" data-status="online">
      <div class="device-info-row">
        <div class="device-icon-wrapper">
          <i class="fa-solid fa-lightbulb"></i>
        </div>
        <div class="device-details">
          <span class="device-name">Đèn thông minh</span>
          <span class="device-room">Phòng khách</span>
        </div>
      </div>
      <span class="device-status-badge">Online</span>
      
      <div class="device-control-row">
        <div class="device-state-desc">
          <span class="state-title" id="state-title-light_living">Đang bật</span>
          <span class="state-time" id="state-time-light_living">10 giây trước</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggle-light_living" checked>
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- Device 2: Smart Door -->
    <div class="device-card" data-device-id="door_hallway" data-status="online">
      <div class="device-info-row">
        <div class="device-icon-wrapper">
          <i class="fa-solid fa-door-closed"></i>
        </div>
        <div class="device-details">
          <span class="device-name">Cửa thông minh</span>
          <span class="device-room">Hành lang</span>
        </div>
      </div>
      <span class="device-status-badge">Online</span>
      
      <div class="device-control-row">
        <div class="device-state-desc">
          <span class="state-title" id="state-title-door_hallway">Đã đóng</span>
          <span class="state-time" id="state-time-door_hallway">30 phút trước</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="toggle-door_hallway">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </div>
`;
