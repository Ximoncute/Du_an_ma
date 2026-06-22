// js/templates/auth.js
export const authTemplate = `
  <div class="auth-overlay" id="authOverlay">
    <div class="auth-card">
      <div class="auth-left">
        <img src="images/smarthome_illustration.png" alt="SmartHome Illustration" class="auth-img">
      </div>
      <div class="auth-right">
        <div class="auth-header">
          <h1>Hệ Thống SmartHome</h1>
          <p class="auth-header-subtitle">Điều khiển và giám sát thiết bị thông minh mọi lúc, mọi nơi</p>
        </div>
        
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLoginBtn">Đăng nhập</button>
          <button class="auth-tab" id="tabRegisterBtn">Đăng ký</button>
        </div>
        
        <!-- Login Form -->
        <form class="auth-form" id="loginForm">
          <h2>Chào mừng quay trở lại!</h2>
          <p class="auth-subtitle">Vui lòng đăng nhập tài khoản của bạn</p>
          <div class="auth-input-group">
            <label for="loginUser">TÀI KHOẢN</label>
            <input type="text" id="loginUser" required placeholder="Nhập tên đăng nhập">
          </div>
          <div class="auth-input-group">
            <label for="loginPass">MẬT KHẨU</label>
            <input type="password" id="loginPass" required placeholder="Nhập mật khẩu">
          </div>
          <button type="submit" class="btn-auth-submit">Đăng nhập</button>
          <div class="auth-error-msg" id="loginError">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>Tài khoản hoặc mật khẩu không chính xác!</span>
          </div>
        </form>

        <!-- Register Form -->
        <form class="auth-form hidden" id="registerForm">
          <h2>Tạo tài khoản mới</h2>
          <p class="auth-subtitle">Nhập thông tin đăng ký tài khoản của bạn</p>
          <div class="auth-input-group">
            <label for="registerUser">TÊN ĐĂNG NHẬP</label>
            <input type="text" id="registerUser" required placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)">
          </div>
          <div class="auth-input-group">
            <label for="registerPass">MẬT KHẨU</label>
            <input type="password" id="registerPass" required placeholder="Nhập mật khẩu (ít nhất 6 ký tự)">
          </div>
          <div class="auth-input-group">
            <label for="registerConfirmPass">XÁC NHẬN MẬT KHẨU</label>
            <input type="password" id="registerConfirmPass" required placeholder="Nhập lại mật khẩu">
          </div>
          <button type="submit" class="btn-auth-submit">Đăng ký</button>
          <div class="auth-error-msg" id="registerError">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>Mật khẩu xác nhận không khớp!</span>
          </div>
          <div class="auth-success-msg" id="registerSuccess">
            <i class="fa-solid fa-circle-check"></i>
            <span>Đăng ký tài khoản thành công!</span>
          </div>
        </form>
      </div>
    </div>
  </div>
`;
