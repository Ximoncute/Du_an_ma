// js/connection/ip-connection.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { checkWorkspaceLock, showIpError, hideIpError } from '../auth/auth-lock.js';
import { renderRegisteredNodes } from './ip-registry-render.js';
import { initSensorCharts } from '../charts/charts.js';
import { updateMetricDisplays } from '../charts/sensors.js';
import { updateAllDevicesOnlineStatus } from '../devices/devices-state.js';

function updateMqttButtonState() {
  if (!el.btnMqttToggle) return;
  if (state.connection.mqttConnected && state.connection.deviceOnline) {
    el.btnMqttToggle.textContent = 'MQTT: Đã kết nối';
    el.btnMqttToggle.className = 'btn-mqtt-status';
    el.btnMqttToggle.title = 'Nhấp để ngắt kết nối MQTT';
  } else if (state.connection.mqttConnected) {
    el.btnMqttToggle.textContent = 'MQTT: Chờ dữ liệu...';
    el.btnMqttToggle.className = 'btn-mqtt-status connecting';
    el.btnMqttToggle.title = 'Đã kết nối broker, đang đợi dữ liệu cảm biến...';
  } else if (state.connection.mqttClient) {
    el.btnMqttToggle.textContent = 'MQTT: Đang kết nối...';
    el.btnMqttToggle.className = 'btn-mqtt-status connecting';
    el.btnMqttToggle.title = 'Đang thử kết nối...';
  } else {
    el.btnMqttToggle.textContent = 'MQTT: Không kết nối';
    el.btnMqttToggle.className = 'btn-mqtt-status disconnected';
    el.btnMqttToggle.title = 'Nhấp để kết nối MQTT';
  }
}

export function connectToEspMqtt(ip, onSuccess, onFailure) {
  // Ngắt kết nối MQTT cũ nếu có
  if (state.connection.mqttClient) {
    try {
      state.connection.mqttClient.end();
    } catch (e) {}
    state.connection.mqttClient = null;
    state.connection.mqttConnected = false;
  }

  if (state.connection.watchdogTimer) {
    clearTimeout(state.connection.watchdogTimer);
    state.connection.watchdogTimer = null;
  }
  state.connection.deviceOnline = false;
  updateAllDevicesOnlineStatus(false);
  updateMqttButtonState();

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
  updateMqttButtonState();

  let firstMessageReceived = false;
  
  client.on('connect', () => {
    state.connection.mqttConnected = true;
    updateMqttButtonState();

    client.subscribe(sensorTopic, (err) => {
      if (err) {
        console.error(`[Lỗi] Đăng ký nhận dữ liệu cảm biến thất bại: ${err.message}`);
      }
    });

    if (!firstMessageReceived) {
      firstMessageReceived = true;
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
      updateAllDevicesOnlineStatus(false); // Thiết bị ban đầu offline cho tới khi có dữ liệu cảm biến thực tế

      // Đồng bộ ngay ngưỡng cài đặt hiện tại từ Web xuống thiết bị qua controlTopic
      const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
      client.publish(controlTopic, JSON.stringify({
        command: 'settings',
        tempThreshold: state.settings.tempThreshold,
        humidThreshold: state.settings.humidThreshold,
        lightThreshold: state.settings.lightThreshold
      }));

      console.log(`[Hệ thống] Đồng bộ kết nối với IP: ${ip}. Đang chờ thiết bị truyền tải dữ liệu...`);

      // Lấy lịch sử cảm biến từ Backend
      fetchHistoryFromBackend(ip);

      onSuccess();
    }
  });

  client.on('reconnect', () => {
    console.log(`[MQTT Web] Mất kết nối. Đang thử kết nối lại tới Broker...`);
  });

  client.on('offline', () => {
    logSerial(`[MQTT Web] Client rơi vào trạng thái ngoại tuyến (Offline).`, true);
  });

  client.on('close', () => {
    state.connection.mqttConnected = false;
    updateMqttButtonState();
    
    if (state.connection.watchdogTimer) {
      clearTimeout(state.connection.watchdogTimer);
      state.connection.watchdogTimer = null;
    }
    state.connection.deviceOnline = false;
    updateAllDevicesOnlineStatus(false);

    // Đặt lại dữ liệu về 0 khi ngắt kết nối
    state.sensors.temp = 0;
    state.sensors.humid = 0;
    state.sensors.light = 0;
    updateMetricDisplays();
  });

  client.on('message', (topic, message) => {
    if (topic === sensorTopic) {
      try {
        const data = JSON.parse(message.toString());
        
        const tempVal = parseFloat(data.temp) || 0;
        const humidVal = parseFloat(data.humid) || 0;
        const lightVal = parseFloat(data.light) || 0;

        // Bất kỳ gói tin nào nhận được từ sensorTopic đều chứng minh thiết bị đang hoạt động (Online)
        if (!state.connection.deviceOnline) {
          state.connection.deviceOnline = true;
          updateAllDevicesOnlineStatus(true);
          updateMqttButtonState();

          // Tự động kết nối Serial Monitor khi thiết bị online
          if (el.btnSerialConnect && !state.serial.connected) {
            el.btnSerialConnect.click();
          }
        }

        // Đặt lại Watchdog (30 giây) để giám sát hoạt động liên tục
        if (state.connection.watchdogTimer) {
          clearTimeout(state.connection.watchdogTimer);
        }
        state.connection.watchdogTimer = setTimeout(() => {
          state.connection.deviceOnline = false;
          updateAllDevicesOnlineStatus(false);
          updateMqttButtonState();
          
          // Khi mất kết nối tạm thời, chúng ta giữ nguyên giá trị cảm biến cuối cùng trên giao diện,
          // KHÔNG đặt về 0 để tránh làm biểu đồ bị rơi thẳng xuống 0 (nhọn gãy) gây sai lệch dữ liệu trực quan.
          
          // Tự động ngắt Serial Monitor và thông báo
          if (state.serial.connected && el.btnSerialConnect) {
            el.btnSerialConnect.click();
          }
          if (el.serialTerminal) {
            el.serialTerminal.innerHTML = '<div class="terminal-line" id="placeholderLine"><span class="terminal-msg system">Mất kết nối tới thiết bị (Watchdog Timeout)...</span></div><div class="terminal-cursor" id="terminalCursor">_</div>';
          }
        }, 30000);

        // Cập nhật dữ liệu cảm biến thực tế khi nhận được gói tin từ phần cứng
        state.sensors.temp = tempVal;
        state.sensors.humid = humidVal;
        state.sensors.light = lightVal;

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
    state.connection.mqttConnected = false;
    updateMqttButtonState();
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

  if (el.btnMqttToggle) {
    el.btnMqttToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!state.connection.activeIp) return;

      if (state.connection.mqttConnected) {
        logSerial(`[MQTT Web] Đang ngắt kết nối theo yêu cầu người dùng...`, false, true);
        if (state.connection.mqttClient) {
          try {
            state.connection.mqttClient.end();
          } catch (err) {}
          state.connection.mqttClient = null;
        }
        state.connection.mqttConnected = false;

        if (state.connection.watchdogTimer) {
          clearTimeout(state.connection.watchdogTimer);
          state.connection.watchdogTimer = null;
        }
        state.connection.deviceOnline = false;
        updateAllDevicesOnlineStatus(false);

        state.sensors.temp = 0;
        state.sensors.humid = 0;
        state.sensors.light = 0;
        updateMetricDisplays();

        updateMqttButtonState();
      } else {
        el.btnMqttToggle.textContent = 'MQTT: Đang kết nối...';
        el.btnMqttToggle.className = 'btn-mqtt-status connecting';
        
        connectToEspMqtt(
          state.connection.activeIp,
          () => {
            updateMqttButtonState();
          },
          (err) => {
            updateMqttButtonState();
            alert(`Lỗi kết nối MQTT: ${err}`);
          }
        );
      }
    });
  }

  if (el.connectionStatusBlock) {
    el.connectionStatusBlock.style.cursor = 'pointer';
    el.connectionStatusBlock.title = 'Click để ngắt kết nối thiết bị';
    el.connectionStatusBlock.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn ngắt kết nối tới thiết bị ESP32 hiện tại?')) {
        disconnectActiveDevice();
      }
    });
  }
}

export function disconnectActiveDevice() {
  if (!state.connection.activeIp) return;
  
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

  if (state.connection.watchdogTimer) {
    clearTimeout(state.connection.watchdogTimer);
    state.connection.watchdogTimer = null;
  }
  state.connection.deviceOnline = false;
  updateAllDevicesOnlineStatus(false);

  // Đặt lại dữ liệu về 0 khi ngắt kết nối
  state.sensors.temp = 0;
  state.sensors.humid = 0;
  state.sensors.light = 0;
  updateMetricDisplays();
  updateMqttButtonState();

  if (state.serial.connected && el.btnSerialConnect) {
    try {
      el.btnSerialConnect.click();
    } catch (e) {}
  }
  checkWorkspaceLock();
  renderRegisteredNodes();
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

function fetchHistoryFromBackend(ip) {
  const API_BASE = 'http://127.0.0.1:5000/api';
  console.log(`[Hệ thống] Đang tải lịch sử cảm biến cho thiết bị ${ip} từ MongoDB...`);
  
  fetch(`${API_BASE}/sensors/history?ip=${ip}&limit=8`)
    .then(res => res.json())
    .then(async (resData) => {
      if (resData.success && resData.data && resData.data.length > 0) {
        const { chartLabels, baseTempData, baseHumidData, baseLightData, tempChart, humidChart, lightChart, useFallbackCharts } = await import('../charts/charts-state.js');
        const { drawFallbackCharts } = await import('../charts/charts-fallback.js');
        
        // Làm trống dữ liệu ban đầu
        chartLabels.length = 0;
        baseTempData.length = 0;
        baseHumidData.length = 0;
        baseLightData.length = 0;
        
        // Nạp dữ liệu lịch sử nhận được
        resData.data.forEach(log => {
          const timeStr = new Date(log.createdAt).toTimeString().split(' ')[0];
          chartLabels.push(timeStr);
          baseTempData.push(log.temp);
          baseHumidData.push(log.humid);
          baseLightData.push(log.light);
        });
        
        // Cập nhật giá trị hiển thị tức thời theo log mới nhất
        const latest = resData.data[resData.data.length - 1];
        state.sensors.temp = latest.temp;
        state.sensors.humid = latest.humid;
        state.sensors.light = latest.light;
        
        if (el.valTemp) el.valTemp.textContent = state.sensors.temp.toFixed(1);
        if (el.valHumid) el.valHumid.textContent = state.sensors.humid;
        if (el.valLight) el.valLight.textContent = state.sensors.light;
        if (el.chartValTemp) el.chartValTemp.textContent = `${state.sensors.temp.toFixed(1)} °C`;
        if (el.chartValHumid) el.chartValHumid.textContent = `${state.sensors.humid} %`;
        if (el.chartValLight) el.chartValLight.textContent = `${state.sensors.light} lux`;
        
        // Đặt thiết bị sang trạng thái online vì đã có dữ liệu
        state.connection.deviceOnline = true;
        updateAllDevicesOnlineStatus(true);
        updateMqttButtonState();
        
        // Vẽ lại đồ thị
        if (useFallbackCharts.val) {
          drawFallbackCharts();
        } else {
          if (tempChart.val) tempChart.val.update('none');
          if (humidChart.val) humidChart.val.update('none');
          if (lightChart.val) lightChart.val.update('none');
        }
        
        logSerial(`[Backend] Đã khôi phục thành công ${resData.data.length} điểm dữ liệu lịch sử từ MongoDB.`, false, true);
      }
    })
    .catch(err => {
      console.warn('[Cảnh báo] Lỗi kết nối API lịch sử cảm biến:', err);
    });
}
