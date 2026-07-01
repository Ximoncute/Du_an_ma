const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// @route   GET /api/devices
// @desc    Lấy danh sách các thiết bị đã đăng ký
// @access  Public
router.get('/', async (req, res) => {
  try {
    const devices = await Device.find({}).sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/devices
// @desc    Đăng ký thêm thiết bị mới
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { ip, name } = req.body;

    if (!ip) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ IP' });
    }

    let device = await Device.findOne({ ip });
    if (device) {
      return res.status(400).json({ success: false, message: 'Thiết bị với IP này đã được đăng ký' });
    }

    device = new Device({
      ip,
      name: name || `Thiết bị ESP32 (${ip})`
    });

    await device.save();

    res.status(201).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/devices/:ip
// @desc    Xóa thiết bị đã đăng ký
// @access  Public
router.delete('/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    const device = await Device.findOneAndDelete({ ip });

    if (!device) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thiết bị để xóa' });
    }

    res.json({
      success: true,
      message: `Đã xóa thiết bị với IP: ${ip} thành công`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
