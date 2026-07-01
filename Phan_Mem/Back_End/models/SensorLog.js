const mongoose = require('mongoose');

const SensorLogSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true
  },
  temp: {
    type: Number,
    required: true
  },
  humid: {
    type: Number,
    required: true
  },
  light: {
    type: Number,
    required: true
  },
  light_state: {
    type: Boolean,
    default: false
  },
  door_state: {
    type: Boolean,
    default: false
  },
  ai_keyword: {
    type: String,
    default: ''
  },
  ai_conf: {
    type: Number,
    default: 0
  },
  temp_threshold: {
    type: Number
  },
  humid_threshold: {
    type: Number
  },
  light_threshold: {
    type: Number
  },
  system_awake: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SensorLog', SensorLogSchema);
