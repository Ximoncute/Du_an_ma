// js/templates/dashboard-serial.js
export const dashboardSerialTemplate = `
  <div class="serial-monitor-card">
    <div class="serial-header">
      <div class="serial-title-box">
        <i class="fa-solid fa-terminal"></i>
        <span class="serial-title-text">Serial Monitor — Lệnh từ thiết bị</span>
        <span class="serial-subtitle" id="serialSubtext">Chưa kết nối — nhấn nút để bắt đầu</span>
      </div>
      <button class="btn-serial-connect" id="btnSerialConnect">
        <div class="connect-dot"></div>
        <span>Kết nối</span>
      </button>
    </div>

    <div class="serial-terminal" id="serialTerminal">
      <div class="terminal-line">
        <span class="terminal-time">[--:--:--]</span>
        <span class="terminal-msg">Đang chờ dữ liệu từ thiết bị...</span>
        <span class="terminal-cursor" id="terminalCursor"></span>
      </div>
    </div>

    <div class="serial-input-row">
      <input type="text" class="serial-input" id="serialInput" placeholder="Nhập nội dung muốn hiển thị lên thiết bị..." disabled>
      <button class="btn-serial-send" id="btnSerialSend" disabled>
        <i class="fa-solid fa-paper-plane"></i>
        Gửi lên thiết bị
      </button>
    </div>
    <div class="serial-warning">
      <i class="fa-solid fa-circle-exclamation"></i>
      Cảnh báo: Nội dung bạn nhập sẽ hiển thị trực tiếp lên màn hình của thiết bị IoT!
    </div>
  </div>
`;
