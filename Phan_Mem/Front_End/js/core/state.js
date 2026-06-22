// js/state.js
export const state = {
  sensors: {
    temp: 0,
    humid: 0,
    light: 0
  },
  connection: {
    connected: true,
    activeIp: null, // Always require IP connection on page load
    registeredIps: JSON.parse(localStorage.getItem('registeredIps')) || [],
    mqttClient: null,
    mqttConnected: false,
    deviceOnline: false,
    watchdogTimer: null
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
    humidThreshold: parseFloat(localStorage.getItem('settingsHumidThreshold')) || 70,
    lightThreshold: parseFloat(localStorage.getItem('settingsLightThreshold')) || 800
  },
  profile: {
    avatar: localStorage.getItem('profile_avatar') || '',
    fullName: localStorage.getItem('profile_fullName') || 'Nguyễn Văn A',
    dob: localStorage.getItem('profile_dob') || '1998-01-01',
    phone: localStorage.getItem('profile_phone') || '0987654321',
    email: localStorage.getItem('profile_email') || 'nguyenvana@gmail.com'
  },
  lcdText: ''
};
