// js/auth/auth-init.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { initSensorCharts } from '../charts/charts.js';
import { checkWorkspaceLock } from './auth-lock.js';

export function initAuthentication() {
  if (state.auth.currentUser) {
    if (el.authOverlay) el.authOverlay.style.display = 'none';
    if (el.appContainer) el.appContainer.style.display = 'flex';
  } else {
    if (el.authOverlay) el.authOverlay.style.display = 'flex';
    if (el.appContainer) el.appContainer.style.display = 'none';
  }
  const hideAuthMessages = () => {
    if (el.loginError) el.loginError.style.display = 'none';
    if (el.registerError) el.registerError.style.display = 'none';
    if (el.registerSuccess) el.registerSuccess.style.display = 'none';
  };

  const showRegisterError = (msg) => {
    if (el.registerError) {
      el.registerError.style.display = 'flex';
      el.registerError.querySelector('span').textContent = msg;
    }
  };

  if (el.tabLoginBtn) {
    el.tabLoginBtn.addEventListener('click', () => {
      el.tabLoginBtn.classList.add('active'); el.tabRegisterBtn.classList.remove('active');
      el.loginForm.classList.remove('hidden'); el.registerForm.classList.add('hidden');
      hideAuthMessages();
    });
  }

  if (el.tabRegisterBtn) {
    el.tabRegisterBtn.addEventListener('click', () => {
      el.tabRegisterBtn.classList.add('active'); el.tabLoginBtn.classList.remove('active');
      el.registerForm.classList.remove('hidden'); el.loginForm.classList.add('hidden');
      hideAuthMessages();
    });
  }

  const API_BASE = 'http://127.0.0.1:5000/api';

  if (el.loginForm) {
    el.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = el.loginUser.value.trim();
      const password = el.loginPass.value.trim();
      
      hideAuthMessages();
      
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          state.auth.currentUser = username;
          localStorage.setItem('currentUser', username);
          localStorage.setItem('token', data.token);

          // Cập nhật profile riêng của tài khoản này vào state & localStorage
          if (data.user) {
            state.profile.fullName = data.user.fullName || '';
            state.profile.dob = data.user.dob || '';
            state.profile.phone = data.user.phone || '';
            state.profile.email = data.user.email || '';
            state.profile.avatar = data.user.avatar || '';

            localStorage.setItem('profile_fullName', state.profile.fullName);
            localStorage.setItem('profile_dob', state.profile.dob);
            localStorage.setItem('profile_phone', state.profile.phone);
            localStorage.setItem('profile_email', state.profile.email);
            localStorage.setItem('profile_avatar', state.profile.avatar);

            // Cập nhật lên các ô input của UI ngay lập tức
            const nameInput = document.getElementById('profileFullName');
            const dobInput = document.getElementById('profileDob');
            const phoneInput = document.getElementById('profilePhone');
            const emailInput = document.getElementById('profileEmail');
            const previewImg = document.getElementById('profileAvatarPreview');

            if (nameInput) nameInput.value = state.profile.fullName;
            if (dobInput) dobInput.value = state.profile.dob;
            if (phoneInput) phoneInput.value = state.profile.phone;
            if (emailInput) emailInput.value = state.profile.email;
            if (previewImg) previewImg.src = state.profile.avatar || '';
          }
          
          if (el.authOverlay) el.authOverlay.style.display = 'none';
          if (el.appContainer) el.appContainer.style.display = 'flex';
          hideAuthMessages(); el.loginForm.reset();
          
          // Tự động kết nối MQTT nếu có IP lưu sẵn
          const savedIp = localStorage.getItem('activeIp');
          if (savedIp) {
            import('../connection/ip-connection.js').then(({ switchActiveNodeIp }) => {
              switchActiveNodeIp(savedIp);
            });
          } else {
            checkWorkspaceLock(); initSensorCharts();
          }
          logSerial(`[Hệ thống] Người dùng "${username}" đã đăng nhập thành công.`, false, true);
        } else {
          if (el.loginError) {
            el.loginError.style.display = 'flex';
            el.loginError.querySelector('span').textContent = data.message || 'Tài khoản hoặc mật khẩu không đúng';
          }
        }
      })
      .catch(err => {
        console.error(err);
        if (el.loginError) {
          el.loginError.style.display = 'flex';
          el.loginError.querySelector('span').textContent = 'Lỗi: Không kết nối được tới Server Back-End!';
        }
      });
    });
  }

  if (el.registerForm) {
    el.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = el.registerUser.value.trim();
      const password = el.registerPass.value.trim();
      const confirmPass = el.registerConfirmPass.value.trim();
      
      hideAuthMessages();
      
      if (username.length < 3) return showRegisterError('Tên đăng nhập phải có ít nhất 3 ký tự!');
      if (password.length < 6) return showRegisterError('Mật khẩu phải có ít nhất 6 ký tự!');
      if (password !== confirmPass) return showRegisterError('Mật khẩu xác nhận không khớp!');
      
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (el.registerSuccess) el.registerSuccess.style.display = 'flex';
          el.registerForm.reset();
          setTimeout(() => {
            if (el.tabLoginBtn) el.tabLoginBtn.click();
            if (el.loginUser) el.loginUser.value = username;
            if (el.loginPass) el.loginPass.focus();
          }, 1500);
        } else {
          showRegisterError(data.message || 'Đăng ký tài khoản thất bại');
        }
      })
      .catch(err => {
        console.error(err);
        showRegisterError('Lỗi: Không kết nối được tới Server Back-End!');
      });
    });
  }

  if (el.btnLogout) {
    el.btnLogout.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại?')) {
        state.connection.activeIp = null; localStorage.removeItem('activeIp');
        state.auth.currentUser = null; localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        
        // Xóa thông tin cá nhân trong cache của trình duyệt
        localStorage.removeItem('profile_fullName');
        localStorage.removeItem('profile_dob');
        localStorage.removeItem('profile_phone');
        localStorage.removeItem('profile_email');
        localStorage.removeItem('profile_avatar');
        
        // Reset state của profile
        state.profile.fullName = '';
        state.profile.dob = '';
        state.profile.phone = '';
        state.profile.email = '';
        state.profile.avatar = '';

        if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();
        
        // Ngắt kết nối MQTT client nếu có
        if (state.connection.mqttClient) {
          try {
            state.connection.mqttClient.end();
          } catch(e) {}
          state.connection.mqttClient = null;
          state.connection.mqttConnected = false;
        }

        // Chuyển hướng về giao diện Landing Page
        window.location.href = 'ladingpage.html';
      }
    });
  }
}
