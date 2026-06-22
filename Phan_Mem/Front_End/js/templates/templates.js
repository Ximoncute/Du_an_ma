// js/templates.js
import { authTemplate } from './auth.js';
import { ipLockTemplate } from './ip-lock.js';
import { sidebarTemplate } from './sidebar.js';
import { dashboardHeaderTemplate } from './dashboard-header.js';
import { dashboardMetricsTemplate } from './dashboard-metrics.js';
import { dashboardChartsTemplate } from './dashboard-charts.js';
import { dashboardControlsTemplate } from './dashboard-controls.js';
import { dashboardDevicesTemplate } from './dashboard-devices.js';
import { dashboardSerialTemplate } from './dashboard-serial.js';
import { devicesListTemplate } from './devices-list.js';
import { ipRegistryTemplate } from './ip-registry.js';
import { settingsTemplate } from './settings.js';
import { profileTemplate } from './profile.js';
import { supportTemplate } from './support.js';
import { cameraModalTemplate } from './camera-modal.js';

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
        <section class="tab-content" id="tab-profile">
          ${profileTemplate}
        </section>
        <section class="tab-content" id="tab-support">
          ${supportTemplate}
        </section>
      </main>
    </div>
    ${cameraModalTemplate}
  `;
}
