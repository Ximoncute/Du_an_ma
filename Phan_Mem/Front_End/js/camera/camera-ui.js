// js/camera/camera-ui.js
import { state } from '../core/state.js';
import { el } from '../core/dom.js';
import { logSerial } from '../core/utils.js';
import { openCameraModal, closeCameraModal, triggerSnapshotEffect } from './camera-actions.js';

export function initCameraStream() {
  if (el.btnOpenStream) el.btnOpenStream.addEventListener('click', openCameraModal);
  if (el.btnCloseModal) el.btnCloseModal.addEventListener('click', closeCameraModal);
  if (el.cameraModal) {
    el.cameraModal.addEventListener('click', (e) => {
      if (e.target === el.cameraModal) closeCameraModal();
    });
  }

  if (el.btnCamLeft) {
    el.btnCamLeft.addEventListener('click', () => {
      state.camera.panX = Math.max(-100, state.camera.panX - 15);
      logSerial(`[Camera] Xoay ống kính sang Trái: PanOffset = ${state.camera.panX}`);
    });
  }
  if (el.btnCamRight) {
    el.btnCamRight.addEventListener('click', () => {
      state.camera.panX = Math.min(100, state.camera.panX + 15);
      logSerial(`[Camera] Xoay ống kính sang Phải: PanOffset = ${state.camera.panX}`);
    });
  }
  if (el.btnCamZoomIn) {
    el.btnCamZoomIn.addEventListener('click', () => {
      state.camera.zoom = Math.min(3.0, state.camera.zoom + 0.2);
      logSerial(`[Camera] Phóng to: Zoom = ${state.camera.zoom.toFixed(1)}x`);
    });
  }
  if (el.btnCamZoomOut) {
    el.btnCamZoomOut.addEventListener('click', () => {
      state.camera.zoom = Math.max(1.0, state.camera.zoom - 0.2);
      logSerial(`[Camera] Thu nhỏ: Zoom = ${state.camera.zoom.toFixed(1)}x`);
    });
  }
  if (el.btnCamSnapshot) {
    el.btnCamSnapshot.addEventListener('click', triggerSnapshotEffect);
  }
}
