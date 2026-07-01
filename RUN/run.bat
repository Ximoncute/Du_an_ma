@echo off
title SmartHome IoT System Runner
echo ======================================================
echo           KHOI CHAY HE THONG SMARTHOME IOT
echo ======================================================
echo.

rem Kiem tra va tu dong cai dat dependencies cho Back-End neu chua co
if not exist "%~dp0..\Phan_Mem\Back_End\node_modules" (
    echo [*] Thu muc node_modules khong ton tai. Dang tu dong cai dat dependencies cho Back-End...
    cd /d "%~dp0..\Phan_Mem\Back_End" && npm install
)

echo [*] Dang khoi chay Back-End (Port 5000)...
start "SmartHome Back-End" cmd /k "cd /d "%~dp0..\Phan_Mem\Back_End" && npm start"

echo [*] Dang khoi chay Front-End (Port 3000)...
start "SmartHome Front-End" cmd /k "cd /d "%~dp0..\Phan_Mem\Front_End" && npx http-server -p 3000"

echo [*] Dang mo giao dien tren Trinh duyet...
timeout /t 3 /nobreak >nul
start http://127.0.0.1:3000/ladingpage.html

echo.
echo [OK] He thong da duoc khoi chay!
echo Hay giu cac cua so terminal Back-End va Front-End vua
echo duoc bat de duy tri hoat dong.
pause
