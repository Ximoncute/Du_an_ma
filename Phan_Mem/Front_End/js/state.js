// js/state.js
export const state = {
  sensors: {
    temp: 28.5,
    humid: 72,
    light: 450
  },
  connection: {
    connected: true,
    activeIp: null, // Always require IP connection on page load
    registeredIps: JSON.parse(localStorage.getItem('registeredIps')) || ['192.168.1.100']
  },
  devices: {
    light_living: { name: 'Đèn thông minh', room: 'Phòng khách', status: 'online', active: true, stateText: 'Đang bật', time: '10 giây trước' },
    door_hallway: { name: 'Cửa thông minh', room: 'Hành lang', status: 'online', active: false, stateText: 'Đã đóng', time: '30 phút trước' }
  },
  serial: {
    connected: false,
    intervalId: null,
    lines: []
  },
  camera: {
    isOpen: false,
    panX: 0,
    zoom: 1.0,
    animFrameId: null,
    noiseOffset: 0,
    scanlineY: 0,
    fps: 30,
    lastFrameTime: performance.now()
  },
  auth: {
    currentUser: localStorage.getItem('currentUser') || null,
    users: JSON.parse(localStorage.getItem('smarthome_users')) || [
      { username: 'admin', password: 'password123' } // Tài khoản mặc định
    ]
  },
  settings: {
    tempThreshold: parseFloat(localStorage.getItem('settingsTempThreshold')) || 38,
    lightThreshold: parseFloat(localStorage.getItem('settingsLightThreshold')) || 800
  },
  lcdText: ''
};
