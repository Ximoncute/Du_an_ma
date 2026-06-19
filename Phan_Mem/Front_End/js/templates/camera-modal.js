// js/templates/camera-modal.js
export const cameraModalTemplate = `
  <div class="camera-modal" id="cameraModal">
    <div class="camera-modal-content">
      
      <div class="camera-modal-header">
        <div class="camera-modal-title">
          <i class="fa-solid fa-circle-dot status-dot pulse"></i>
          <span id="cameraModalName">Camera giám sát — Phòng khách</span>
        </div>
        <button class="btn-close-modal" id="btnCloseModal" title="Đóng camera">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="camera-stream-wrapper">
        <canvas class="camera-canvas" id="cameraCanvas"></canvas>
        
        <!-- Camera control overlay -->
        <div class="camera-controls-overlay">
          <button class="cam-ctrl-btn" id="btnCamLeft" title="Quay sang trái">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <button class="cam-ctrl-btn" id="btnCamRight" title="Quay sang phải">
            <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button class="cam-ctrl-btn" id="btnCamZoomIn" title="Phóng to">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
          </button>
          <button class="cam-ctrl-btn" id="btnCamZoomOut" title="Thu nhỏ">
            <i class="fa-solid fa-magnifying-glass-minus"></i>
          </button>
          <button class="cam-ctrl-btn" id="btnCamSnapshot" title="Chụp màn hình">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>
      </div>

      <div class="camera-modal-footer">
        <div class="cam-meta-item">
          <i class="fa-solid fa-signal" style="color: var(--brand-green-accent);"></i>
          <span>Tín hiệu: Rất tốt (84ms)</span>
        </div>
        <div class="cam-meta-item">
          <i class="fa-solid fa-expand"></i>
          <span>Độ phân giải: 1280x720 (720p)</span>
        </div>
        <div class="cam-meta-item">
          <i class="fa-solid fa-bolt"></i>
          <span id="cameraFps">30 FPS</span>
        </div>
      </div>

    </div>
  </div>
`;
