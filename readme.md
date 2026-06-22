## SmartHome IoT - Hệ Thống Nhà Thông Minh 
## Điều Khiển & Giám Sát Từ Xa 

Dự án nghiên cứu và phát triển hệ thống nhà thông minh tích hợp trí tuệ nhân tạo biên (TinyML) sử dụng vi điều khiển **Seeed Studio XIAO ESP32S3**, giao thức **MQTT** và giao diện điều khiển **Web Dashboard** thời gian thực.

---

## 📌 Tổng Quan Hệ Thống

Hệ thống cho phép giám sát các chỉ số môi trường (nhiệt độ, độ ẩm, ánh sáng) và điều khiển các thiết bị trong nhà (đèn, cửa) từ xa thông qua giao diện Web. Đặc biệt, hệ thống tích hợp mô hình Học Máy biên (TinyML) của **Edge Impulse** chạy trực tiếp trên ESP32S3 để nhận dạng từ khóa giọng nói ngoại tuyến (offline voice keywords) nhằm điều khiển thiết bị mà không cần kết nối Internet.

## ✨ Các Tính Năng Nổi Bật

- **Giám sát thời gian thực:** Cập nhật liên tục nhiệt độ, độ ẩm và cường độ ánh sáng bằng biểu đồ sinh động qua Chart.js.
- **Điều khiển từ xa thông minh:** Bật/tắt đèn và đóng/mở cửa từ Web Dashboard với độ trễ cực thấp (< 100ms) qua MQTT.
- **Trí tuệ nhân tạo biên (TinyML):** Nhận diện từ khóa giọng nói trực tiếp trên chip ESP32S3 để thực thi các lệnh điều khiển nhanh chóng.
- **Cấu hình WiFi tiện lợi:** Tích hợp `WiFiManager` giúp kết nối phần cứng vào mạng WiFi gia đình dễ dàng thông qua cổng cấu hình Captive Portal mà không cần nạp lại code.
- **Đồng bộ ngưỡng thông minh:** Thiết lập ngưỡng tự động tắt/bật thiết bị (nhiệt độ, độ ẩm, ánh sáng) từ giao diện Web và đồng bộ trực tiếp xuống phần cứng.
- **Giao diện hiện đại & Modular:** Thiết kế giao diện Premium Glassmorphism, Responsive (tương thích Mobile/Tablet) và sử dụng kiến trúc ES Modules sạch sẽ.

---

## 🛠️ Chi Tiết Phần Cứng (Hardware)

Dự án sử dụng các linh kiện phần cứng sau:
*   **Vi điều khiển chính:** Seeed Studio XIAO ESP32S3 (Lõi kép, hỗ trợ WiFi, Bluetooth và tăng tốc tính toán AI).
*   **Cảm biến nhiệt độ & độ ẩm:** DHT22 (Độ chính xác cao).
*   **Cảm biến ánh sáng:** BH1750 (Giao tiếp I2C, đo cường độ Lux chính xác).
*   **Màn hình hiển thị:** OLED SSD1306 (128x64 pixels, giao tiếp I2C).
*   **Cơ cấu chấp hành:** Module Relay 4 kênh để đóng cắt thiết bị điện 220V.
*   **Mô hình AI:** Tích hợp bộ thư viện `Edge Impulse SDK` đã được huấn luyện nhận diện từ khóa giọng nói.

*Mã nguồn phần cứng nằm tại thư mục:* `Phan_Cung/IoT_Ung_Dung/` (dự án dạng **PlatformIO**).

---

## 💻 Chi Tiết Phần Mềm (Software)

Mã nguồn phần mềm nằm tại thư mục: `Phan_Mem/Front_End/`. Được cấu trúc cực kỳ tối ưu và dễ bảo trì:

```
Phan_Mem/Front_End/
├── css/
│   ├── landingpage.css      # Toàn bộ CSS của Landing Page
│   ├── auth.css, settings.css, ... # CSS cho các component Dashboard
│   └── variables.css        # Khai báo màu sắc, font, shadow hệ thống
├── js/
│   ├── templates/           # Các file HTML Component được viết dưới dạng ES Module
│   │   ├── landing-*.js     # Các phần của trang Landing Page (Hero, Features, FAQ...)
│   │   └── *.js             # Các phần của trang Dashboard (Sidebar, Metrics, Terminal...)
│   ├── landingpage.js       # File JavaScript điều phối của Landing Page
│   ├── main.js              # File JavaScript khởi tạo Dashboard chính
│   └── ip-connection.js     # Xử lý kết nối MQTT WebSockets tới ESP32 qua EMQX Broker
├── ladingpage.html          # Trang giới thiệu (Landing Page) rút gọn (< 40 dòng)
├── index.html               # Trang Dashboard chính của hệ thống
└── style.css                # CSS tổng thể
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Nạp Code Phần Cứng (ESP32S3)
1. Cài đặt extension **PlatformIO IDE** trên VS Code.
2. Mở thư mục dự án phần cứng tại `Phan_Cung/IoT_Ung_Dung/`.
3. Kết nối board **Seeed Studio XIAO ESP32S3** với máy tính qua cổng USB-C.
4. Nhấn **Build** và **Upload** code từ thanh công cụ PlatformIO để nạp chương trình.
5. Khi khởi động lần đầu, thiết bị sẽ phát ra một điểm truy cập WiFi. Dùng điện thoại kết nối vào đó để cấu hình WiFi nhà bạn cho ESP32.

### 2. Chạy Giao Diện Phần Mềm (Front-End)
```
 Đang update
```
### 3. Kết Nối Phần Mềm & Phần Cứng
1. Lấy **địa chỉ IP** của ESP32 hiển thị trên màn hình OLED (hoặc qua log Serial).
2. Nhấn vào nút **Trải Nghiệm Ngay** trên Landing Page để chuyển sang Dashboard.
3. Nhập địa chỉ IP của thiết bị vào ô kết nối trên Dashboard.
4. Giao diện Web sẽ tự động thiết lập kết nối MQTT thông qua EMQX Broker đến thiết bị và bắt đầu cập nhật dữ liệu liên tục!

---

## 👥 Đội Ngũ Phát Triển (Team 2)

Dự án được xây dựng và hoàn thiện bởi các thành viên **Team 2** thuộc môn học **IoT và Ứng Dụng**. 
Chúc bạn có những trải nghiệm tuyệt vời với **SmartHome IoT**! 🏡⚡

## Trưởng đoàn : Lê Chí Hiếu - 0329675925
## Các thành viên tham gia
### 01. Ngô Quý Trường Giang 
### 02. Trần Huy Hoàng 
### 03. Trần Quốc Khánh
### 04. Bùi Văn Sang
### 05. Phá Đoàn : Nguyễn Thị Ngọc Anh
### 06. Bình Luận Viên : Nguyễn Tất Thắng

# Hình ảnh thương mại
![alt text](assets/image.png)

# Bản chạy thử cho quý khách xem
<video controls src="IoT_small.mp4" title="Title"></video>