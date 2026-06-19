// js/templates/dashboard-metrics.js
export const dashboardMetricsTemplate = `
  <div class="metrics-grid">
    <!-- Card 1: Devices Online -->
    <div class="metric-card" id="card-devices">
      <div class="metric-card-header">
        <div class="metric-icon-box green">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <span class="metric-title">Thiết bị online</span>
      </div>
      <div class="metric-value-container">
        <span class="metric-value" id="val-online">2</span>
        <span class="metric-unit" id="val-total">/2</span>
      </div>
      <span class="metric-footer">Kết nối ổn định</span>
    </div>

    <!-- Card 2: Temperature -->
    <div class="metric-card" id="card-temperature">
      <div class="metric-card-header">
        <div class="metric-icon-box orange">
          <i class="fa-solid fa-temperature-half"></i>
        </div>
        <span class="metric-title">Nhiệt độ TB</span>
      </div>
      <div class="metric-value-container">
        <span class="metric-value" id="val-temp">28.5</span>
        <span class="metric-unit">°C</span>
      </div>
      <span class="metric-footer">Phòng khách</span>
    </div>

    <!-- Card 3: Humidity -->
    <div class="metric-card" id="card-humidity">
      <div class="metric-card-header">
        <div class="metric-icon-box blue">
          <i class="fa-solid fa-droplet"></i>
        </div>
        <span class="metric-title">Độ ẩm</span>
      </div>
      <div class="metric-value-container">
        <span class="metric-value" id="val-humidity">72</span>
        <span class="metric-unit">%</span>
      </div>
      <span class="metric-footer">Phòng khách</span>
    </div>

    <!-- Card 4: Light -->
    <div class="metric-card" id="card-light">
      <div class="metric-card-header">
        <div class="metric-icon-box yellow">
          <i class="fa-solid fa-sun"></i>
        </div>
        <span class="metric-title">Ánh sáng</span>
      </div>
      <div class="metric-value-container">
        <span class="metric-value" id="val-light">450</span>
        <span class="metric-unit">lux</span>
      </div>
      <span class="metric-footer">Độ sáng hiện tại</span>
    </div>
  </div>
`;
