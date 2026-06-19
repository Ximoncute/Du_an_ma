// js/profile.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';

export function initProfileManager() {
  const previewEl = el.profileAvatarPreview;
  const inputEl = el.profileAvatarInput;
  const nameEl = el.profileFullName;
  const dobEl = el.profileDob;
  const phoneEl = el.profilePhone;
  const emailEl = el.profileEmail;
  const saveBtn = el.btnSaveProfile;
  const saveMsg = document.getElementById('profileSaveMsg');

  // Load initial data
  if (state.profile.avatar) {
    if (previewEl) previewEl.src = state.profile.avatar;
  }
  if (nameEl) nameEl.value = state.profile.fullName;
  if (dobEl) dobEl.value = state.profile.dob;
  if (phoneEl) phoneEl.value = state.profile.phone;
  if (emailEl) emailEl.value = state.profile.email;

  // Handle avatar upload
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
        localStorage.setItem('profile_avatar', base64Data);
        previewEl.src = base64Data;
        logSerial('[Hệ thống] Đã cập nhật ảnh giao diện mới thành công.', false, true);
        showStatus('Tải ảnh đại diện thành công!', true);
      };
      reader.readAsDataURL(file);
    });
  }

  // Handle save info
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const fullName = nameEl ? nameEl.value.trim() : '';
      const dob = dobEl ? dobEl.value : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';

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

      // Save to state
      state.profile.fullName = fullName;
      state.profile.dob = dob;
      state.profile.phone = phone;
      state.profile.email = email;

      // Save to localStorage
      localStorage.setItem('profile_fullName', fullName);
      localStorage.setItem('profile_dob', dob);
      localStorage.setItem('profile_phone', phone);
      localStorage.setItem('profile_email', email);

      logSerial(`[Cấu hình] Cập nhật thông tin: ${fullName}, SĐT: ${phone}, Email: ${email}`, false, true);
      showStatus('Lưu thông tin cá nhân thành công!', true);
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
