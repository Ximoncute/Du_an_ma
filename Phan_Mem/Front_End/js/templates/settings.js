// js/templates/settings.js
export const settingsTemplate = `
  <header class="dashboard-header">
    <div class="header-info">
      <h1>Cài đặt hệ thống</h1>
      <p>Cấu hình thông số mạng, ngưỡng cảnh báo và tài khoản của bạn</p>
    </div>
  </header>
  
  <div class="settings-content-wrapper">
    <div class="settings-group">
      <span class="settings-label">Địa chỉ IP của Gateway IoT</span>
      <span class="settings-description">Cấu hình IP kết nối trực tiếp với ESP32/Arduino.</span>
      <div class="settings-input-group">
        <input type="text" class="serial-input" id="settingsGatewayIp" value="192.168.1.100" style="max-width: 300px;">
        <button class="btn-control refresh-btn" id="btnSaveGatewayIp" style="margin-left: 0; padding: 10px 20px;">Lưu địa chỉ</button>
      </div>
    </div>

    <div class="settings-group">
      <span class="settings-label">Ngưỡng cảnh báo nhiệt độ</span>
      <span class="settings-description">Hệ thống sẽ gửi cảnh báo nếu nhiệt độ vượt quá ngưỡng này.</span>
      <div class="settings-input-group">
        <input type="number" class="serial-input" id="settingsTempThreshold" value="38" style="max-width: 120px;">
        <span style="align-self: center; font-weight: 500;">°C</span>
      </div>
    </div>

    <div class="settings-group">
      <span class="settings-label">Ngưỡng cảnh báo ánh sáng</span>
      <span class="settings-description">Hệ thống sẽ gửi cảnh báo nếu cường độ ánh sáng vượt quá ngưỡng này.</span>
      <div class="settings-input-group">
        <input type="number" class="serial-input" id="settingsLightThreshold" value="800" style="max-width: 120px;">
        <span style="align-self: center; font-weight: 500;">lux</span>
      </div>
    </div>

    <div class="settings-group">
      <span class="settings-label">Chế độ hiển thị Camera</span>
      <span class="settings-description">Lựa chọn chất lượng hiển thị và nguồn truyền trực tiếp của camera.</span>
      <div class="settings-input-group">
        <select class="serial-input" id="settingsCameraMode" style="max-width: 300px; padding-right: 24px;">
          <option value="dynamic">Vẽ giả lập thời gian thực (Mượt mà)</option>
          <option value="mjpeg">Luồng HTTP MJPEG (ESP32-CAM)</option>
          <option value="hls">Luồng RTSP/HLS (IP Camera)</option>
        </select>
      </div>
    </div>
  </div>
`;
