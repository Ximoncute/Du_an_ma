// js/templates/dashboard-controls.js
export const dashboardControlsTemplate = `
  <div class="quick-controls-card">
    <div class="controls-header">
      <i class="fa-solid fa-bolt"></i>
      <span class="controls-title">Điều khiển nhanh</span>
    </div>
    <div class="controls-btn-row">
      <button class="btn-control active-all" id="btnQuickAllOn">
        <i class="fa-solid fa-sun"></i>
        Bật tất cả đèn
      </button>
      <button class="btn-control" id="btnQuickAllOff">
        <i class="fa-solid fa-moon"></i>
        Tắt tất cả đèn
      </button>
      <button class="btn-control" id="btnQuickAway">
        <i class="fa-solid fa-house-laptop"></i>
        Chế độ vắng nhà
      </button>
      <button class="btn-control" id="btnQuickNight">
        <i class="fa-solid fa-bed"></i>
        Ban đêm (23h-5h)
      </button>
      <button class="btn-control refresh-btn" id="btnQuickRefresh">
        <i class="fa-solid fa-arrows-rotate"></i>
        <span>Làm mới dữ liệu</span>
      </button>
    </div>
  </div>
`;
