// js/templates/landing-hero.js
export const heroTemplate = `
<section class="hero" id="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    Nền tảng IoT thế hệ mới
                </div>
                <h1 class="hero-title">
                    Biến Ngôi Nhà Của Bạn Thành <span class="highlight">Hệ Sinh Thái Thông Minh</span>
                </h1>
                <p class="hero-desc">
                    Điều khiển mọi thiết bị trong nhà từ bất kỳ nơi đâu. Tiết kiệm điện năng, nâng cao an ninh và tận hưởng
                    cuộc sống hiện đại với SmartHome IoT.
                </p>
                <div class="hero-btns">
                    <a href="index.html" class="btn btn-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        Trải Nghiệm Ngay
                    </a>
                    <a href="#dashboard" class="btn btn-outline">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Xem Demo
                    </a>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <span class="hero-stat-value" data-target="5000" data-suffix="+">0</span>
                        <span class="hero-stat-label">Người dùng</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-value" data-target="10000" data-suffix="+">0</span>
                        <span class="hero-stat-label">Thiết bị</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat-value" data-target="99.9" data-suffix="%" data-decimal="true">0</span>
                        <span class="hero-stat-label">Uptime</span>
                    </div>
                </div>
            </div>

            <div class="hero-visual">
                <!-- Floating Tags -->
                <div class="float-tag tag-temp">
                    <div class="float-tag-icon">🌡️</div>
                    <div>
                        <div style="font-size:0.72rem;color:var(--secondary-text)">Nhiệt độ</div>
                        <div style="font-weight:700">28.5°C</div>
                    </div>
                </div>
                <div class="float-tag tag-humid">
                    <div class="float-tag-icon">💧</div>
                    <div>
                        <div style="font-size:0.72rem;color:var(--secondary-text)">Độ ẩm</div>
                        <div style="font-weight:700">65%</div>
                    </div>
                </div>
                <div class="float-tag tag-energy">
                    <div class="float-tag-icon">⚡</div>
                    <div>
                        <div style="font-size:0.72rem;color:var(--secondary-text)">Năng lượng</div>
                        <div style="font-weight:700">125 kWh</div>
                    </div>
                </div>
                <div class="float-tag tag-security">
                    <div class="float-tag-icon">🔒</div>
                    <div>
                        <div style="font-size:0.72rem;color:var(--secondary-text)">An ninh</div>
                        <div style="font-weight:700;color:var(--dark-green)">An toàn</div>
                    </div>
                </div>

                <!-- Dashboard Mockup -->
                <div class="hero-mockup">
                    <div class="mockup-header">
                        <span class="mockup-title">📊 Dashboard</span>
                        <span class="mockup-status">
                            <span class="mockup-status-dot"></span>
                            Đang hoạt động
                        </span>
                    </div>
                    <div class="mockup-grid">
                        <div class="mockup-card">
                            <div class="mockup-card-icon temp">🌡️</div>
                            <div class="mockup-card-label">Nhiệt độ</div>
                            <div><span class="mockup-card-value">28.5</span><span class="mockup-card-unit">°C</span>
                            </div>
                        </div>
                        <div class="mockup-card">
                            <div class="mockup-card-icon humid">💧</div>
                            <div class="mockup-card-label">Độ ẩm</div>
                            <div><span class="mockup-card-value">65</span><span class="mockup-card-unit">%</span></div>
                        </div>
                        <div class="mockup-card">
                            <div class="mockup-card-icon energy">⚡</div>
                            <div class="mockup-card-label">Công suất</div>
                            <div><span class="mockup-card-value">1.2</span><span class="mockup-card-unit">kW</span>
                            </div>
                        </div>
                        <div class="mockup-card">
                            <div class="mockup-card-icon security">🔒</div>
                            <div class="mockup-card-label">An ninh</div>
                            <div><span class="mockup-card-value" style="font-size:1rem;color:var(--dark-green)">An
                                    toàn</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;
