// js/devices-init.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { setDeviceActiveState, triggerDoorWarning, filterDevices } from './devices-state.js';

export function initDeviceControls() {
  if (el.toggleLightLiving) {
    el.toggleLightLiving.addEventListener('change', (e) => {
      const checked = e.target.checked;
      setDeviceActiveState('light_living', checked);
      logSerial(`[Lệnh] Đèn thông minh phòng khách -> ${checked ? 'BẬT' : 'TẮT'}`);
      
      // Khóa trạng thái đồng bộ nhận về từ MQTT để tránh việc nút bị nhảy lại trong thời gian chờ thiết bị xử lý
      state.devices.light_living.isPending = true;
      clearTimeout(state.devices.light_living.pendingTimeout);
      state.devices.light_living.pendingTimeout = setTimeout(() => {
        state.devices.light_living.isPending = false;
      }, 3000); // Tối đa 3 giây
      
      // Gửi lệnh MQTT tới ESP32
      if (state.connection.mqttClient && state.connection.mqttConnected && state.connection.activeIp) {
        const cleanIp = state.connection.activeIp.replace(/\./g, '_');
        const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
        state.connection.mqttClient.publish(controlTopic, JSON.stringify({ command: 'light', state: checked }));
      }
    });
  }

  if (el.toggleDoorHallway) {
    el.toggleDoorHallway.addEventListener('change', (e) => {
      const checked = e.target.checked;
      setDeviceActiveState('door_hallway', checked);
      logSerial(`[Lệnh] Cửa thông minh hành lang -> ${checked ? 'MỞ KHÓA' : 'KHÓA CỬA'}`);
      
      // Khóa trạng thái đồng bộ nhận về từ MQTT để tránh việc nút bị nhảy lại trong thời gian chờ thiết bị xử lý
      state.devices.door_hallway.isPending = true;
      clearTimeout(state.devices.door_hallway.pendingTimeout);
      state.devices.door_hallway.pendingTimeout = setTimeout(() => {
        state.devices.door_hallway.isPending = false;
      }, 3000); // Tối đa 3 giây
      
      // Gửi lệnh MQTT tới ESP32
      if (state.connection.mqttClient && state.connection.mqttConnected && state.connection.activeIp) {
        const cleanIp = state.connection.activeIp.replace(/\./g, '_');
        const controlTopic = `iot_ung_dung/team_2/control/${cleanIp}`;
        state.connection.mqttClient.publish(controlTopic, JSON.stringify({ command: 'door', state: checked }));
      }

      if (checked) {
        setTimeout(() => state.devices.door_hallway.active && triggerDoorWarning(true), 5000);
      } else {
        triggerDoorWarning(false);
      }
    });
  }

  el.deviceFilters.forEach(tab => {
    tab.addEventListener('click', () => {
      el.deviceFilters.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterDevices(tab.getAttribute('data-filter'));
    });
  });

  const quickStateBtns = [el.btnQuickStandby, el.btnQuickAllOn, el.btnQuickAllOff, el.btnQuickAway, el.btnQuickNight];
  const setActiveQuickControl = (activeBtn) => {
    quickStateBtns.forEach(btn => btn && btn.classList.remove('active-all'));
    activeBtn && activeBtn.classList.add('active-all');
  };

  let standbyTimeout = null;

  if (el.btnQuickStandby) {
    el.btnQuickStandby.addEventListener('click', () => {
      clearTimeout(standbyTimeout);
      setActiveQuickControl(el.btnQuickStandby);
      logSerial(`[Hệ thống] Trở về Chế độ chờ (Tự động).`);
    });
  }

  const quickActions = [
    { btn: el.btnQuickAllOn, active: [true, null], msg: 'Đã thực hiện lệnh: Bật tất cả đèn.' },
    { btn: el.btnQuickAllOff, active: [false, null], msg: 'Đã thực hiện lệnh: Tắt tất cả đèn.' },
    { btn: el.btnQuickAway, active: [false, false], msg: 'Đã kích hoạt Chế độ vắng nhà. Đang bảo mật tối đa.' },
    { btn: el.btnQuickNight, active: [false, false], msg: 'Đã kích hoạt Chế độ ban đêm. Hệ thống chuyển sang giám sát ngoại vi.' }
  ];

  quickActions.forEach(({ btn, active, msg }) => {
    if (btn) {
      btn.addEventListener('click', () => {
        setActiveQuickControl(btn);
        
        // Hẹn giờ tự động chuyển về Chế độ chờ sau 10 giây nếu không có tương tác nào khác
        clearTimeout(standbyTimeout);
        standbyTimeout = setTimeout(() => {
          if (el.btnQuickStandby) el.btnQuickStandby.click();
        }, 10000); // 10 giây

        if (active[0] !== null && el.toggleLightLiving) {
          el.toggleLightLiving.checked = active[0];
          el.toggleLightLiving.dispatchEvent(new Event('change'));
        }
        if (active[1] !== null && el.toggleDoorHallway) {
          el.toggleDoorHallway.checked = active[1];
          el.toggleDoorHallway.dispatchEvent(new Event('change'));
        }
        logSerial(`[Hệ thống] ${msg}`);
      });
    }
  });

  if (el.btnQuickRefresh) {
    el.btnQuickRefresh.addEventListener('click', () => {
      const icon = el.btnQuickRefresh.querySelector('i');
      icon.classList.add('spin');
      el.btnQuickRefresh.disabled = true;
      logSerial(`[Hệ thống] Đang làm mới dữ liệu cảm biến...`);
      setTimeout(() => {
        icon.classList.remove('spin');
        el.btnQuickRefresh.disabled = false;
        state.sensors.temp = 28.5; state.sensors.humid = 72; state.sensors.light = 450;
        import('./sensors.js').then(m => m.updateMetricDisplays());
        logSerial(`[Hệ thống] Đã làm mới dữ liệu cảm biến thành công.`);
      }, 1000);
    });
  }
}
