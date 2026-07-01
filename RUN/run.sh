#!/bin/bash

# Lấy đường dẫn của thư mục chứa script này
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "======================================================"
echo "          KHỞI CHẠY HỆ THỐNG SMARTHOME IOT"
echo "======================================================"
echo ""

# Tự động kiểm tra và cài đặt dependencies cho Back-End nếu chưa có
if [ ! -d "$DIR/../Phan_Mem/Back_End/node_modules" ]; then
    echo "[*] Thư mục node_modules không tồn tại. Đang tự động cài đặt dependencies cho Back-End..."
    cd "$DIR/../Phan_Mem/Back_End" || exit 1
    npm install
fi

# Khởi tạo các biến PID
BACKEND_PID=""
FRONTEND_PID=""

# Hàm dọn dẹp tiến trình con khi tắt script (Ctrl+C)
cleanup() {
    echo ""
    echo "[*] Đang dừng các dịch vụ..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    echo "[OK] Đã dừng toàn bộ dịch vụ."
    exit 0
}

# Đăng ký hàm dọn dẹp khi nhận tín hiệu ngắt (Ctrl+C)
trap cleanup SIGINT SIGTERM

echo "[*] Đang khởi chạy Back-End (Port 5000)..."
cd "$DIR/../Phan_Mem/Back_End" || exit 1
npm start &
BACKEND_PID=$!

echo "[*] Đang khởi chạy Front-End (Port 3000)..."
cd "$DIR/../Phan_Mem/Front_End" || exit 1
npx http-server -p 3000 &
FRONTEND_PID=$!

echo "[*] Đang mở giao diện trên Trình duyệt..."
sleep 3

# Tự động phát hiện hệ điều hành để mở đường dẫn
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://127.0.0.1:3000/ladingpage.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://127.0.0.1:3000/ladingpage.html" 2>/dev/null || \
    sensible-browser "http://127.0.0.1:3000/ladingpage.html" 2>/dev/null || \
    x-www-browser "http://127.0.0.1:3000/ladingpage.html" 2>/dev/null
else
    echo "[!] Không thể nhận diện HĐH để mở trình duyệt tự động."
fi

echo ""
echo "[OK] Hệ thống đã được khởi chạy!"
echo "Giữ cửa sổ Terminal này để duy trì hoạt động của Back-End và Front-End."
echo "Nhấn Ctrl+C để dừng tất cả các dịch vụ."
echo ""

# Vòng lặp vô hạn giữ script không bị thoát
while true; do
    sleep 1
done
