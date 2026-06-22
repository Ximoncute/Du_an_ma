// js/templates/landing-hardware.js
export const hardwareTemplate = `
<section class="section-padding section-bg" id="hardware">
        <div class="container">
            <div class="section-header reveal">
                <div class="section-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                        <rect x="9" y="9" width="6" height="6" />
                        <line x1="9" y1="1" x2="9" y2="4" />
                        <line x1="15" y1="1" x2="15" y2="4" />
                        <line x1="9" y1="20" x2="9" y2="23" />
                        <line x1="15" y1="20" x2="15" y2="23" />
                        <line x1="20" y1="9" x2="23" y2="9" />
                        <line x1="20" y1="14" x2="23" y2="14" />
                        <line x1="1" y1="9" x2="4" y2="9" />
                        <line x1="1" y1="14" x2="4" y2="14" />
                    </svg>
                    Phần cứng
                </div>
                <h2 class="section-title">Công Nghệ Phần Cứng Đằng Sau Hệ Thống</h2>
                <p class="section-desc">Được xây dựng trên nền tảng phần cứng đáng tin cậy và linh hoạt, tối ưu cho IoT.
                </p>
            </div>

            <div class="hardware-grid">
                <!-- Card 1: ESP32 -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/esp32_board.png" alt="ESP32 Development Board" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>ESP32 Development Board</h3>
                        <p>Vi điều khiển lõi kép WiFi + Bluetooth, xử lý trung tâm cho toàn bộ hệ thống IoT.</p>
                    </div>
                </div>

                <!-- Card 2: PCB -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/pcb_board.png" alt="PCB Board tự thiết kế" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>PCB Board tự thiết kế</h3>
                        <p>Mạch in tùy chỉnh, thiết kế tối ưu cho kết nối cảm biến và module điều khiển.</p>
                    </div>
                </div>

                <!-- Card 3: Relay -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/relay_module.png" alt="Relay Module" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>Relay Module</h3>
                        <p>Module relay 4 kênh cho phép điều khiển đóng/ngắt thiết bị điện an toàn.</p>
                    </div>
                </div>

                <!-- Card 4: DHT22 -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/dht22_sensor.png" alt="DHT22 Sensor" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>DHT22 Sensor</h3>
                        <p>Cảm biến nhiệt độ và độ ẩm chính xác cao, đo liên tục theo thời gian thực.</p>
                    </div>
                </div>

                <!-- Card 5: Smoke -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/smoke_sensor.png" alt="Smoke Sensor" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>Smoke Sensor</h3>
                        <p>Cảm biến phát hiện khói và khí gas, cảnh báo sớm nguy cơ hỏa hoạn.</p>
                    </div>
                </div>

                <!-- Card 6: Camera -->
                <div class="hardware-card reveal">
                    <div class="hardware-img">
                        <img src="images/camera_module.png" alt="Camera Module" class="hardware-img-el">
                    </div>
                    <div class="hardware-info">
                        <h3>Camera Module</h3>
                        <p>Camera OV2640 độ phân giải cao, tích hợp trực tiếp với ESP32 để truyền hình ảnh.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
`;
