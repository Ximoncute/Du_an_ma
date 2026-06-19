// js/templates/dashboard-charts.js
export const dashboardChartsTemplate = `
  <div class="charts-grid">
    <!-- Temp Chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-title-box">
          <div class="chart-icon-dot green"></div>
          <span class="chart-title">Nhiệt độ</span>
        </div>
        <span class="chart-current-val" id="chart-val-temp">28.5 °C</span>
      </div>
      <div class="chart-body">
        <canvas id="tempChart"></canvas>
      </div>
    </div>

    <!-- Humidity Chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-title-box">
          <div class="chart-icon-dot blue"></div>
          <span class="chart-title">Độ ẩm</span>
        </div>
        <span class="chart-current-val" id="chart-val-humidity">72 %</span>
      </div>
      <div class="chart-body">
        <canvas id="humidChart"></canvas>
      </div>
    </div>

    <!-- Light Chart -->
    <div class="chart-card">
      <div class="chart-card-header">
        <div class="chart-title-box">
          <div class="chart-icon-dot orange"></div>
          <span class="chart-title">Ánh sáng</span>
        </div>
        <span class="chart-current-val" id="chart-val-light">450 lux</span>
      </div>
      <div class="chart-body">
        <canvas id="lightChart"></canvas>
      </div>
    </div>
  </div>
`;
