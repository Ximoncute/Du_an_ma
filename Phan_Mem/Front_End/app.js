// SmartHome IoT Dashboard Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  // --- APP STATE ---
  const state = {
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
    }
  };

  // --- DOM ELEMENTS ---
  const el = {
    // Navigation
    menuItems: document.querySelectorAll('.sidebar-menu .menu-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    sidebar: document.getElementById('appSidebar'),
    collapseBtn: document.getElementById('collapseSidebarBtn'),
    mainWorkspace: document.getElementById('mainWorkspace'),
    
    // Header
    currentDate: document.getElementById('currentDateDisplay'),
    onlineCount: document.getElementById('headerOnlineCount'),
    
    // Cards
    valOnline: document.getElementById('val-online'),
    valTemp: document.getElementById('val-temp'),
    valHumid: document.getElementById('val-humidity'),
    valLight: document.getElementById('val-light'),
    
    // Chart headers
    chartValTemp: document.getElementById('chart-val-temp'),
    chartValHumid: document.getElementById('chart-val-humidity'),
    chartValLight: document.getElementById('chart-val-light'),
    
    // Quick controls
    btnQuickAllOn: document.getElementById('btnQuickAllOn'),
    btnQuickAllOff: document.getElementById('btnQuickAllOff'),
    btnQuickAway: document.getElementById('btnQuickAway'),
    btnQuickNight: document.getElementById('btnQuickNight'),
    btnQuickRefresh: document.getElementById('btnQuickRefresh'),
    
    // Filters & Device cards
    deviceFilters: document.querySelectorAll('#deviceFilters .filter-tab'),
    devicesGrid: document.getElementById('devicesGrid'),
    toggleLightLiving: document.getElementById('toggle-light_living'),
    toggleDoorHallway: document.getElementById('toggle-door_hallway'),
    btnOpenStream: document.getElementById('btnOpenStream'),
    
    // Serial Monitor
    btnSerialConnect: document.getElementById('btnSerialConnect'),
    serialSubtext: document.getElementById('serialSubtext'),
    serialTerminal: document.getElementById('serialTerminal'),
    serialInput: document.getElementById('serialInput'),
    btnSerialSend: document.getElementById('btnSerialSend'),
    
    // Camera Modal
    cameraModal: document.getElementById('cameraModal'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    cameraCanvas: document.getElementById('cameraCanvas'),
    cameraFps: document.getElementById('cameraFps'),
    btnCamLeft: document.getElementById('btnCamLeft'),
    btnCamRight: document.getElementById('btnCamRight'),
    btnCamZoomIn: document.getElementById('btnCamZoomIn'),
    btnCamZoomOut: document.getElementById('btnCamZoomOut'),
    btnCamSnapshot: document.getElementById('btnCamSnapshot'),
    cameraModalName: document.getElementById('cameraModalName'),

    // IP Welcome Lock elements
    ipLockOverlay: document.getElementById('ipLockOverlay'),
    ipLockInput: document.getElementById('ipLockInput'),
    btnIpConnect: document.getElementById('btnIpConnect'),
    ipLockError: document.getElementById('ipLockError'),
    ipLockSpinnerContainer: document.getElementById('ipLockSpinnerContainer'),
    ipLockFormBlock: document.getElementById('ipLockFormBlock'),
    ipLockInfoBlock: document.getElementById('ipLockInfoBlock'),
    ipLockSpinnerText: document.getElementById('ipLockSpinnerText'),
    ipLockLogo: document.getElementById('ipLockLogo'),
    
    // IP Node Registry elements
    btnAddNode: document.getElementById('btnAddNode'),
    addNodeFormContainer: document.getElementById('addNodeFormContainer'),
    newNodeIpInput: document.getElementById('newNodeIpInput'),
    btnSubmitNewNode: document.getElementById('btnSubmitNewNode'),
    btnCancelAddNode: document.getElementById('btnCancelAddNode'),
    registeredNodeList: document.getElementById('registeredNodeList'),
    
    // Sidebar status container
    connectionStatusBlock: document.querySelector('.connection-status')
  };

  // --- INITIALIZATION ---
  updateDateTime();
  setInterval(updateDateTime, 1000);
  initTabNavigation();
  initSidebarCollapse();
  initDeviceControls();
  initSerialMonitor();
  initCameraStream();
  initIpConnectionLock();
  initIpRegistryManager();
  startSensorFluctuations();
  updateDeviceOnlineCount();

  // Pre-fill Welcome input with last active IP from localStorage
  const savedIp = localStorage.getItem('activeIp');
  if (savedIp && el.ipLockInput) {
    el.ipLockInput.value = savedIp;
  }

  // --- DYNAMIC DATETIME (Vietnamese format) ---
  function updateDateTime() {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = now.getMonth() + 1; 
    const year = now.getFullYear();
    
    if (el.currentDate) {
      el.currentDate.textContent = `${dayName}, ${day} tháng ${month}, ${year}`;
    }
  }

  // --- TAB NAVIGATION ---
  function initTabNavigation() {
    el.menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        
        el.menuItems.forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');
        
        el.tabContents.forEach(tc => tc.classList.remove('active'));
        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) activeTab.classList.add('active');
        
        // Update hash in URL
        window.location.hash = tabId;
        
        // If switching to dashboard, redraw fallback charts if necessary
        if (tabId === 'dashboard' && useFallbackCharts && state.connection.activeIp) {
          setTimeout(drawFallbackCharts, 50);
        }
      });
    });

    // Check URL hash on page load
    const hash = window.location.hash.substring(1);
    if (hash) {
      const activeMenuItem = document.querySelector(`.sidebar-menu .menu-item[data-tab="${hash}"]`);
      if (activeMenuItem) {
        activeMenuItem.click();
      }
    }
  }

  // --- SIDEBAR COLLAPSE ---
  function initSidebarCollapse() {
    if (el.collapseBtn && el.sidebar && el.mainWorkspace) {
      el.collapseBtn.addEventListener('click', () => {
        el.sidebar.classList.toggle('collapsed');
        
        if (el.sidebar.classList.contains('collapsed')) {
          el.sidebar.style.width = '80px';
          el.mainWorkspace.style.marginLeft = '80px';
          el.mainWorkspace.style.width = 'calc(100% - 80px)';
          el.collapseBtn.querySelector('i').className = 'fa-solid fa-angle-right';
          document.querySelectorAll('.logo-info, .status-info, .sidebar-menu span').forEach(node => {
            node.style.display = 'none';
          });
        } else {
          el.sidebar.style.width = 'var(--sidebar-width)';
          el.mainWorkspace.style.marginLeft = 'var(--sidebar-width)';
          el.mainWorkspace.style.width = 'calc(100% - var(--sidebar-width))';
          el.collapseBtn.querySelector('i').className = 'fa-solid fa-angle-left';
          setTimeout(() => {
            if (!el.sidebar.classList.contains('collapsed')) {
              document.querySelectorAll('.logo-info, .status-info, .sidebar-menu span').forEach(node => {
                node.style.display = 'flex';
                if (node.tagName === 'SPAN') node.style.display = 'inline';
              });
            }
          }, 100);
        }
        
        // Redraw fallback charts to match new dimensions
        if (useFallbackCharts && state.connection.activeIp) {
          setTimeout(drawFallbackCharts, 150);
        }
      });
    }
  }

  // --- WELCOME CONNECTION LOCK & DISCONNECT ---
  function initIpConnectionLock() {
    // Check initial overlay state
    checkWorkspaceLock();

    // Connection button handler
    if (el.btnIpConnect) {
      el.btnIpConnect.addEventListener('click', () => {
        const ip = el.ipLockInput.value.trim();
        
        // Simple RegExp for IPv4 address validation
        const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        if (!ipPattern.test(ip)) {
          showIpError('Định dạng địa chỉ IP không hợp lệ!');
          return;
        }

        // Show spinner loader
        hideIpError();
        if (el.ipLockFormBlock) el.ipLockFormBlock.style.display = 'none';
        if (el.ipLockInfoBlock) el.ipLockInfoBlock.style.display = 'none';
        if (el.ipLockSpinnerContainer) el.ipLockSpinnerContainer.style.display = 'flex';
        if (el.ipLockSpinnerText) el.ipLockSpinnerText.textContent = `Đang kết nối tới ESP32 tại ${ip}...`;
        if (el.ipLockLogo) el.ipLockLogo.classList.add('connecting');

        // Simulate ESP32 server ping delay
        setTimeout(() => {
          // Success
          state.connection.activeIp = ip;
          localStorage.setItem('activeIp', ip);
          
          // Save node registry
          if (!state.connection.registeredIps.includes(ip)) {
            state.connection.registeredIps.push(ip);
            localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
          }

          // Reset forms UI
          if (el.ipLockFormBlock) el.ipLockFormBlock.style.display = 'flex';
          if (el.ipLockInfoBlock) el.ipLockInfoBlock.style.display = 'block';
          if (el.ipLockSpinnerContainer) el.ipLockSpinnerContainer.style.display = 'none';
          if (el.ipLockLogo) el.ipLockLogo.classList.remove('connecting');

          // Unlock
          checkWorkspaceLock();
          renderRegisteredNodes();
          
          // Chart reload
          initSensorCharts();

          logSerial(`[Hệ thống] Kết nối thành công tới thiết bị Gateway tại địa chỉ: ${ip}`, false, true);
        }, 1200);
      });
    }

    // Connect input Enter trigger
    if (el.ipLockInput) {
      el.ipLockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          el.btnIpConnect.click();
        }
      });
    }

    // Sidebar status click -> Disconnect & Lock screen
    if (el.connectionStatusBlock) {
      el.connectionStatusBlock.style.cursor = 'pointer';
      el.connectionStatusBlock.title = 'Click để ngắt kết nối thiết bị';
      el.connectionStatusBlock.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn ngắt kết nối tới thiết bị ESP32 hiện tại?')) {
          // Disconnect
          logSerial(`[Hệ thống] Đã ngắt kết nối thiết bị có IP: ${state.connection.activeIp}`, true);
          
          state.connection.activeIp = null;
          localStorage.removeItem('activeIp');
          
          if (state.serial.connected && el.btnSerialConnect) {
            el.btnSerialConnect.click(); // disconnect terminal if open
          }

          checkWorkspaceLock();
          renderRegisteredNodes();
        }
      });
    }
  }

  function checkWorkspaceLock() {
    const activeIp = state.connection.activeIp;
    
    if (!activeIp) {
      // Show overlay
      if (el.ipLockOverlay) el.ipLockOverlay.classList.remove('hidden');
      
      // Update sidebar status offline
      const statusText = document.getElementById('connectionText');
      const statusIp = document.getElementById('connectionIp');
      const statusDot = document.getElementById('connectionDot');
      
      if (statusText) statusText.textContent = 'Chưa kết nối';
      if (statusIp) statusIp.textContent = '---.---.---.---';
      if (statusDot) statusDot.classList.remove('pulse');
      if (el.connectionStatusBlock) el.connectionStatusBlock.style.backgroundColor = '#f1f5f9';
      if (statusText) statusText.style.color = 'var(--text-muted)';
    } else {
      // Hide overlay
      if (el.ipLockOverlay) el.ipLockOverlay.classList.add('hidden');
      
      // Update sidebar status online
      const statusText = document.getElementById('connectionText');
      const statusIp = document.getElementById('connectionIp');
      const statusDot = document.getElementById('connectionDot');
      
      if (statusText) statusText.textContent = 'Đã kết nối';
      if (statusIp) statusIp.textContent = activeIp;
      if (statusDot) statusDot.classList.add('pulse');
      if (el.connectionStatusBlock) el.connectionStatusBlock.style.backgroundColor = ''; // restore CSS var
      if (statusText) statusText.style.color = '';
      
      // Update ESP title in Devices tab
      const espIpTitle = document.getElementById('state-title-esp32');
      if (espIpTitle) espIpTitle.textContent = `Băng tần 2.4GHz`;
      const espIpTime = document.querySelector('[data-device-id="esp32_node"] .state-time');
      if (espIpTime) espIpTime.textContent = `IP: ${activeIp}`;
      
      // Pre-fill Welcome input with current IP
      if (el.ipLockInput) el.ipLockInput.value = activeIp;
    }
  }

  function showIpError(msg) {
    if (el.ipLockError) {
      el.ipLockError.style.display = 'flex';
      el.ipLockError.querySelector('span').textContent = msg;
    }
  }

  function hideIpError() {
    if (el.ipLockError) {
      el.ipLockError.style.display = 'none';
    }
  }

  // --- IP REGISTRY MANAGER (Devices tab) ---
  function initIpRegistryManager() {
    renderRegisteredNodes();

    // Toggle "+" add node form
    if (el.btnAddNode) {
      el.btnAddNode.addEventListener('click', () => {
        el.addNodeFormContainer.classList.toggle('active');
        if (el.addNodeFormContainer.classList.contains('active')) {
          el.newNodeIpInput.focus();
        }
      });
    }

    // Submit new IP node
    if (el.btnSubmitNewNode) {
      el.btnSubmitNewNode.addEventListener('click', () => {
        const ip = el.newNodeIpInput.value.trim();
        const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        
        if (!ipPattern.test(ip)) {
          alert('Địa chỉ IP không hợp lệ! Vui lòng nhập đúng định dạng IPv4 (ví dụ: 192.168.1.105)');
          return;
        }

        if (state.connection.registeredIps.includes(ip)) {
          alert('Địa chỉ IP này đã có trong danh sách!');
          return;
        }

        // Add & Save
        state.connection.registeredIps.push(ip);
        localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
        
        el.newNodeIpInput.value = '';
        el.addNodeFormContainer.classList.remove('active');
        
        renderRegisteredNodes();
        logSerial(`[Hệ thống] Đăng ký thành công IP Node mới: ${ip}`, false, true);
      });
    }

    // Node Input Enter key binding
    if (el.newNodeIpInput) {
      el.newNodeIpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') el.btnSubmitNewNode.click();
      });
    }

    // Cancel add node
    if (el.btnCancelAddNode) {
      el.btnCancelAddNode.addEventListener('click', () => {
        el.newNodeIpInput.value = '';
        el.addNodeFormContainer.classList.remove('active');
      });
    }
  }

  function renderRegisteredNodes() {
    if (!el.registeredNodeList) return;

    el.registeredNodeList.innerHTML = '';
    
    state.connection.registeredIps.forEach(ip => {
      const isActive = (ip === state.connection.activeIp);
      
      const li = document.createElement('li');
      li.className = `node-item${isActive ? ' active' : ''}`;
      li.setAttribute('data-ip', ip);
      
      // Node Info wrapper
      const infoWrapper = document.createElement('div');
      infoWrapper.className = 'node-item-info';
      
      const icon = document.createElement('div');
      icon.className = 'node-item-icon';
      icon.innerHTML = isActive ? '<i class="fa-solid fa-link"></i>' : '<i class="fa-solid fa-microchip"></i>';
      
      const details = document.createElement('div');
      
      const ipText = document.createElement('div');
      ipText.className = 'node-ip-text';
      ipText.textContent = ip;
      
      const statusText = document.createElement('div');
      statusText.className = 'node-status-desc';
      statusText.textContent = isActive ? 'Đang hoạt động (Connected)' : 'Ngoại tuyến (Nhấp để kết nối)';
      
      details.appendChild(ipText);
      details.appendChild(statusText);
      infoWrapper.appendChild(icon);
      infoWrapper.appendChild(details);
      
      // Node Actions wrapper (Connect & Delete button)
      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'node-item-actions';
      
      if (!isActive) {
        const connectBtn = document.createElement('button');
        connectBtn.className = 'btn-connect-node';
        connectBtn.textContent = 'Kết nối';
        connectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          switchActiveNodeIp(ip);
        });
        actionsWrapper.appendChild(connectBtn);
        
        // Only allow deleting non-default and inactive nodes
        if (ip !== '192.168.1.100') {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn-delete-node';
          deleteBtn.title = 'Xóa địa chỉ IP này';
          deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Bạn có chắc chắn muốn xóa địa chỉ IP ${ip} khỏi danh sách?`)) {
              state.connection.registeredIps = state.connection.registeredIps.filter(item => item !== ip);
              localStorage.setItem('registeredIps', JSON.stringify(state.connection.registeredIps));
              renderRegisteredNodes();
            }
          });
          actionsWrapper.appendChild(deleteBtn);
        }
      }
      
      li.appendChild(infoWrapper);
      li.appendChild(actionsWrapper);
      
      // Click on entire node card to switch
      li.addEventListener('click', () => {
        if (!isActive) {
          switchActiveNodeIp(ip);
        }
      });
      
      el.registeredNodeList.appendChild(li);
    });
  }

  function switchActiveNodeIp(ip) {
    // Show connecting loader
    if (el.ipLockOverlay) el.ipLockOverlay.classList.remove('hidden');
    if (el.ipLockFormBlock) el.ipLockFormBlock.style.display = 'none';
    if (el.ipLockInfoBlock) el.ipLockInfoBlock.style.display = 'none';
    if (el.ipLockSpinnerContainer) el.ipLockSpinnerContainer.style.display = 'flex';
    if (el.ipLockSpinnerText) el.ipLockSpinnerText.textContent = `Đang chuyển kết nối tới Node tại ${ip}...`;
    if (el.ipLockLogo) el.ipLockLogo.classList.add('connecting');
    
    // Clear old state & disconnect serial
    if (state.serial.connected && el.btnSerialConnect) {
      el.btnSerialConnect.click(); // disconnect
    }

    setTimeout(() => {
      // Success
      state.connection.activeIp = ip;
      localStorage.setItem('activeIp', ip);
      
      // Reset forms UI
      if (el.ipLockFormBlock) el.ipLockFormBlock.style.display = 'flex';
      if (el.ipLockInfoBlock) el.ipLockInfoBlock.style.display = 'block';
      if (el.ipLockSpinnerContainer) el.ipLockSpinnerContainer.style.display = 'none';
      if (el.ipLockLogo) el.ipLockLogo.classList.remove('connecting');
      
      checkWorkspaceLock();
      renderRegisteredNodes();
      
      // Reset sensor charts values
      state.sensors.temp = 28.5;
      state.sensors.humid = 72;
      state.sensors.light = 450;
      updateMetricDisplays();
      initSensorCharts(); // reload charts
      
      logSerial(`[Hệ thống] Đã chuyển kết nối thành công tới IP Node: ${ip}`, false, true);
    }, 1000);
  }

  // --- SENSOR CHARTS ---
  let tempChart, humidChart, lightChart;
  let useFallbackCharts = false;
  
  const chartLabels = ['00:00', '04:00', '08:00', '12:00', '16:00'];
  const baseTempData = [20.5, 18.2, 23.4, 32.1, 28.5];
  const baseHumidData = [55, 75, 68, 45, 72];
  const baseLightData = [0, 0, 150, 450, 410];

  function initSensorCharts() {
    if (!state.connection.activeIp) return; // Don't draw if locked

    // 1. Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js is not loaded. Activating custom Canvas 2D fallbacks.');
      useFallbackCharts = true;
      drawFallbackCharts();
      window.addEventListener('resize', drawFallbackCharts);
      return;
    }

    try {
      const fontConfig = { family: "'Inter', sans-serif", size: 11, weight: 500 };
      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: "'Inter', sans-serif", size: 12, weight: 600 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: fontConfig, color: '#94a3b8' }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: fontConfig, color: '#94a3b8' }
          }
        },
        elements: {
          line: { tension: 0.4, borderWidth: 2 },
          point: { radius: 0, hoverRadius: 5 }
        }
      };

      // Temperature Chart
      const canvasTemp = document.getElementById('tempChart');
      if (canvasTemp) {
        const ctxTemp = canvasTemp.getContext('2d');
        const gradTemp = ctxTemp.createLinearGradient(0, 0, 0, 180);
        gradTemp.addColorStop(0, 'rgba(76, 175, 80, 0.25)');
        gradTemp.addColorStop(1, 'rgba(76, 175, 80, 0.0)');

        if (tempChart) tempChart.destroy(); // destroy old chart if switching IPs
        tempChart = new Chart(ctxTemp, {
          type: 'line',
          data: {
            labels: chartLabels,
            datasets: [{
              data: [...baseTempData],
              borderColor: '#4caf50',
              backgroundColor: gradTemp,
              fill: true
            }]
          },
          options: commonOptions
        });
      }

      // Humidity Chart
      const canvasHumid = document.getElementById('humidChart');
      if (canvasHumid) {
        const ctxHumid = canvasHumid.getContext('2d');
        const gradHumid = ctxHumid.createLinearGradient(0, 0, 0, 180);
        gradHumid.addColorStop(0, 'rgba(25, 118, 210, 0.25)');
        gradHumid.addColorStop(1, 'rgba(25, 118, 210, 0.0)');

        if (humidChart) humidChart.destroy();
        humidChart = new Chart(ctxHumid, {
          type: 'line',
          data: {
            labels: chartLabels,
            datasets: [{
              data: [...baseHumidData],
              borderColor: '#1976d2',
              backgroundColor: gradHumid,
              fill: true
            }]
          },
          options: commonOptions
        });
      }

      // Light Chart
      const canvasLight = document.getElementById('lightChart');
      if (canvasLight) {
        const ctxLight = canvasLight.getContext('2d');
        const gradLight = ctxLight.createLinearGradient(0, 0, 0, 180);
        gradLight.addColorStop(0, 'rgba(217, 119, 6, 0.25)');
        gradLight.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

        if (lightChart) lightChart.destroy();
        lightChart = new Chart(ctxLight, {
          type: 'line',
          data: {
            labels: chartLabels,
            datasets: [{
              data: [...baseLightData],
              borderColor: '#d97706',
              backgroundColor: gradLight,
              fill: true
            }]
          },
          options: commonOptions
        });
      }

    } catch (err) {
      console.error('Failed to initialize Chart.js, reverting to custom 2D canvas:', err);
      useFallbackCharts = true;
      drawFallbackCharts();
      window.addEventListener('resize', drawFallbackCharts);
    }
  }

  // Draw simulated line charts directly using HTML5 Canvas API
  function drawFallbackCharts() {
    if (!useFallbackCharts || !state.connection.activeIp) return;
    
    drawStaticChart2D('tempChart', baseTempData, '#4caf50', 'Nhiệt độ');
    drawStaticChart2D('humidChart', baseHumidData, '#1976d2', 'Độ ẩm');
    drawStaticChart2D('lightChart', baseLightData, '#d97706', 'Ánh sáng');
  }

  function drawStaticChart2D(canvasId, values, color, labelText) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Fit canvas to display width
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 180;
    
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const padL = 35;
    const padR = 15;
    const padT = 20;
    const padB = 25;
    
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    
    // Compute Y range
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1;
    const valRange = maxVal - minVal || 1;
    
    // Grid rows
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    
    const numRows = 3;
    for (let r = 0; r <= numRows; r++) {
      const y = padT + (chartH / numRows) * r;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      
      // Values on left
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const rowVal = maxVal - (valRange / numRows) * r;
      ctx.fillText(rowVal.toFixed(0), padL - 6, y);
      ctx.setLineDash([4, 4]);
    }
    ctx.setLineDash([]);
    
    // X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < chartLabels.length; i++) {
      const x = padL + (chartW / (chartLabels.length - 1)) * i;
      ctx.fillText(chartLabels[i], x, h - padB + 6);
    }
    
    // Coordinates
    const points = [];
    for (let i = 0; i < values.length; i++) {
      const x = padL + (chartW / (chartLabels.length - 1)) * i;
      const y = h - padB - ((values[i] - minVal) / valRange) * chartH;
      points.push({ x, y });
    }
    
    // Draw gradient
    const grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    if (color === '#4caf50') {
      grad.addColorStop(0, 'rgba(76, 175, 80, 0.22)');
      grad.addColorStop(1, 'rgba(76, 175, 80, 0.0)');
    } else if (color === '#1976d2') {
      grad.addColorStop(0, 'rgba(25, 118, 210, 0.22)');
      grad.addColorStop(1, 'rgba(25, 118, 210, 0.0)');
    } else {
      grad.addColorStop(0, 'rgba(217, 119, 6, 0.22)');
      grad.addColorStop(1, 'rgba(217, 119, 6, 0.0)');
    }
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - padB);
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, h - padB);
    ctx.closePath();
    ctx.fill();
    
    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
    
    // Draw node dots & numbers
    ctx.fillStyle = color;
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillText(values[i].toFixed(1), points[i].x, points[i].y - 5);
    }
  }

  // --- SENSOR DATA RANDOM WALKS ---
  function startSensorFluctuations() {
    setInterval(() => {
      // Don't update if workspace is locked
      if (!state.connection.activeIp) return;

      // 1. Temperature Fluctuation (28.1 - 28.9)
      const tempDelta = (Math.random() - 0.5) * 0.2;
      state.sensors.temp = Math.max(15, Math.min(45, state.sensors.temp + tempDelta));
      
      // 2. Humidity Fluctuation (70% - 74%)
      const humidDelta = Math.floor(Math.random() * 3) - 1; 
      state.sensors.humid = Math.max(10, Math.min(100, state.sensors.humid + humidDelta));
      
      // 3. Light Fluctuation (440 - 460)
      const lightDelta = Math.floor(Math.random() * 11) - 5; 
      state.sensors.light = Math.max(0, Math.min(1000, state.sensors.light + lightDelta));

      updateMetricDisplays();
    }, 3000);
  }

  function updateMetricDisplays() {
    if (!state.connection.activeIp) return;

    // Card values
    if (el.valTemp) el.valTemp.textContent = state.sensors.temp.toFixed(1);
    if (el.valHumid) el.valHumid.textContent = state.sensors.humid;
    if (el.valLight) el.valLight.textContent = state.sensors.light;

    // Chart value headers
    if (el.chartValTemp) el.chartValTemp.textContent = `${state.sensors.temp.toFixed(1)} °C`;
    if (el.chartValHumid) el.chartValHumid.textContent = `${state.sensors.humid} %`;
    if (el.chartValLight) el.chartValLight.textContent = `${state.sensors.light} lux`;

    // Push values onto the charts
    baseTempData[baseTempData.length - 1] = parseFloat(state.sensors.temp.toFixed(1));
    baseHumidData[baseHumidData.length - 1] = state.sensors.humid;
    baseLightData[baseLightData.length - 1] = state.sensors.light;

    if (useFallbackCharts) {
      drawFallbackCharts();
    } else {
      if (tempChart) {
        tempChart.data.datasets[0].data[tempChart.data.datasets[0].data.length - 1] = parseFloat(state.sensors.temp.toFixed(1));
        tempChart.update('none');
      }
      if (humidChart) {
        humidChart.data.datasets[0].data[humidChart.data.datasets[0].data.length - 1] = state.sensors.humid;
        humidChart.update('none');
      }
      if (lightChart) {
        lightChart.data.datasets[0].data[lightChart.data.datasets[0].data.length - 1] = state.sensors.light;
        lightChart.update('none');
      }
    }

    // Stream serial line if connected
    if (state.serial.connected) {
      logSerial(`[ESP32] TEMP=${state.sensors.temp.toFixed(1)} C, HUMID=${state.sensors.humid} %, LIGHT=${state.sensors.light} Lux`);
    }
  }

  // --- DEVICE CONTROLS ---
  function initDeviceControls() {
    // 1. Toggles logic
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
        
        // Trigger alert feature if door is open too long (5s)
        if (checked) {
          setTimeout(() => {
            if (state.devices.door_hallway.active) {
              triggerDoorWarning(true);
            }
          }, 5000);
        } else {
          triggerDoorWarning(false);
        }
      });
    }

    // 2. Filters
    el.deviceFilters.forEach(tab => {
      tab.addEventListener('click', () => {
        el.deviceFilters.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const filter = tab.getAttribute('data-filter');
        filterDevices(filter);
      });
    });

    // 3. Quick Controls
    if (el.btnQuickAllOn) {
      el.btnQuickAllOn.addEventListener('click', () => {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = true;
          el.toggleLightLiving.dispatchEvent(new Event('change'));
        }
        logSerial(`[Hệ thống] Đã thực hiện lệnh: Bật tất cả đèn.`);
      });
    }

    if (el.btnQuickAllOff) {
      el.btnQuickAllOff.addEventListener('click', () => {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = false;
          el.toggleLightLiving.dispatchEvent(new Event('change'));
        }
        logSerial(`[Hệ thống] Đã thực hiện lệnh: Tắt tất cả đèn.`);
      });
    }

    if (el.btnQuickAway) {
      el.btnQuickAway.addEventListener('click', () => {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = false;
          el.toggleLightLiving.dispatchEvent(new Event('change'));
        }
        if (el.toggleDoorHallway) {
          el.toggleDoorHallway.checked = false; 
          el.toggleDoorHallway.dispatchEvent(new Event('change'));
        }
        logSerial(`[Hệ thống] Đã kích hoạt Chế độ vắng nhà. Đang bảo mật tối đa.`);
      });
    }

    if (el.btnQuickNight) {
      el.btnQuickNight.addEventListener('click', () => {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = false;
          el.toggleLightLiving.dispatchEvent(new Event('change'));
        }
        if (el.toggleDoorHallway) {
          el.toggleDoorHallway.checked = false; 
          el.toggleDoorHallway.dispatchEvent(new Event('change'));
        }
        logSerial(`[Hệ thống] Đã kích hoạt Chế độ ban đêm. Hệ thống chuyển sang giám sát ngoại vi.`);
      });
    }

    if (el.btnQuickRefresh) {
      el.btnQuickRefresh.addEventListener('click', () => {
        const icon = el.btnQuickRefresh.querySelector('i');
        icon.classList.add('spin');
        el.btnQuickRefresh.disabled = true;
        
        logSerial(`[Hệ thống] Đang làm mới dữ liệu cảm biến...`);
        
        setTimeout(() => {
          icon.classList.remove('spin');
          el.btnQuickRefresh.disabled = false;
          
          state.sensors.temp = 28.5;
          state.sensors.humid = 72;
          state.sensors.light = 450;
          updateMetricDisplays();
          
          logSerial(`[Hệ thống] Đã làm mới dữ liệu cảm biến thành công.`);
        }, 1000);
      });
    }
  }

  function setDeviceActiveState(deviceId, active) {
    if (!state.connection.activeIp) return;
    state.devices[deviceId].active = active;
    const card = document.querySelector(`.device-card[data-device-id="${deviceId}"]`);
    const titleEl = document.getElementById(`state-title-${deviceId}`);
    const timeEl = document.getElementById(`state-time-${deviceId}`);
    
    if (active) {
      if (card) card.classList.add('active');
      if (deviceId === 'light_living') {
        state.devices[deviceId].stateText = 'Đang bật';
      } else if (deviceId === 'door_hallway') {
        state.devices[deviceId].stateText = 'Đã mở';
      }
    } else {
      if (card) card.classList.remove('active');
      if (deviceId === 'light_living') {
        state.devices[deviceId].stateText = 'Đã tắt';
      } else if (deviceId === 'door_hallway') {
        state.devices[deviceId].stateText = 'Đã đóng';
      }
    }
    
    if (titleEl) titleEl.textContent = state.devices[deviceId].stateText;
    if (timeEl) timeEl.textContent = 'Vừa xong';
  }

  function triggerDoorWarning(warningActive) {
    if (!state.connection.activeIp) return;
    const card = document.querySelector(`.device-card[data-device-id="door_hallway"]`);
    const badge = card.querySelector('.device-status-badge');
    const titleEl = document.getElementById('state-title-door_hallway');
    
    if (warningActive) {
      state.devices.door_hallway.status = 'warning';
      badge.textContent = 'Cảnh báo';
      badge.className = 'device-status-badge alert';
      titleEl.textContent = 'Cửa mở quá lâu!';
      titleEl.style.color = 'var(--alert-red)';
      
      logSerial(`[Hệ thống] CẢNH BÁO: Phát hiện cửa hành lang mở quá lâu không đóng!`, true);
    } else {
      state.devices.door_hallway.status = 'online';
      badge.textContent = 'Online';
      badge.className = 'device-status-badge';
      titleEl.textContent = state.devices.door_hallway.active ? 'Đã mở' : 'Đã đóng';
      titleEl.style.color = '';
    }
  }

  function filterDevices(filter) {
    const cards = el.devicesGrid.querySelectorAll('.device-card');
    cards.forEach(card => {
      const deviceId = card.getAttribute('data-device-id');
      if (!deviceId) return;
      const device = state.devices[deviceId];
      if (!device) return;
      
      if (filter === 'all') {
        card.style.display = 'flex';
      } else if (filter === 'online') {
        card.style.display = (device.status === 'online') ? 'flex' : 'none';
      } else if (filter === 'warning') {
        card.style.display = (device.status === 'warning') ? 'flex' : 'none';
      }
    });
  }

  function updateDeviceOnlineCount() {
    const devices = Object.values(state.devices);
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online' || d.status === 'warning').length;
    
    if (el.valOnline) el.valOnline.textContent = online;
    const valTotal = document.getElementById('val-total');
    if (valTotal) valTotal.textContent = `/${total}`;
    
    if (el.onlineCount) {
      el.onlineCount.textContent = `${online}/${total} thiết bị online`;
    }
  }

  // --- SERIAL MONITOR SIMULATION ---
  function initSerialMonitor() {
    if (el.btnSerialConnect) {
      el.btnSerialConnect.addEventListener('click', () => {
        if (!state.connection.activeIp) return;
        state.serial.connected = !state.serial.connected;
        
        if (state.serial.connected) {
          el.btnSerialConnect.classList.add('connected');
          el.btnSerialConnect.querySelector('span').textContent = 'Ngắt kết nối';
          el.serialSubtext.textContent = `Đã kết nối qua Gateway (${state.connection.activeIp})`;
          el.serialSubtext.style.color = 'var(--brand-green)';
          
          el.serialInput.disabled = false;
          el.btnSerialSend.disabled = false;
          
          logSerial('[Hệ thống] Đang thiết lập kết nối tới thiết bị IoT...', false, true);
          setTimeout(() => {
            logSerial(`[Hệ thống] Kết nối thành công! Thiết bị: ESP32. IP: ${state.connection.activeIp}`, false, true);
            logSerial('[Hệ thống] Gõ "HELP" để xem danh sách các lệnh cấu hình.', false, true);
          }, 600);

          // Start stream sensors mock data
          state.serial.intervalId = setInterval(() => {
            if (state.serial.connected && state.connection.activeIp) {
              const dice = Math.random();
              if (dice < 0.2) {
                logSerial(`[ESP32] RSSI=${-50 - Math.floor(Math.random()*20)}dBm (Wifi Signal Strength)`);
              } else if (dice < 0.3) {
                logSerial(`[ESP32] HEAP_FREE=${175000 + Math.floor(Math.random()*15000)} Bytes`);
              }
            }
          }, 5000);
        } else {
          el.btnSerialConnect.classList.remove('connected');
          el.btnSerialConnect.querySelector('span').textContent = 'Kết nối';
          el.serialSubtext.textContent = 'Chưa kết nối — nhấn nút để bắt đầu';
          el.serialSubtext.style.color = '';
          
          el.serialInput.disabled = true;
          el.btnSerialSend.disabled = true;
          
          logSerial('[Hệ thống] Đã ngắt kết nối với thiết bị.', true);
          
          if (state.serial.intervalId) {
            clearInterval(state.serial.intervalId);
            state.serial.intervalId = null;
          }
        }
      });
    }

    if (el.btnSerialSend) {
      el.btnSerialSend.addEventListener('click', handleSerialSend);
    }
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
      } else if (cmd === 'LED_ON') {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = true;
          setDeviceActiveState('light_living', true);
        }
        logSerial('[ESP32] ACK: Đã thực thi BẬT đèn phòng khách.');
      } else if (cmd === 'LED_OFF') {
        if (el.toggleLightLiving) {
          el.toggleLightLiving.checked = false;
          setDeviceActiveState('light_living', false);
        }
        logSerial('[ESP32] ACK: Đã thực thi TẮT đèn phòng khách.');
      } else if (cmd === 'GET_TEMP') {
        logSerial(`[ESP32] Cảm biến DHT11: Nhiệt độ = ${state.sensors.temp.toFixed(1)}°C.`);
      } else if (cmd === 'GET_IP') {
        logSerial(`[ESP32] Trạng thái mạng: IP = ${state.connection.activeIp}.`);
      } else if (cmd === 'REBOOT') {
        logSerial('[ESP32] WARNING: Đang khởi động lại hệ thống...', true);
        setTimeout(() => {
          if (state.serial.connected) {
            el.btnSerialConnect.click(); 
          }
        }, 1000);
      } else {
        logSerial(`[ESP32] ERROR: Lệnh "${rawVal}" không hợp lệ. Gõ HELP để trợ giúp.`, true);
      }
    }, 400);
  }

  function logSerial(msg, isError = false, isSystem = false, type = '') {
    const term = el.serialTerminal;
    if (!term) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const line = document.createElement('div');
    line.className = 'terminal-line';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'terminal-time';
    timeSpan.textContent = `[${timeStr}]`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'terminal-msg';
    if (isError) msgSpan.className += ' error';
    else if (isSystem) msgSpan.className += ' system';
    else if (type === 'sent') msgSpan.className += ' sent';
    msgSpan.textContent = msg;

    line.appendChild(timeSpan);
    line.appendChild(msgSpan);
    
    const cursor = document.getElementById('terminalCursor');
    if (cursor) {
      term.insertBefore(line, cursor.parentNode);
    } else {
      term.appendChild(line);
    }

    term.scrollTop = term.scrollHeight;
  }

  // --- CAMERA OVERLAY MODAL & DYNAMIC STREAM ---
  let canvasCtx = null;
  function initCameraStream() {
    if (el.btnOpenStream) {
      el.btnOpenStream.addEventListener('click', () => {
        openCameraModal();
      });
    }

    if (el.btnCloseModal) {
      el.btnCloseModal.addEventListener('click', () => {
        closeCameraModal();
      });
    }

    if (el.cameraModal) {
      el.cameraModal.addEventListener('click', (e) => {
        if (e.target === el.cameraModal) {
          closeCameraModal();
        }
      });
    }

    // Interactive camera pan & zoom controls
    if (el.btnCamLeft) {
      el.btnCamLeft.addEventListener('click', () => {
        state.camera.panX = Math.max(-100, state.camera.panX - 15);
        logSerial(`[Camera] Xoay ống kính sang Trái: PanOffset = ${state.camera.panX}`);
      });
    }
    if (el.btnCamRight) {
      el.btnCamRight.addEventListener('click', () => {
        state.camera.panX = Math.min(100, state.camera.panX + 15);
        logSerial(`[Camera] Xoay ống kính sang Phải: PanOffset = ${state.camera.panX}`);
      });
    }
    if (el.btnCamZoomIn) {
      el.btnCamZoomIn.addEventListener('click', () => {
        state.camera.zoom = Math.min(3.0, state.camera.zoom + 0.2);
        logSerial(`[Camera] Phóng to: Zoom = ${state.camera.zoom.toFixed(1)}x`);
      });
    }
    if (el.btnCamZoomOut) {
      el.btnCamZoomOut.addEventListener('click', () => {
        state.camera.zoom = Math.max(1.0, state.camera.zoom - 0.2);
        logSerial(`[Camera] Thu nhỏ: Zoom = ${state.camera.zoom.toFixed(1)}x`);
      });
    }
    if (el.btnCamSnapshot) {
      el.btnCamSnapshot.addEventListener('click', () => {
        triggerSnapshotEffect();
      });
    }
  }

  function openCameraModal() {
    if (!el.cameraModal) return;
    
    state.camera.isOpen = true;
    el.cameraModal.classList.add('active');
    
    const canvas = el.cameraCanvas;
    canvas.width = 1280;
    canvas.height = 720;
    canvasCtx = canvas.getContext('2d');
    
    logSerial('[Camera] Khởi động luồng truyền trực tiếp 720p...');
    
    state.camera.lastFrameTime = performance.now();
    renderLiveCameraFeed();
  }

  function closeCameraModal() {
    if (!el.cameraModal) return;
    
    state.camera.isOpen = false;
    el.cameraModal.classList.remove('active');
    
    if (state.camera.animFrameId) {
      cancelAnimationFrame(state.camera.animFrameId);
      state.camera.animFrameId = null;
    }
    
    logSerial('[Camera] Đã ngắt luồng truyền trực tiếp để tiết kiệm băng thông.');
  }

  function renderLiveCameraFeed() {
    if (!state.camera.isOpen || !canvasCtx) return;

    const ctx = canvasCtx;
    const w = 1280;
    const h = 720;

    const now = performance.now();
    const elapsed = now - state.camera.lastFrameTime;
    state.camera.lastFrameTime = now;
    state.camera.fps = Math.round(1000 / (elapsed || 33));
    
    if (el.cameraFps) {
      el.cameraFps.textContent = `${state.camera.fps} FPS`;
    }

    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    
    ctx.translate(w / 2, h / 2);
    ctx.scale(state.camera.zoom, state.camera.zoom);
    ctx.translate(-w / 2 + state.camera.panX, -h / 2);

    ctx.fillStyle = '#334155'; 
    ctx.fillRect(100, 100, 1080, 520);
    
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(100, 500);
    ctx.lineTo(1180, 500);
    ctx.lineTo(1280, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    for (let i = -200; i <= 1400; i += 200) {
      ctx.beginPath();
      ctx.moveTo(w/2 + (i - w/2)*0.6, 500);
      ctx.lineTo(i, 720);
      ctx.stroke();
    }

    ctx.fillStyle = '#020617';
    ctx.fillRect(200, 180, 160, 200);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(205, 185, 70, 90);
    ctx.fillRect(285, 185, 70, 90);
    ctx.fillRect(205, 285, 70, 90);
    ctx.fillRect(285, 285, 70, 90);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(900, 540);
    ctx.lineTo(900, 320);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(860, 320);
    ctx.lineTo(940, 320);
    ctx.lineTo(960, 260);
    ctx.lineTo(840, 260);
    ctx.closePath();
    ctx.fill();

    if (state.devices.light_living.active) {
      const gradGlow = ctx.createLinearGradient(900, 320, 900, 540);
      gradGlow.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
      gradGlow.addColorStop(1, 'rgba(253, 224, 71, 0.0)');
      
      ctx.fillStyle = gradGlow;
      ctx.beginPath();
      ctx.moveTo(880, 320);
      ctx.lineTo(920, 320);
      ctx.lineTo(1050, 540);
      ctx.lineTo(750, 540);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(900, 320, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#475569';
    ctx.fillRect(450, 380, 380, 120); 
    ctx.fillStyle = '#334155';
    ctx.fillRect(420, 360, 50, 140); 
    ctx.fillRect(810, 360, 50, 140); 
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(450, 480, 380, 20); 
    
    ctx.fillStyle = '#090d16';
    ctx.fillRect(510, 200, 260, 140);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(510, 200, 260, 140);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(520, 210, 240, 120);

    ctx.restore();

    const timeSecs = Math.floor(now / 1000);
    if (timeSecs % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(60, 50, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText('REC', 80, 58);

    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('CAM_01_LIVINGROOM', 60, 95);
    ctx.fillText('SIGNAL: 98% [EXCELLENT]', 60, 130);

    const rawNow = new Date();
    const liveTimeStr = `${String(rawNow.getHours()).padStart(2, '0')}:${String(rawNow.getMinutes()).padStart(2, '0')}:${String(rawNow.getSeconds()).padStart(2, '0')}.${String(Math.floor(rawNow.getMilliseconds()/100)).padStart(1, '0')}`;
    const liveDateStr = `${rawNow.getFullYear()}-${String(rawNow.getMonth()+1).padStart(2,'0')}-${String(rawNow.getDate()).padStart(2,'0')}`;
    
    ctx.textAlign = 'right';
    ctx.fillText(liveDateStr, w - 60, 58);
    ctx.fillText(liveTimeStr, w - 60, 95);
    ctx.fillText(`ZOOM: ${state.camera.zoom.toFixed(1)}X`, w - 60, 130);
    ctx.textAlign = 'left'; 

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(w/2 - 80, h/2 - 60, 160, 120);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w/2 - 95, h/2 - 50); ctx.lineTo(w/2 - 95, h/2 - 75); ctx.lineTo(w/2 - 70, h/2 - 75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2 + 95, h/2 - 50); ctx.lineTo(w/2 + 95, h/2 - 75); ctx.lineTo(w/2 + 70, h/2 - 75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2 - 95, h/2 + 50); ctx.lineTo(w/2 - 95, h/2 + 75); ctx.lineTo(w/2 - 70, h/2 + 75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w/2 + 95, h/2 + 50); ctx.lineTo(w/2 + 95, h/2 + 75); ctx.lineTo(w/2 + 70, h/2 + 75); ctx.stroke();

    state.camera.scanlineY += 3;
    if (state.camera.scanlineY > h) state.camera.scanlineY = 0;
    
    const gradScan = ctx.createLinearGradient(0, state.camera.scanlineY - 4, 0, state.camera.scanlineY + 4);
    gradScan.addColorStop(0, 'rgba(56, 189, 248, 0)');
    gradScan.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    gradScan.addColorStop(1, 'rgba(56, 189, 248, 0)');
    
    ctx.fillStyle = gradScan;
    ctx.fillRect(0, state.camera.scanlineY - 4, w, 8);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, state.camera.scanlineY);
    ctx.lineTo(60, state.camera.scanlineY);
    ctx.moveTo(w - 60, state.camera.scanlineY);
    ctx.lineTo(w - 20, state.camera.scanlineY);
    ctx.stroke();

    state.camera.animFrameId = requestAnimationFrame(renderLiveCameraFeed);
  }

  function triggerSnapshotEffect() {
    const streamWrapper = document.querySelector('.camera-stream-wrapper');
    if (!streamWrapper) return;

    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = '#ffffff';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.5s ease-out';
    flash.style.zIndex = '999';
    
    streamWrapper.appendChild(flash);
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (err) {
      console.log('Audio Context sound omitted.');
    }

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        flash.remove();
      }, 500);
    }, 50);

    const link = document.createElement('a');
    link.download = `SmartHome_Snapshot_${Date.now()}.png`;
    link.href = el.cameraCanvas.toDataURL();
    link.click();
    
    logSerial('[Camera] Đã lưu ảnh chụp nhanh thành công vào thiết bị của bạn!');
  }
});
