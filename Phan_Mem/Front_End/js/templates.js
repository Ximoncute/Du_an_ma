// js/templates.js
import { authTemplate } from './templates/auth.js';
import { ipLockTemplate } from './templates/ip-lock.js';
import { sidebarTemplate } from './templates/sidebar.js';
import { dashboardHeaderTemplate } from './templates/dashboard-header.js';
import { dashboardMetricsTemplate } from './templates/dashboard-metrics.js';
import { dashboardChartsTemplate } from './templates/dashboard-charts.js';
import { dashboardControlsTemplate } from './templates/dashboard-controls.js';
import { dashboardDevicesTemplate } from './templates/dashboard-devices.js';
import { dashboardSerialTemplate } from './templates/dashboard-serial.js';
import { devicesListTemplate } from './templates/devices-list.js';
import { ipRegistryTemplate } from './templates/ip-registry.js';
import { settingsTemplate } from './templates/settings.js';
import { cameraModalTemplate } from './templates/camera-modal.js';

export function injectTemplates() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    ${authTemplate}
    ${ipLockTemplate}
    <div class="app-container">
      ${sidebarTemplate}
      <main class="main-content" id="mainWorkspace">
        <section class="tab-content active" id="tab-dashboard">
          ${dashboardHeaderTemplate}
          ${dashboardMetricsTemplate}
          ${dashboardChartsTemplate}
          ${dashboardControlsTemplate}
          ${dashboardDevicesTemplate}
          ${dashboardSerialTemplate}
        </section>
        <section class="tab-content" id="tab-devices">
          <header class="dashboard-header">
            <div class="header-info">
              <h1>Thiết bị SmartHome</h1>
              <p>Danh sách chi tiết và quản lý các cổng camera giám sát, cảm biến môi trường</p>
            </div>
          </header>
          ${devicesListTemplate}
          ${ipRegistryTemplate}
        </section>
        <section class="tab-content" id="tab-settings">
          ${settingsTemplate}
        </section>
      </main>
    </div>
    ${cameraModalTemplate}
  `;
}
