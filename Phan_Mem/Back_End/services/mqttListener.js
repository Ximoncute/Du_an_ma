const mqtt = require('mqtt');
const SensorLog = require('../models/SensorLog');
const Device = require('../models/Device');

const startMqttListener = () => {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.emqx.io:1883';
  console.log(`[MQTT Listener] Đang kết nối tới Broker: ${brokerUrl}`);

  const client = mqtt.connect(brokerUrl);

  client.on('connect', () => {
    console.log('[MQTT Listener] Kết nối Broker thành công.');
    
    // Subscribe tới tất cả các topic gửi dữ liệu cảm biến của Team 2
    const sensorTopicPattern = 'iot_ung_dung/team_2/sensor/#';
    client.subscribe(sensorTopicPattern, (err) => {
      if (err) {
        console.error(`[MQTT Listener] Đăng ký topic thất bại: ${err.message}`);
      } else {
        console.log(`[MQTT Listener] Đã đăng ký nhận tin nhắn từ topic: ${sensorTopicPattern}`);
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payloadString = message.toString();
      const data = JSON.parse(payloadString);

      // Trích xuất IP
      let deviceIp = data.ip;
      if (!deviceIp) {
        // Dự phòng: Trích xuất IP từ topic (ví dụ: iot_ung_dung/team_2/sensor/192_168_1_5)
        const parts = topic.split('/');
        const cleanIp = parts[parts.length - 1];
        deviceIp = cleanIp.replace(/_/g, '.');
      }

      if (!deviceIp) {
        console.warn(`[MQTT Listener] Không thể xác định IP thiết bị từ topic: ${topic}`);
        return;
      }

      // Tự động đăng ký thiết bị vào DB nếu chưa tồn tại
      let device = await Device.findOne({ ip: deviceIp });
      if (!device) {
        device = new Device({
          ip: deviceIp,
          name: `Thiết bị ESP32 (${deviceIp})`
        });
        await device.save();
        console.log(`[MQTT Listener] Tự động đăng ký thiết bị mới: ${deviceIp}`);
      }

      // Tạo bản ghi log cảm biến mới
      const sensorLog = new SensorLog({
        ip: deviceIp,
        temp: parseFloat(data.temp) || 0,
        humid: parseFloat(data.humid) || 0,
        light: parseFloat(data.light) || 0,
        light_state: data.light_state === true || data.light_state === 1 || data.light_state === 'true',
        door_state: data.door_state === true || data.door_state === 1 || data.door_state === 'true',
        ai_keyword: data.ai_keyword || '',
        ai_conf: parseFloat(data.ai_conf) || 0,
        temp_threshold: parseFloat(data.temp_threshold),
        humid_threshold: parseFloat(data.humid_threshold),
        light_threshold: parseFloat(data.light_threshold),
        system_awake: data.system_awake !== false
      });

      await sensorLog.save();
      console.log(`[MQTT Listener] Đã lưu dữ liệu từ ${deviceIp} vào MongoDB: Temp: ${sensorLog.temp}°C, Humid: ${sensorLog.humid}%, Light: ${sensorLog.light} Lux`);

    } catch (err) {
      console.error(`[MQTT Listener] Lỗi xử lý tin nhắn: ${err.message}. Payload gốc: ${message.toString()}`);
    }
  });

  client.on('error', (err) => {
    console.error(`[MQTT Listener] Lỗi kết nối MQTT: ${err.message}`);
  });

  client.on('close', () => {
    console.warn('[MQTT Listener] Kết nối tới MQTT Broker bị đóng.');
  });
};

module.exports = { startMqttListener };
