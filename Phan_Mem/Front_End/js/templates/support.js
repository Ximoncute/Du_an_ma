// js/templates/support.js
export const supportTemplate = `
  <header class="dashboard-header">
    <div class="header-info">
      <h1>Tư vấn hỗ trợ kỹ thuật</h1>
      <p>Hỗ trợ giải đáp thắc mắc và khắc phục các sự cố phần cứng SmartHome 24/7</p>
    </div>
  </header>
  
  <div class="support-container-wrapper">
    <!-- Chat Area -->
    <div class="chat-card">
      <div class="chat-header">
        <div class="consultant-info">
          <div class="avatar-status-wrapper">
            <div class="consultant-avatar">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <span class="active-dot"></span>
          </div>
          <div class="consultant-details">
            <span class="consultant-name">Kỹ thuật viên SmartHome</span>
            <span class="consultant-status">Trực tuyến</span>
          </div>
        </div>
        <div class="chat-actions">
          <a href="tel:0329675925" class="hotline-btn-top" title="Gọi hotline ngay">
            <i class="fa-solid fa-phone-volume"></i> 0329675925
          </a>
        </div>
      </div>

      <div class="chat-messages" id="supportChatMessages">
        <div class="message system-msg">
          <span>Hộp hội thoại bắt đầu hỗ trợ sự cố phần cứng</span>
        </div>
        
        <div class="message receiver">
          <div class="msg-avatar"><i class="fa-solid fa-user-shield"></i></div>
          <div class="msg-content">
            <p>Xin chào! Chúng tôi có thể giúp gì cho bạn về sự cố thiết bị phần cứng của SmartHome?</p>
            <span class="msg-time">Vừa xong</span>
          </div>
        </div>
      </div>

      <div class="chat-input-bar">
        <input type="text" id="supportChatInput" placeholder="Nhập mô tả sự cố phần cứng của bạn tại đây...">
        <button id="supportBtnSend" class="btn-chat-send">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- Callback Panel -->
    <div class="callback-card">
      <div class="card-icon-header">
        <i class="fa-solid fa-headset"></i>
      </div>
      <h2>Yêu cầu liên hệ lại</h2>
      <p class="callback-desc">
        Cảm ơn quý khách đã nhắn tin. Xin hãy gọi điện thoại qua số điện thoại sau:
      </p>
      <a href="tel:0329675925" class="hotline-link"><i class="fa-solid fa-phone"></i> 0329675925</a>
      <p class="callback-desc-or">Hoặc để lại số điện thoại dưới đây để nhân viên liên hệ lại:</p>
      
      <div class="callback-form">
        <div class="input-with-icon">
          <i class="fa-solid fa-phone"></i>
          <input type="tel" id="callbackPhoneInput" placeholder="Nhập số điện thoại của bạn">
        </div>
        <button class="btn-submit-callback" id="btnSubmitCallback">
          <i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu gọi lại
        </button>
        <span id="callbackSuccessMsg" class="callback-status-msg"></span>
      </div>
    </div>
  </div>
`;
