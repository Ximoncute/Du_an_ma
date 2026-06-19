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
    });
  }

  if (el.toggleDoorHallway) {
    el.toggleDoorHallway.addEventListener('change', (e) => {
      const checked = e.target.checked;
      setDeviceActiveState('door_hallway', checked);
      logSerial(`[Lệnh] Cửa thông minh hành lang -> ${checked ? 'MỞ KHÓA' : 'KHÓA CỬA'}`);
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

  const quickStateBtns = [el.btnQuickAllOn, el.btnQuickAllOff, el.btnQuickAway, el.btnQuickNight];
  const setActiveQuickControl = (activeBtn) => {
    quickStateBtns.forEach(btn => btn && btn.classList.remove('active-all'));
    activeBtn && activeBtn.classList.add('active-all');
  };

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
