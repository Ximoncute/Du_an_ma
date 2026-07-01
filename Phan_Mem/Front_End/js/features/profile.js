// js/profile.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';

export function initProfileManager() {
  const previewEl = el.profileAvatarPreview;
  const inputEl = el.profileAvatarInput;
  const nameEl = el.profileFullName;
  const dobEl = el.profileDob;
  const phoneEl = el.profilePhone;
  const emailEl = el.profileEmail;
  const saveBtn = el.btnSaveProfile;
  const saveMsg = document.getElementById('profileSaveMsg');

  const API_BASE = 'http://127.0.0.1:5000/api';
  const token = localStorage.getItem('token');

  // Tải dữ liệu ban đầu từ MongoDB
  if (token) {
    fetch(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user) {
        state.profile.fullName = data.user.fullName || '';
        state.profile.dob = data.user.dob || '';
        state.profile.phone = data.user.phone || '';
        state.profile.email = data.user.email || '';
        state.profile.avatar = data.user.avatar || '';

        // Cập nhật lên UI
        if (nameEl) nameEl.value = state.profile.fullName;
        if (dobEl) dobEl.value = state.profile.dob;
        if (phoneEl) phoneEl.value = state.profile.phone;
        if (emailEl) emailEl.value = state.profile.email;
        if (previewEl && state.profile.avatar) {
          previewEl.src = state.profile.avatar;
        }
      }
    })
    .catch(err => {
      console.warn('[Backend] Lỗi tải thông tin cá nhân từ server:', err);
      // Fallback dùng localStorage nếu offline
      if (state.profile.avatar && previewEl) previewEl.src = state.profile.avatar;
      if (nameEl) nameEl.value = state.profile.fullName;
      if (dobEl) dobEl.value = state.profile.dob;
      if (phoneEl) phoneEl.value = state.profile.phone;
      if (emailEl) emailEl.value = state.profile.email;
    });
  } else {
    // Không có token -> Fallback dùng dữ liệu cache cũ
    if (state.profile.avatar && previewEl) previewEl.src = state.profile.avatar;
    if (nameEl) nameEl.value = state.profile.fullName;
    if (dobEl) dobEl.value = state.profile.dob;
    if (phoneEl) phoneEl.value = state.profile.phone;
    if (emailEl) emailEl.value = state.profile.email;
  }

  // Xử lý tải ảnh đại diện
  if (inputEl && previewEl) {
    inputEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showStatus('Kích thước ảnh không quá 2MB!', false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        state.profile.avatar = base64Data;
        previewEl.src = base64Data;
        logSerial('[Hệ thống] Đã tải ảnh giao diện mới (nhấn Lưu thông tin để lưu lên MongoDB).', false, true);
        showStatus('Đã chọn ảnh đại diện mới!', true);
      };
      reader.readAsDataURL(file);
    });
  }

  // Xử lý lưu thông tin lên Back-End MongoDB
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const fullName = nameEl ? nameEl.value.trim() : '';
      const dob = dobEl ? dobEl.value : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const avatar = state.profile.avatar || '';

      // Validation
      if (!fullName) {
        showStatus('Vui lòng nhập Họ và tên!', false);
        return;
      }
      if (phone && !/^[0-9+]{8,12}$/.test(phone)) {
        showStatus('Số điện thoại không hợp lệ!', false);
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Gmail không hợp lệ!', false);
        return;
      }

      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        showStatus('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!', false);
        return;
      }

      // Lưu lên MongoDB
      fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ fullName, dob, phone, email, avatar })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          state.profile.fullName = data.user.fullName;
          state.profile.dob = data.user.dob;
          state.profile.phone = data.user.phone;
          state.profile.email = data.user.email;
          state.profile.avatar = data.user.avatar;

          // Cập nhật bộ nhớ cache cục bộ
          localStorage.setItem('profile_fullName', data.user.fullName);
          localStorage.setItem('profile_dob', data.user.dob);
          localStorage.setItem('profile_phone', data.user.phone);
          localStorage.setItem('profile_email', data.user.email);
          localStorage.setItem('profile_avatar', data.user.avatar);

          logSerial(`[Cấu hình] Cập nhật thông tin lên MongoDB thành công cho: ${fullName}`, false, true);
          showStatus('Lưu thông tin cá nhân thành công!', true);
        } else {
          showStatus(data.message || 'Lưu thất bại!', false);
        }
      })
      .catch(err => {
        console.error(err);
        showStatus('Lỗi: Không thể kết nối với server Back-End!', false);
      });
    });
  }

  function showStatus(text, isSuccess) {
    if (!saveMsg) return;
    saveMsg.textContent = text;
    saveMsg.className = 'save-status-msg ' + (isSuccess ? 'success' : 'error');
    saveMsg.style.opacity = '1';
    
    setTimeout(() => {
      saveMsg.style.opacity = '0';
    }, 3000);
  }
}
