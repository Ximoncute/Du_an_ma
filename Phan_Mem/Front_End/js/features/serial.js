// js/serial.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { setDeviceActiveState } from '../devices/devices-state.js';

export function initSerialMonitor() {
  if (el.btnSerialConnect) {
    el.btnSerialConnect.addEventListener('click', () => {
      if (!state.connection.activeIp) return;
      
      if (!state.connection.deviceOnline && !state.serial.connected) {
        // Không cho phép kết nối nếu thiết bị chưa gửi dữ liệu
        return;
      }

      state.serial.connected = !state.serial.connected;

      if (state.serial.connected) {
        el.btnSerialConnect.classList.add('connected');
        el.btnSerialConnect.querySelector('span').textContent = 'Ngắt kết nối';
        el.serialSubtext.textContent = `Đã kết nối qua Gateway (${state.connection.activeIp})`;
        el.serialSubtext.style.color = 'var(--brand-green)';
        el.serialInput.disabled = el.btnSerialSend.disabled = false;

        logSerial('[Hệ thống] Đang thiết lập kết nối tới thiết bị IoT...', false, true);
        setTimeout(() => {
          logSerial(`[Hệ thống] Kết nối thành công! Thiết bị: ESP32. IP: ${state.connection.activeIp}`, false, true);
          logSerial('[Hệ thống] Gõ "HELP" để xem danh sách các lệnh cấu hình.', false, true);
        }, 600);

        state.serial.intervalId = setInterval(() => {
          if (state.serial.connected && state.connection.activeIp) {
            const dice = Math.random();
            if (dice < 0.2) {
              logSerial(`[ESP32] RSSI=${-50 - Math.floor(Math.random() * 20)}dBm (Wifi Signal Strength)`);
            } else if (dice < 0.3) {
              logSerial(`[ESP32] HEAP_FREE=${175000 + Math.floor(Math.random() * 15000)} Bytes`);
            }
          }
        }, 5000);
      } else {
        el.btnSerialConnect.classList.remove('connected');
        el.btnSerialConnect.querySelector('span').textContent = 'Kết nối';
        el.serialSubtext.textContent = 'Chưa kết nối — nhấn nút để bắt đầu';
        el.serialSubtext.style.color = '';
        el.serialInput.disabled = el.btnSerialSend.disabled = true;

        logSerial('[Hệ thống] Đã ngắt kết nối với thiết bị.', true);
        if (state.serial.intervalId) {
          clearInterval(state.serial.intervalId);
          state.serial.intervalId = null;
        }
      }
    });
  }

  if (el.btnSerialSend) el.btnSerialSend.addEventListener('click', handleSerialSend);
  if (el.serialInput) {
    el.serialInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSerialSend();
    });
  }
}

function handleSerialSend() {
  const rawVal = el.serialInput.value.trim();
  if (!rawVal) return;

  logSerial(`[Tôi] LỆNH: ${rawVal}`, false, false, 'sent');
  el.serialInput.value = '';

  setTimeout(() => {
    const cmd = rawVal.toUpperCase();
    if (cmd === 'HELP') {
      logSerial('[ESP32] Danh sách lệnh hợp lệ:');
      logSerial('  - LED_ON   : Bật đèn phòng khách');
      logSerial('  - LED_OFF  : Tắt đèn phòng khách');
      logSerial('  - GET_TEMP : Lấy nhiệt độ hiện tại');
      logSerial('  - GET_IP   : Lấy địa chỉ IP kết nối');
      logSerial('  - REBOOT   : Khởi động lại vi điều khiển');
    } else if (cmd === 'LED_ON' || cmd === 'LED_OFF') {
      const active = (cmd === 'LED_ON');
      if (el.toggleLightLiving) el.toggleLightLiving.checked = active;
      setDeviceActiveState('light_living', active);
      logSerial(`[ESP32] ACK: Đã thực thi ${active ? 'BẬT' : 'TẮT'} đèn phòng khách.`);

      // Gửi lệnh qua MQTT
      if (state.connection.mqttClient && state.connection.mqttConnected && state.connection.activeIp) {
        const cleanIp = state.connection.activeIp.replace(/\./g, '_');
        const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
        state.connection.mqttClient.publish(controlTopic, JSON.stringify({ command: 'light', state: active }));
      }
    } else if (cmd === 'GET_TEMP') {
      logSerial(`[ESP32] Cảm biến DHT11: Nhiệt độ = ${state.sensors.temp.toFixed(1)}°C.`);
    } else if (cmd === 'GET_IP') {
      logSerial(`[ESP32] Trạng thái mạng: IP = ${state.connection.activeIp}.`);
    } else if (cmd === 'REBOOT') {
      logSerial('[ESP32] WARNING: Đang khởi động lại hệ thống...', true);
      setTimeout(() => {
        if (state.serial.connected) el.btnSerialConnect.click();
      }, 1000);
    } else {
      state.lcdText = rawVal;
      logSerial(`[ESP32] Đã nhận và hiển thị OLED : "${rawVal}"`);

      // Gửi nội dung văn bản để hiển thị lên OLED của ESP32 qua MQTT
      if (state.connection.mqttClient && state.connection.mqttConnected && state.connection.activeIp) {
        const cleanIp = state.connection.activeIp.replace(/\./g, '_');
        const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
        state.connection.mqttClient.publish(controlTopic, JSON.stringify({ command: 'lcd', text: rawVal }));
      }
    }
  }, 400);
}
