// js/templates/profile.js
export const profileTemplate = `
  <header class="dashboard-header">
    <div class="header-info">
      <h1>Thông tin cá nhân</h1>
      <p>Cập nhật ảnh đại diện, thông tin liên hệ và chi tiết tài khoản của bạn</p>
    </div>
  </header>
  
  <div class="profile-container-wrapper">
    <div class="profile-card avatar-card">
      <div class="avatar-wrapper">
        <img id="profileAvatarPreview" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>" alt="Ảnh đại diện">
        <label for="profileAvatarInput" class="avatar-edit-badge" title="Tải ảnh lên">
          <i class="fa-solid fa-camera"></i>
        </label>
        <input type="file" id="profileAvatarInput" accept="image/*" style="display: none;">
      </div>
      <h3>Ảnh giao diện</h3>
      <p class="avatar-tip">Định dạng JPG, PNG hoặc GIF. Tối đa 2MB.</p>
    </div>

    <div class="profile-card info-card">
      <h2 class="card-title"><i class="fa-solid fa-address-card"></i> Thông tin liên hệ</h2>
      
      <div class="profile-form-grid">
        <div class="form-group">
          <label for="profileFullName">Họ và tên</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-user"></i>
            <input type="text" id="profileFullName" placeholder="Nhập họ và tên">
          </div>
        </div>

        <div class="form-group">
          <label for="profileDob">Ngày tháng năm sinh</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-calendar-days"></i>
            <input type="date" id="profileDob">
          </div>
        </div>

        <div class="form-group">
          <label for="profilePhone">Số điện thoại</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-phone"></i>
            <input type="tel" id="profilePhone" placeholder="Nhập số điện thoại">
          </div>
        </div>

        <div class="form-group">
          <label for="profileEmail">Gmail</label>
          <div class="input-with-icon">
            <i class="fa-solid fa-envelope"></i>
            <input type="email" id="profileEmail" placeholder="Nhập gmail">
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-save-profile" id="btnSaveProfile">
          <i class="fa-solid fa-floppy-disk"></i> Lưu thông tin
        </button>
        <span id="profileSaveMsg" class="save-status-msg"></span>
      </div>
    </div>
  </div>
`;
