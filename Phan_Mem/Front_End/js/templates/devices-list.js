// js/templates/devices-list.js
export const devicesListTemplate = `
  <div class="devices-grid">
    <!-- Device: Camera Live Stream (Moved here) -->
    <div class="device-card" data-device-id="camera_living" data-status="online">
      <div class="device-info-row">
        <div class="device-icon-wrapper" style="background-color: var(--brand-green-bg); color: var(--brand-green);">
          <i class="fa-solid fa-video"></i>
        </div>
        <div class="device-details">
          <span class="device-name">Camera giám sát</span>
          <span class="device-room">Phòng khách</span>
        </div>
      </div>
      <span class="device-status-badge">Online</span>
      
      <div class="device-control-row">
        <div class="device-state-desc">
          <span class="state-title">Đang truyền</span>
          <span class="state-time">Thời gian thực (720p)</span>
        </div>
        <button class="btn-action-card" id="btnOpenStream">
          <i class="fa-solid fa-play"></i> Xem Live
        </button>
      </div>
    </div>

    <!-- Device: ESP32 Central Controller Node -->
    <div class="device-card" data-device-id="esp32_node" data-status="online">
      <div class="device-info-row">
        <div class="device-icon-wrapper" style="background-color: var(--active-blue-bg); color: var(--active-blue);">
          <i class="fa-solid fa-microchip"></i>
        </div>
        <div class="device-details">
          <span class="device-name">ESP32 Gateway Node</span>
          <span class="device-room">Phòng kỹ thuật</span>
        </div>
      </div>
      <span class="device-status-badge">Online</span>
      
      <div class="device-control-row">
        <div class="device-state-desc">
          <span class="state-title" id="state-title-esp32">Băng tần 2.4GHz</span>
          <span class="state-time">IP: 192.168.1.100</span>
        </div>
        <button class="btn-action-card" onclick="alert('Đang gửi lệnh Ping tới ESP32...')" style="font-weight: 500;">
          <i class="fa-solid fa-wifi"></i> Ping Node
        </button>
      </div>
    </div>

    <!-- Device: Ambient Sensor -->
    <div class="device-card" data-device-id="dht11_node" data-status="online">
      <div class="device-info-row">
        <div class="device-icon-wrapper" style="background-color: var(--orange-accent-bg); color: var(--orange-accent);">
          <i class="fa-solid fa-wind"></i>
        </div>
        <div class="device-details">
          <span class="device-name">Cảm biến DHT11</span>
          <span class="device-room">Phòng khách</span>
        </div>
      </div>
      <span class="device-status-badge">Online</span>
      
      <div class="device-control-row">
        <div class="device-state-desc">
          <span class="state-title">Nhiệt độ & Độ ẩm</span>
          <span class="state-time">Thời gian thực</span>
        </div>
        <button class="btn-action-card" onclick="alert('Dữ liệu DHT11 đang được cập nhật tự động lên đồ thị.')" style="font-weight: 500;">
          <i class="fa-solid fa-clock-rotate-left"></i> Lịch sử
        </button>
      </div>
    </div>
  </div>
`;
