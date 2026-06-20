// js/utils.js
import { el } from './dom.js';

export function updateDateTime() {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  if (el.currentDate) {
    el.currentDate.textContent = `${dayName}, ${day} tháng ${month}, ${year}`;
  }
  if (el.currentTime) {
    el.currentTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

export function logSerial(msg, isError = false, isSystem = false, type = '') {
  const term = el.serialTerminal;
  if (!term) return;

  const placeholder = document.getElementById('placeholderLine');
  if (placeholder) {
    placeholder.remove();
  }

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
