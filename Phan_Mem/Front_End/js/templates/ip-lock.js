// js/templates/ip-lock.js
export const ipLockTemplate = `
  <div class="ip-lock-overlay" id="ipLockOverlay">
    <div class="ip-lock-card">
      <div class="ip-lock-logo" id="ipLockLogo">
        <i class="fa-solid fa-microchip"></i>
      </div>
      
      <div class="ip-lock-info" id="ipLockInfoBlock">
        <h2>Kết nối thiết bị ESP32</h2>
        <p>Hệ thống đang ở trạng thái khóa. Vui lòng nhập địa chỉ IP của thiết bị ESP32 để kết nối và tải toàn bộ dữ liệu.</p>
      </div>

      <div class="ip-lock-form" id="ipLockFormBlock">
        <div class="ip-lock-input-group">
          <label class="ip-lock-label" for="ipLockInput">ĐỊA CHỈ IP ESP32</label>
          <input type="text" class="ip-lock-input" id="ipLockInput" value="" placeholder="ví dụ: 192.168.1.68">
        </div>
        <button class="btn-ip-connect" id="btnIpConnect">
          <i class="fa-solid fa-link"></i>
          Kết nối thiết bị
        </button>
        <div class="ip-lock-error" id="ipLockError">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>Địa chỉ IP không hợp lệ hoặc thiết bị offline!</span>
        </div>
      </div>

      <div class="spinner-container" id="ipLockSpinnerContainer">
        <div class="connect-spinner"></div>
        <span class="connect-spinnerText" id="ipLockSpinnerText">Đang kết nối tới thiết bị...</span>
      </div>
    </div>
  </div>
`;
