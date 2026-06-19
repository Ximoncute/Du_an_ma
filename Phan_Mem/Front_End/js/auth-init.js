// js/auth-init.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { initSensorCharts } from './charts.js';
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

  if (el.loginForm) {
    el.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = el.loginUser.value.trim();
      const password = el.loginPass.value.trim();
      const user = state.auth.users.find(u => u.username === username && u.password === password);
      if (user) {
        state.auth.currentUser = username;
        localStorage.setItem('currentUser', username);
        if (el.authOverlay) el.authOverlay.style.display = 'none';
        if (el.appContainer) el.appContainer.style.display = 'flex';
        hideAuthMessages(); el.loginForm.reset();
        checkWorkspaceLock(); initSensorCharts();
        logSerial(`[Hệ thống] Người dùng "${username}" đã đăng nhập thành công.`, false, true);
      } else if (el.loginError) el.loginError.style.display = 'flex';
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
      if (state.auth.users.some(u => u.username === username)) return showRegisterError('Tên đăng nhập đã tồn tại!');
      state.auth.users.push({ username, password });
      localStorage.setItem('smarthome_users', JSON.stringify(state.auth.users));
      if (el.registerSuccess) el.registerSuccess.style.display = 'flex';
      el.registerForm.reset();
      setTimeout(() => {
        if (el.tabLoginBtn) el.tabLoginBtn.click();
        if (el.loginUser) el.loginUser.value = username;
        if (el.loginPass) el.loginPass.focus();
      }, 1500);
    });
  }

  if (el.btnLogout) {
    el.btnLogout.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại?')) {
        state.connection.activeIp = null; localStorage.removeItem('activeIp');
        state.auth.currentUser = null; localStorage.removeItem('currentUser');
        if (state.serial.connected && el.btnSerialConnect) el.btnSerialConnect.click();
        if (el.authOverlay) el.authOverlay.style.display = 'flex';
        if (el.appContainer) el.appContainer.style.display = 'none';
        checkWorkspaceLock();
      }
    });
  }
}
