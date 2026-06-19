// js/support.js
import { logSerial } from './utils.js';

export function initSupportChat() {
  const chatMessages = document.getElementById('supportChatMessages');
  const chatInput = document.getElementById('supportChatInput');
  const btnSend = document.getElementById('supportBtnSend');
  const callbackPhoneInput = document.getElementById('callbackPhoneInput');
  const btnSubmitCallback = document.getElementById('btnSubmitCallback');
  const callbackSuccessMsg = document.getElementById('callbackSuccessMsg');

  // Handle message sending
  if (btnSend && chatInput && chatMessages) {
    const sendMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // Append user message
      appendMessage(text, 'sender');
      chatInput.value = '';

      // Simulate representative response
      showTypingIndicator();

      setTimeout(() => {
        removeTypingIndicator();
        appendMessage(
          `Cảm ơn quý khách đã nhắn tin. Xin hãy gọi điện thoại qua số điện thoại sau <strong>(0329675925)</strong> hoặc để lại số điện thoại để nhân viên liên hệ lại.`,
          'receiver'
        );
        logSerial('[Hỗ trợ] Đã trả lời tự động kèm thông tin liên hệ cho khách hàng.', false, true);
      }, 1000);
    };

    btnSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Handle callback request submission
  if (btnSubmitCallback && callbackPhoneInput) {
    btnSubmitCallback.addEventListener('click', () => {
      const phone = callbackPhoneInput.value.trim();
      if (!phone) {
        showCallbackStatus('Vui lòng nhập số điện thoại!', false);
        return;
      }
      
      // Simple phone validation
      if (!/^[0-9+]{8,12}$/.test(phone)) {
        showCallbackStatus('Số điện thoại không đúng định dạng!', false);
        return;
      }

      logSerial(`[Hỗ trợ] Nhận yêu cầu gọi lại tới SĐT: ${phone}`, false, true);
      showCallbackStatus('Gửi yêu cầu gọi lại thành công! Chúng tôi sẽ liên hệ trong ít phút.', true);
      callbackPhoneInput.value = '';
    });
  }

  function appendMessage(text, type) {
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;

    const iconClass = type === 'sender' ? 'fa-user' : 'fa-user-shield';
    
    msgDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid ${iconClass}"></i></div>
      <div class="msg-content">
        <p>${text}</p>
        <span class="msg-time">Vừa xong</span>
      </div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message receiver typing-indicator-msg';
    typingDiv.innerHTML = `
      <div class="msg-avatar"><i class="fa-solid fa-user-shield"></i></div>
      <div class="msg-content">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;

    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    if (!chatMessages) return;
    const indicator = chatMessages.querySelector('.typing-indicator-msg');
    if (indicator) {
      chatMessages.removeChild(indicator);
    }
  }

  function showCallbackStatus(text, isSuccess) {
    if (!callbackSuccessMsg) return;
    callbackSuccessMsg.textContent = text;
    callbackSuccessMsg.className = 'callback-status-msg ' + (isSuccess ? 'success' : 'error');
    callbackSuccessMsg.style.opacity = '1';

    setTimeout(() => {
      callbackSuccessMsg.style.opacity = '0';
    }, 4000);
  }
}
