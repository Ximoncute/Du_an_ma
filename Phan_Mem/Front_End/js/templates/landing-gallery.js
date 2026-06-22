// js/templates/landing-gallery.js
export const galleryTemplate = `
<section class="section-padding" id="gallery">
        <div class="container">
            <div class="section-header reveal">
                <div class="section-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Gallery
                </div>
                <h2 class="section-title">Hệ Thống Được Triển Khai Trên Phần Cứng Thực Tế</h2>
                <p class="section-desc">Xem hình ảnh thực tế về phần cứng và hệ thống đang được lắp đặt, vận hành.</p>
            </div>

            <div class="masonry-grid reveal">
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/pcb_board.png" alt="PCB thực tế" loading="lazy">
                    </div>
                    <div class="masonry-caption">PCB Board tự thiết kế và in ấn</div>
                </div>
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/esp32_sensor_new.png" alt="ESP32 Module" loading="lazy">
                    </div>
                    <div class="masonry-caption">ESP32 DevKit V1 kết nối cảm biến</div>
                </div>
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/relay_module.png" alt="Mạch điều khiển" loading="lazy">
                    </div>
                    <div class="masonry-caption">Mạch điều khiển relay 4 kênh</div>
                </div>
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/device_assembled_new.png" alt="Thiết bị hoàn chỉnh" loading="lazy">
                    </div>
                    <div class="masonry-caption">Sản phẩm sau khi lắp ráp hoàn chỉnh</div>
                </div>
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/dashboard.png" alt="Hệ thống đang hoạt động" loading="lazy">
                    </div>
                    <div class="masonry-caption">Hệ thống vận hành trong thực tế</div>
                </div>
                <div class="masonry-item">
                    <div class="masonry-img">
                        <img src="images/wall_installed_new.png" alt="Lắp đặt trong nhà" loading="lazy">
                    </div>
                    <div class="masonry-caption">Thiết bị lắp đặt trong nhà thực tế</div>
                </div>
            </div>
        </div>
    </section>
`;
