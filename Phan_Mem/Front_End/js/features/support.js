import { logSerial } from '../core/utils.js';

export function initSupportChat() {
  const chatMessages = document.getElementById('supportChatMessages');
  const chatInput = document.getElementById('supportChatInput');
  const btnSend = document.getElementById('supportBtnSend');
  const callbackPhoneInput = document.getElementById('callbackPhoneInput');
  const btnSubmitCallback = document.getElementById('btnSubmitCallback');
  const callbackSuccessMsg = document.getElementById('callbackSuccessMsg');

  // Handle message sending
  if (btnSend && chatInput && chatMessages) {
    const sendMessage = async () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // Append user message
      appendMessage(text, 'sender');
      chatInput.value = '';

      // Simulate representative response
      showTypingIndicator();

      // Local Fallback check - first thing!
      const lower = text.toLowerCase();
      let matchedLocalReply = null;
      if (lower.includes('wifi') || lower.includes('mạng') || lower.includes('kết nối')) {
        matchedLocalReply = "Để cấu hình lại WiFi cho ESP32, hãy nhấn giữ nút BOOT trên mạch trong 3 giây để reset WiFiManager, rồi kết nối điện thoại vào WiFi 'SmartHome-Gateway' và cấu hình tại IP 192.168.4.1.";
      } else if (lower.includes('dht11') || lower.includes('dht22') || lower.includes('nhiệt độ') || lower.includes('độ ẩm')) {
        matchedLocalReply = "Nếu cảm biến DHT bị lỗi hiển thị độ ẩm 0%, hãy kiểm tra lại giắc cắm chân DATA trên ESP32, đảm bảo nguồn cấp 3.3V/5V đã cắm chặt và có trở kéo lên 4.7k-10k Ohm.";
      } else if (lower.includes('bh1750') || lower.includes('ánh sáng') || lower.includes('lux')) {
        matchedLocalReply = "Cảm biến ánh sáng BH1750 giao tiếp qua I2C (SCL/SDA). Hãy kiểm tra xem các chân I2C đã được cắm đúng trên ESP32 chưa và nguồn cấp cho cảm biến đã ổn định.";
      } else if (lower.includes('mqtt') || lower.includes('broker') || lower.includes('emqx')) {
        matchedLocalReply = "Hệ thống kết nối Broker EMQX (broker.emqx.io) qua WebSockets cổng 8083/8084. Hãy kiểm tra kết nối mạng của máy tính nếu giao diện báo ngắt kết nối.";
      } else if (lower.includes('xóa ip') || lower.includes('xóa node') || lower.includes('192.168.')) {
        matchedLocalReply = "Bạn hoàn toàn có thể xóa các IP Node trong danh sách đăng ký bằng cách nhấp vào biểu tượng thùng rác bên cạnh IP đó. Nếu là node đang hoạt động, hệ thống sẽ tự động ngắt kết nối trước khi tiến hành xóa.";
      } else if (lower.includes('relay') || lower.includes('đèn') || lower.includes('cửa')) {
        matchedLocalReply = "Hộp điều khiển sử dụng Module Relay để đóng ngắt thiết bị. Hãy kiểm tra xem nguồn cấp 5V bên ngoài cho Relay đã được kết nối chưa và chân tín hiệu IN1/IN2 đã nối đúng GPIO của ESP32 chưa.";
      }

      if (matchedLocalReply) {
        // Instant response for local keywords
        setTimeout(() => {
          removeTypingIndicator();
          appendMessage(matchedLocalReply, 'receiver');
          logSerial('[Hỗ trợ] Trả lời tức thì dựa trên bộ lọc từ khóa cục bộ.', false, true);
        }, 150); // Small realistic delay for UI animation feel, but very fast (<200ms)
        return;
      }

      const systemPrompt = `Bạn là trợ lý hỗ trợ kỹ thuật phần cứng của hệ thống nhà thông minh SmartHome IoT Team 2 (Trưởng nhóm: Lê Chí Hiếu - 0329675925).
CỰC KỲ QUAN TRỌNG: Câu trả lời của bạn PHẢI siêu ngắn gọn, tối đa 1 đến 2 câu ngắn (dưới 40 từ), tập trung sâu vào kỹ thuật phần cứng (ESP32, cảm biến DHT11, BH1750, MQTT, OLED, Relay, WiFiManager).
Nếu cần hỗ trợ trực tiếp, khuyên gọi hotline (0329675925) hoặc để lại SĐT ở ô bên cạnh.`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); // 0.5s timeout theo yêu cầu

        const response = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            model: 'openai'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('API request failed');
        const replyText = await response.text();

        removeTypingIndicator();
        appendMessage(replyText, 'receiver');
        logSerial('[Hỗ trợ] Đã trả lời tự động bằng AI Pollinations.', false, true);
      } catch (err) {
        console.warn('Pollinations API failed or timed out, using local fallback:', err);
        setTimeout(() => {
          removeTypingIndicator();
          appendMessage("Cảm ơn bạn. Hệ thống AI đang bận. Để hỗ trợ nhanh nhất về phần cứng SmartHome, bạn vui lòng gọi hotline 0329675925 hoặc để lại SĐT ở ô bên phải để được gọi lại nhé!", 'receiver');
          logSerial('[Hỗ trợ] AI lỗi/timeout, dùng phản hồi dự phòng.', false, true);
        }, 100);
      }
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
