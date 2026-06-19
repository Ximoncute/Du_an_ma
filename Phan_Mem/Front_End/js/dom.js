// js/dom.js
export const el = {};

export function initDomSelectors() {
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);
  
  // Navigation
  el.menuItems = $$('.sidebar-menu .menu-item');
  el.tabContents = $$('.tab-content');
  el.sidebar = $('appSidebar');
  el.collapseBtn = $('collapseSidebarBtn');
  el.mainWorkspace = $('mainWorkspace');
  el.appContainer = document.querySelector('.app-container');

  // Header & Cards
  el.currentDate = $('currentDateDisplay');
  el.currentTime = $('currentTimeDisplay');
  el.onlineCount = $('headerOnlineCount');
  el.valOnline = $('val-online');
  el.valTemp = $('val-temp');
  el.valHumid = $('val-humidity');
  el.valLight = $('val-light');

  // Chart headers & Quick controls
  el.chartValTemp = $('chart-val-temp');
  el.chartValHumid = $('chart-val-humidity');
  el.chartValLight = $('chart-val-light');
  el.btnQuickAllOn = $('btnQuickAllOn');
  el.btnQuickAllOff = $('btnQuickAllOff');
  el.btnQuickAway = $('btnQuickAway');
  el.btnQuickNight = $('btnQuickNight');
  el.btnQuickRefresh = $('btnQuickRefresh');

  // Filters & Device cards
  el.deviceFilters = $$('#deviceFilters .filter-tab');
  el.devicesGrid = $('devicesGrid');
  el.toggleLightLiving = $('toggle-light_living');
  el.toggleDoorHallway = $('toggle-door_hallway');
  el.btnOpenStream = $('btnOpenStream');

  // Serial Monitor
  el.btnSerialConnect = $('btnSerialConnect');
  el.serialSubtext = $('serialSubtext');
  el.serialTerminal = $('serialTerminal');
  el.serialInput = $('serialInput');
  el.btnSerialSend = $('btnSerialSend');

  // Camera Modal
  el.cameraModal = $('cameraModal');
  el.btnCloseModal = $('btnCloseModal');
  el.cameraCanvas = $('cameraCanvas');
  el.cameraFps = $('cameraFps');
  el.btnCamLeft = $('btnCamLeft');
  el.btnCamRight = $('btnCamRight');
  el.btnCamZoomIn = $('btnCamZoomIn');
  el.btnCamZoomOut = $('btnCamZoomOut');
  el.btnCamSnapshot = $('btnCamSnapshot');
  el.cameraModalName = $('cameraModalName');

  // IP Welcome Lock elements
  el.ipLockOverlay = $('ipLockOverlay');
  el.ipLockInput = $('ipLockInput');
  el.btnIpConnect = $('btnIpConnect');
  el.ipLockError = $('ipLockError');
  el.ipLockSpinnerContainer = $('ipLockSpinnerContainer');
  el.ipLockFormBlock = $('ipLockFormBlock');
  el.ipLockInfoBlock = $('ipLockInfoBlock');
  el.ipLockSpinnerText = $('ipLockSpinnerText');
  el.ipLockLogo = $('ipLockLogo');

  // IP Node Registry elements
  el.btnAddNode = $('btnAddNode');
  el.addNodeFormContainer = $('addNodeFormContainer');
  el.newNodeIpInput = $('newNodeIpInput');
  el.btnSubmitNewNode = $('btnSubmitNewNode');
  el.btnCancelAddNode = $('btnCancelAddNode');
  el.registeredNodeList = $('registeredNodeList');
  el.connectionStatusBlock = document.querySelector('.connection-status');

  // Authentication selectors
  el.authOverlay = $('authOverlay');
  el.tabLoginBtn = $('tabLoginBtn');
  el.tabRegisterBtn = $('tabRegisterBtn');
  el.loginForm = $('loginForm');
  el.registerForm = $('registerForm');
  el.loginUser = $('loginUser');
  el.loginPass = $('loginPass');
  el.registerUser = $('registerUser');
  el.registerPass = $('registerPass');
  el.registerConfirmPass = $('registerConfirmPass');
  el.loginError = $('loginError');
  el.registerError = $('registerError');
  el.registerSuccess = $('registerSuccess');
  el.btnLogout = $('btnLogout');

  // Settings selectors
  el.settingsGatewayIp = $('settingsGatewayIp');
  el.btnSaveGatewayIp = $('btnSaveGatewayIp');
  el.settingsTempThreshold = $('settingsTempThreshold');
  el.settingsLightThreshold = $('settingsLightThreshold');
  el.settingsCameraMode = $('settingsCameraMode');

  // Profile selectors
  el.profileAvatarInput = $('profileAvatarInput');
  el.profileAvatarPreview = $('profileAvatarPreview');
  el.profileFullName = $('profileFullName');
  el.profileDob = $('profileDob');
  el.profilePhone = $('profilePhone');
  el.profileEmail = $('profileEmail');
  el.btnSaveProfile = $('btnSaveProfile');

  // Support selectors
  el.supportChatMessages = $('supportChatMessages');
  el.supportChatInput = $('supportChatInput');
  el.supportBtnSend = $('supportBtnSend');
}
