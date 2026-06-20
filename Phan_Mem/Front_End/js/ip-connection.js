// js/ip-connection.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { checkWorkspaceLock, showIpError, hideIpError } from './auth-lock.js';
import { renderRegisteredNodes } from './ip-registry-render.js';
import { initSensorCharts } from './charts.js';
import { updateMetricDisplays } from './sensors.js';

export function connectToEspMqtt(ip, onSuccess, onFailure) {
  // Ngắt kết nối MQTT cũ nếu có
  if (state.connection.mqttClient) {
    try {
      state.connection.mqttClient.end();
    } catch (e) {}
    state.connection.mqttClient = null;
    state.connection.mqttConnected = false;
  }

  // Xác thực sự tồn tại của thư viện MQTT.js
  const mqttLib = window.mqtt || (typeof mqtt !== 'undefined' ? mqtt : null);
  if (!mqttLib) {
    logSerial(`[Lỗi] Thư viện MQTT.js chưa được tải thành công. Vui lòng kiểm tra kết nối Internet!`, true);
    onFailure('Thư viện MQTT.js chưa được tải! Kiểm tra lại kết nối mạng của bạn.');
    return;
  }

  const cleanIp = ip.replace(/\./g, '_');
  const sensorTopic = `iot_ung_dung/team_2/sensor/${cleanIp}`;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const port = protocol === 'wss:' ? '8084' : '8083';
  const brokerUrl = `${protocol}//broker.emqx.io:${port}/mqtt`;

  logSerial(`[Hệ thống] Đang kết nối tới EMQX Broker (${brokerUrl})...`, false, true);

  // Kết nối WebSockets tới EMQX Broker
  const client = mqttLib.connect(brokerUrl, {
    path: '/mqtt',
    clientId: 'WebDashboardClient_' + Math.random().toString(16).substr(2, 8),
    keepalive: 60,
    reconnectPeriod: 2000,
    connectTimeout: 8000
  });

  state.connection.mqttClient = client;

  let firstMessageReceived = false;
  // Xóa connectionTimeout vì ta kết nối thành công tới Broker là mở khóa luôn
  
  client.on('connect', () => {
    logSerial(`[MQTT Web] Đã kết nối thành công tới MQTT Broker EMQX.`, false, true);
    logSerial(`[MQTT Web] Đang lắng nghe dữ liệu từ Topic: ${sensorTopic}...`, false, true);
    
    client.subscribe(sensorTopic, (err) => {
      if (err) {
        logSerial(`[Lỗi] Đăng ký nhận dữ liệu cảm biến thất bại: ${err.message}`, true);
      }
    });

    if (!firstMessageReceived) {
      firstMessageReceived = true;
      state.connection.mqttConnected = true;
      state.connection.activeIp = ip;
      localStorage.setItem('activeIp', ip);

      if (!state.connection.registeredIps.includes(ip)) {
        state.connection.registeredIps.push(ip);
        localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
      }

      // Khởi tạo dữ liệu trắng (rỗng) cho cảm biến khi vừa kết nối
      state.sensors.temp = 0;
      state.sensors.humid = 0;
      state.sensors.light = 0;
      updateMetricDisplays();

      // Đồng bộ ngay ngưỡng cài đặt hiện tại từ Web xuống thiết bị qua controlTopic
      const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
      client.publish(controlTopic, JSON.stringify({
        command: 'settings',
        tempThreshold: state.settings.tempThreshold,
        humidThreshold: state.settings.humidThreshold,
        lightThreshold: state.settings.lightThreshold
      }));

      logSerial(`[Hệ thống] Đồng bộ kết nối với IP: ${ip}. Đang chờ thiết bị truyền tải dữ liệu...`, false, true);
      
      // Tự động kết nối Serial Monitor
      if (el.btnSerialConnect && !state.serial.connected) {
        el.btnSerialConnect.click();
      }

      onSuccess();
    }
  });

  client.on('reconnect', () => {
    logSerial(`[MQTT Web] Mất kết nối. Đang thử kết nối lại tới Broker...`, false, false);
  });

  client.on('offline', () => {
    logSerial(`[MQTT Web] Client rơi vào trạng thái ngoại tuyến (Offline).`, true);
  });

  client.on('close', () => {
    state.connection.mqttConnected = false;
  });

  client.on('message', (topic, message) => {
    if (topic === sensorTopic) {
      try {
        const data = JSON.parse(message.toString());

        // Cập nhật dữ liệu cảm biến thực tế khi nhận được gói tin từ phần cứng
        state.sensors.temp = parseFloat(data.temp) || 0;
        state.sensors.humid = parseFloat(data.humid) || 0;
        state.sensors.light = parseFloat(data.light) || 0;

        // Đồng bộ trạng thái thiết bị Đèn
        if (data.hasOwnProperty('light_state')) {
          const lActive = !!data.light_state;
          
          if (state.devices.light_living.isPending) {
            // Nếu trạng thái nhận về đã trùng khớp với trạng thái mong muốn từ UI, mở khóa sớm
            if (lActive === el.toggleLightLiving.checked) {
              state.devices.light_living.isPending = false;
              clearTimeout(state.devices.light_living.pendingTimeout);
            }
          }

          // Chỉ cập nhật UI nếu không ở trạng thái khóa pending
          if (!state.devices.light_living.isPending) {
            state.devices.light_living.active = lActive;
            state.devices.light_living.stateText = lActive ? 'Đang bật' : 'Đã tắt';
            if (el.toggleLightLiving) el.toggleLightLiving.checked = lActive;

            const card = document.querySelector(`.device-card[data-device-id="light_living"]`);
            if (card) {
              if (lActive) card.classList.add('active');
              else card.classList.remove('active');
            }
            const titleEl = document.getElementById('state-title-light_living');
            if (titleEl) titleEl.textContent = state.devices.light_living.stateText;
          }
        }

        // Đồng bộ trạng thái thiết bị Cửa
        if (data.hasOwnProperty('door_state')) {
          const dActive = !!data.door_state;

          if (state.devices.door_hallway.isPending) {
            // Nếu trạng thái nhận về đã trùng khớp với trạng thái mong muốn từ UI, mở khóa sớm
            if (dActive === el.toggleDoorHallway.checked) {
              state.devices.door_hallway.isPending = false;
              clearTimeout(state.devices.door_hallway.pendingTimeout);
            }
          }

          // Chỉ cập nhật UI nếu không ở trạng thái khóa pending
          if (!state.devices.door_hallway.isPending) {
            state.devices.door_hallway.active = dActive;
            state.devices.door_hallway.stateText = dActive ? 'Đã mở' : 'Đã đóng';
            if (el.toggleDoorHallway) el.toggleDoorHallway.checked = dActive;

            const card = document.querySelector(`.device-card[data-device-id="door_hallway"]`);
            if (card) {
              if (dActive) card.classList.add('active');
              else card.classList.remove('active');
            }
            const titleEl = document.getElementById('state-title-door_hallway');
            if (titleEl) titleEl.textContent = state.devices.door_hallway.stateText;
          }
        }

        // Cập nhật biểu đồ và hiển thị số liệu thực
        updateMetricDisplays();

        if (data.hasOwnProperty('ai_keyword') && data.ai_keyword !== "none") {
          logSerial(`[Giọng nói AI] Từ khóa: "${data.ai_keyword}" (${Math.round(data.ai_conf * 100)}%)`);
        }
      } catch (err) {
        logSerial(`[Lỗi] Lỗi phân tích cú pháp JSON: ${err.message}`, true);
      }
    }
  });

  client.on('error', (err) => {
    logSerial(`[Lỗi MQTT] Connection Error: ${err.message}`, true);
  });
}

export function initIpConnectionLock() {
  checkWorkspaceLock();

  if (el.btnIpConnect) {
    el.btnIpConnect.addEventListener('click', () => {
      const ip = el.ipLockInput.value.trim();
      const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipPattern.test(ip)) return showIpError('Định dạng địa chỉ IP không hợp lệ!');

      hideIpError();
      el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'none');
      el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'none');
      el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'flex');
      el.ipLockSpinnerText && (el.ipLockSpinnerText.textContent = `Đang kết nối tới ESP32 tại ${ip}...`);
      el.ipLockLogo && el.ipLockLogo.classList.add('connecting');

      connectToEspMqtt(
        ip,
        () => {
          // Thành công
          el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
          el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
          el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
          el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');
          
          checkWorkspaceLock();
          renderRegisteredNodes();
          initSensorCharts();
        },
        (errorMsg) => {
          // Thất bại
          el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
          el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
          el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
          el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');
          
          showIpError(errorMsg);
          checkWorkspaceLock();
        }
      );
    });
  }

  el.ipLockInput && el.ipLockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') el.btnIpConnect.click();
  });

  if (el.connectionStatusBlock) {
    el.connectionStatusBlock.style.cursor = 'pointer';
    el.connectionStatusBlock.title = 'Click để ngắt kết nối thiết bị';
    el.connectionStatusBlock.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn ngắt kết nối tới thiết bị ESP32 hiện tại?')) {
        logSerial(`[Hệ thống] Đã ngắt kết nối thiết bị có IP: ${state.connection.activeIp}`, true);
        state.connection.activeIp = null;
        localStorage.removeItem('activeIp');
        
        // Ngắt kết nối MQTT client
        if (state.connection.mqttClient) {
          try {
            state.connection.mqttClient.end();
          } catch(e) {}
          state.connection.mqttClient = null;
          state.connection.mqttConnected = false;
        }

        if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();
        checkWorkspaceLock();
        renderRegisteredNodes();
      }
    });
  }
}

export function switchActiveNodeIp(ip) {
  el.ipLockOverlay && el.ipLockOverlay.classList.remove('hidden');
  el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'none');
  el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'none');
  el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'flex');
  el.ipLockSpinnerText && (el.ipLockSpinnerText.textContent = `Đang chuyển kết nối tới Node tại ${ip}...`);
  el.ipLockLogo && el.ipLockLogo.classList.add('connecting');

  if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();

  connectToEspMqtt(
    ip,
    () => {
      // Thành công
      el.ipLockOverlay && el.ipLockOverlay.classList.add('hidden');
      el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
      el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
      el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
      el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');
      
      checkWorkspaceLock();
      renderRegisteredNodes();
      initSensorCharts();
    },
    (errorMsg) => {
      // Thất bại
      el.ipLockOverlay && el.ipLockOverlay.classList.remove('hidden');
      el.ipLockFormBlock && (el.ipLockFormBlock.style.display = 'flex');
      el.ipLockInfoBlock && (el.ipLockInfoBlock.style.display = 'block');
      el.ipLockSpinnerContainer && (el.ipLockSpinnerContainer.style.display = 'none');
      el.ipLockLogo && el.ipLockLogo.classList.remove('connecting');
      
      alert(errorMsg);
      checkWorkspaceLock();
    }
  );
}
