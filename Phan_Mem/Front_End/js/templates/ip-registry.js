// js/templates/ip-registry.js
export const ipRegistryTemplate = `
  <div class="ip-registry-card">
    <div class="registry-header">
      <div class="registry-title-box">
        <i class="fa-solid fa-circle-nodes"></i>
        <span class="registry-title">Danh sách IP Nodes kết nối</span>
      </div>
      <button class="btn-add-node" id="btnAddNode" title="Thêm địa chỉ IP mới">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <!-- Inline form for adding node -->
    <div class="add-node-form-container" id="addNodeFormContainer">
      <div class="add-node-form">
        <input type="text" class="newNodeIpInput" id="newNodeIpInput" placeholder="Nhập địa chỉ IP, ví dụ: 192.168.1.105" style="background-color: white; border: 1px solid var(--border-color); padding: 10px 14px; border-radius: var(--radius-md); font-family: monospace; font-size: 0.9rem; flex-grow: 1; outline: none;">
        <button class="btn-control refresh-btn" id="btnSubmitNewNode" style="margin-left: 0; padding: 10px 20px;">
          <i class="fa-solid fa-check"></i> Lưu Node
        </button>
        <button class="btn-control" id="btnCancelAddNode" style="margin-left: 0; padding: 10px 20px; background-color: #e2e8f0; color: var(--text-muted);">
          Hủy
        </button>
      </div>
    </div>

    <!-- Node List -->
    <ul class="node-list" id="registeredNodeList">
      <!-- Dynamically populated -->
    </ul>
  </div>
`;
