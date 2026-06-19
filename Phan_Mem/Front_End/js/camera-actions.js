// js/camera-actions.js
import { state } from './state.js';
import { el } from './dom.js';
import { logSerial } from './utils.js';
import { renderLiveCameraFeed } from './camera-feed.js';

export function openCameraModal() {
  if (!el.cameraModal) return;
  state.camera.isOpen = true;
  el.cameraModal.classList.add('active');
  const canvas = el.cameraCanvas;
  canvas.width = 1280;
  canvas.height = 720;
  logSerial('[Camera] Khởi động luồng truyền trực tiếp 720p...');
  state.camera.lastFrameTime = performance.now();
  renderLiveCameraFeed();
}

export function closeCameraModal() {
  if (!el.cameraModal) return;
  state.camera.isOpen = false;
  el.cameraModal.classList.remove('active');
  if (state.camera.animFrameId) {
    cancelAnimationFrame(state.camera.animFrameId);
    state.camera.animFrameId = null;
  }
  logSerial('[Camera] Đã ngắt luồng truyền trực tiếp để tiết kiệm băng thông.');
}

export function triggerSnapshotEffect() {
  const streamWrapper = document.querySelector('.camera-stream-wrapper');
  if (!streamWrapper) return;
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    backgroundColor: '#ffffff', opacity: '1', transition: 'opacity 0.5s ease-out', zIndex: '999'
  });
  streamWrapper.appendChild(flash);
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
  } catch (err) {}
  setTimeout(() => {
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 500);
  }, 50);
  const link = document.createElement('a');
  link.download = `SmartHome_Snapshot_${Date.now()}.png`;
  link.href = el.cameraCanvas.toDataURL();
  link.click();
  logSerial('[Camera] Đã lưu ảnh chụp nhanh thành công vào thiết bị của bạn!');
}
