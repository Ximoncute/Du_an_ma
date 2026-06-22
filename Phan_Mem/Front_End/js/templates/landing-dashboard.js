// js/templates/landing-dashboard.js
export const dashboardTemplate = `
<section class="section-padding section-bg" id="dashboard">
        <div class="container">
            <div class="section-header reveal">
                <div class="section-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                </div>
                <h2 class="section-title">Bảng Điều Khiển Trung Tâm</h2>
                <p class="section-desc">Giao diện Dashboard hiện đại, trực quan, cho phép giám sát và điều khiển toàn bộ
                    hệ thống trong thời gian thực.</p>
            </div>

            <div class="dashboard-preview-container reveal">
                <div class="browser-header">
                    <div class="browser-dot dot-red"></div>
                    <div class="browser-dot dot-yellow"></div>
                    <div class="browser-dot dot-green"></div>
                    <div class="browser-title">SmartHome Dashboard Preview</div>
                </div>
                <img src="images/dashboard.png" alt="SmartHome Dashboard Mockup" class="dashboard-preview-img">
            </div>
        </div>
    </section>
`;
