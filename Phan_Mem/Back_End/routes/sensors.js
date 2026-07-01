const express = require('express');
const router = express.Router();
const SensorLog = require('../models/SensorLog');

// @route   GET /api/sensors/history
// @desc    Lấy lịch sử dữ liệu cảm biến (sắp xếp thời gian giảm dần)
// @access  Public
router.get('/history', async (req, res) => {
  try {
    const { ip, limit } = req.query;
    const queryLimit = parseInt(limit, 10) || 50;

    let filter = {};
    if (ip) {
      filter.ip = ip;
    }

    // Lấy log và sắp xếp theo thời gian mới nhất trước
    const logs = await SensorLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(queryLimit);

    // Trả về dữ liệu dạng đảo ngược lại để vẽ biểu đồ từ trái qua phải (cũ -> mới)
    res.json({
      success: true,
      count: logs.length,
      data: logs.reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sensors/latest
// @desc    Lấy thông tin cảm biến mới nhất
// @access  Public
router.get('/latest', async (req, res) => {
  try {
    const { ip } = req.query;
    let filter = {};
    if (ip) {
      filter.ip = ip;
    }

    const latestLog = await SensorLog.findOne(filter).sort({ createdAt: -1 });

    if (!latestLog) {
      return res.status(404).json({ success: false, message: 'Chưa có dữ liệu cảm biến nào' });
    }

    res.json({
      success: true,
      data: latestLog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
