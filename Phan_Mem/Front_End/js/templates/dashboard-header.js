// js/templates/dashboard-header.js
export const dashboardHeaderTemplate = `
  <header class="dashboard-header">
    <div class="header-info">
      <h1 id="dashboardTitle">Dashboard</h1>
      <p>Tổng quan hệ thống nhà thông minh của bạn</p>
    </div>
    
    <div class="header-status">
      <div class="pill-status online">
        <div class="status-dot pulse"></div>
        <span id="headerOnlineCount">2/2 thiết bị online</span>
      </div>
      <div class="header-date" id="currentDateDisplay">Thứ Năm, 18 tháng 6, 2026</div>
    </div>
  </header>
`;
