require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startMqttListener } = require('./services/mqttListener');

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

const app = express();

// Cấu hình Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Khai báo Route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/devices', require('./routes/devices'));

// Route mặc định
app.get('/', (req, res) => {
  res.json({
    message: 'Chào mừng bạn đến với SmartHome IoT Back-End API!',
    status: 'Running'
  });
});

// Cổng kết nối server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Máy chủ đang chạy tại cổng: ${PORT}`);
  
  // Khởi chạy MQTT Listener để lắng nghe và lưu dữ liệu từ thiết bị ESP32S3
  startMqttListener();
});
