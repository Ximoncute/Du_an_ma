const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT (Optional but recommended)
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smarthome_super_secret_key_123');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Không được phép truy cập, token không hợp lệ' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy token xác thực' });
  }
};

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, password, fullName, email, phone, dob } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Tên tài khoản đã tồn tại' });
    }

    const user = await User.create({
      username,
      password,
      fullName: fullName || 'Người dùng SmartHome',
      email: email || '',
      phone: phone || '',
      dob: dob || '',
      avatar: ''
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'smarthome_super_secret_key_123', {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'smarthome_super_secret_key_123', {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Lấy thông tin cá nhân
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin cá nhân
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.dob = req.body.dob || user.dob;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          dob: updatedUser.dob,
          avatar: updatedUser.avatar
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
