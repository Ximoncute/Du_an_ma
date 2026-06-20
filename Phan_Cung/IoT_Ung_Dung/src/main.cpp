/*
 * DỰ ÁN: KEYWORD SPOTTING & SMART HOME IoT INTEGRATION
 * Kết hợp 3 phần: Keyword Spotting AI, WiFiManager/OLED và Cảm biến Touch.
 * Giao tiếp qua MQTT Broker EMQX với định dạng JSON chuẩn hóa.
 */

#include "edge-impulse-sdk/classifier/ei_run_dsp.h"
#include <IoT_Ung_Dung_inferencing.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_task_wdt.h"
#include "HardwareSerial.h"
#include <I2S.h>
#include <math.h>
#include <driver/i2s.h>
#include <algorithm>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

using namespace std;

// ==================== CẤU HÌNH CƠ BẢN ====================
#define SAMPLE_RATE 16000U
#define SAMPLE_BITS 16
#define WDT_TIMEOUT_SEC 10

// ==================== CẤU HÌNH XỬ LÝ ÂM THANH ====================
#define VAD_THRESHOLD_MULTIPLIER 1.1
#define NOISE_PROFILE_SIZE 50
#define ENERGY_HISTORY_SIZE 5
#define MIN_VOICE_ENERGY 40
#define AUTO_GAIN_MAX 15.0
#define AUTO_GAIN_TARGET 15000
#define SILENCE_FRAMES_THRESHOLD 2

// ==================== CẤU HÌNH NHẬN DIỆN ====================
#define MIN_CONFIDENCE 0.40
#define HIGH_CONFIDENCE 0.70
#define DEBOUNCE_TIME_MS 400

// ==================== CẤU HÌNH WAKE-UP ====================
#define WAKEUP_TIMEOUT_MS 10000  // 10 giây timeout
#define WAKEUP_LED_BLINK_MS 200  // 200ms blink interval

// ==================== ĐỊNH NGHĨA CHÂN ====================
#define LED_LIGHT 4        // Đèn điều khiển bằng cảm biến/giọng nói
#define LED_DOOR 8         // LED mở cửa (điều khiển bằng cảm biến/giọng nói)
#define WAKEUP_GPIO 21     // LED wake-up
#define DHT_PIN 7          // Cảm biến DHT11
#define BH1750_SDA 5       // I2C SDA cho BH1750
#define BH1750_SCL 6       // I2C SCL cho BH1750
#define TOUCH_PIN 9        // Chân cảm biến chạm

// ==================== CẤU HÌNH CẢM BIẾN ====================
#define DHTPIN DHT_PIN
#define DHTTYPE DHT11
#define HUMIDITY_THRESHOLD 70.0

// ==================== CẤU HÌNH OLED ====================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==================== CẤU HÌNH MQTT ====================
const char* mqtt_server = "broker.emqx.io";
const uint16_t mqtt_port = 1883;
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// ==================== EVENT GROUPS ====================
EventGroupHandle_t ledEventGroup;
#define LED_LIGHT_ON_BIT (1 << 1)
#define LED_LIGHT_OFF_BIT (1 << 2)
#define LED_DOOR_ON_BIT  (1 << 3)
#define LED_DOOR_OFF_BIT (1 << 4)

// ==================== CẤU TRÚC DỮ LIỆU ====================
typedef struct {
    signed short *buffers[2];
    unsigned char buf_select;
    unsigned char buf_ready;
    unsigned int buf_count;
    unsigned int n_samples;
} inference_t;

typedef struct {
    float noise_floor;
    float noise_profile[NOISE_PROFILE_SIZE];
    int profile_index;
    float min_noise;
    float max_noise;
    int silence_counter;
} noise_manager_t;

typedef struct {
    int16_t energy_history[ENERGY_HISTORY_SIZE];
    int history_index;
    float avg_energy;
    float peak_energy;
    int voice_frames;
    bool is_speech;
    float auto_gain;
} audio_processor_t;

// ==================== BIẾN GLOBAL ====================
static inference_t inference;
static const uint32_t sample_buffer_size = 2048;
static signed short sampleBuffer[sample_buffer_size];
static bool debug_nn = false;
static bool record_status = true;
static TaskHandle_t mainTaskHandle = NULL;

static noise_manager_t noise_mgr;
static audio_processor_t audio_proc;
static bool light_state = false, door_state = false;
static bool system_awake = false;  // Trạng thái hệ thống AI
static unsigned long last_command_time = 0;
static bool wakeup_led_state = false;
static unsigned long last_blink_time = 0;

// Biến cho cảm biến
DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;
float current_temp = 0;
float current_humidity = 0;
float current_lux = 0;
unsigned long last_sensor_read = 0;
const unsigned long SENSOR_READ_INTERVAL = 2000; // Đọc cảm biến mỗi 2 giây

// Ngưỡng động điều chỉnh từ Web
static float temp_threshold = 30.0;
static float humid_threshold = 70.0;
static float lux_threshold = 100.0;
static bool thresholds_synchronized = false;

// Trạng thái AI cuối cùng
static String last_detected_keyword = "none";
static float last_detected_confidence = 0.0;
static unsigned long last_keyword_detected_time = 0;

// Quản lý OLED và nút Touch
static int current_screen = 0;
static String custom_lcd_text = "";

HardwareSerial uart1(1);
WiFiManager wm;

// ==================== PROTOTYPES ====================
static void audio_inference_callback(uint32_t n_bytes);
static void capture_samples(void *arg);
static bool microphone_inference_start(uint32_t n_samples);
static bool microphone_inference_record(void);
static int microphone_audio_signal_get_data(size_t offset, size_t length, float *out_ptr);
static void controll_task(void *arg);
static void process_audio_advanced(int16_t* samples, size_t len);
static bool detect_speech_advanced(int16_t* samples, size_t len);
static void update_noise_profile(float current_level);
static float calculate_confidence_threshold(void);
static void update_leds(void);
static void handle_wakeup_system(const char* command, float confidence);
static void update_wakeup_led(void);
static void read_sensors(void);
static void update_sensor_based_controls(void);
static void update_display(void);
static void check_touch_sensor(void);
static void mqtt_callback(char* topic, byte* payload, unsigned int length);
static void connect_mqtt(void);
static void publish_sensor_data(void);

// ==================== KHỞI TẠO ====================
void setup_watchdog() {
    esp_task_wdt_init(WDT_TIMEOUT_SEC, true);
    mainTaskHandle = xTaskGetCurrentTaskHandle();
    esp_task_wdt_add(mainTaskHandle);
}

void feed_watchdog() {
    esp_task_wdt_reset();
}

bool init_i2s_with_retry() {
    int retry_count = 0;
    while (retry_count < 3) {
        I2S.setAllPins(-1, 42, 41, -1, -1);
        if (I2S.begin(PDM_MONO_MODE, SAMPLE_RATE, SAMPLE_BITS)) {
            return true;
        }
        retry_count++;
        delay(100);
    }
    return false;
}

void boot_indicator() {
    for (int i = 0; i < 2; i++) {
        digitalWrite(WAKEUP_GPIO, HIGH);
        delay(200);
        digitalWrite(WAKEUP_GPIO, LOW);
        delay(200);
    }
}

void init_audio_processing() {
    noise_mgr.noise_floor = 30.0;
    noise_mgr.min_noise = 30.0;
    noise_mgr.max_noise = 30.0;
    noise_mgr.silence_counter = 0;
    noise_mgr.profile_index = 0;
    
    for(int i = 0; i < NOISE_PROFILE_SIZE; i++) {
        noise_mgr.noise_profile[i] = 30.0;
    }
    
    audio_proc.avg_energy = 0;
    audio_proc.peak_energy = 0;
    audio_proc.is_speech = false;
    audio_proc.voice_frames = 0;
    audio_proc.auto_gain = 2.0;
    audio_proc.history_index = 0;
    
    for(int i = 0; i < ENERGY_HISTORY_SIZE; i++) {
        audio_proc.energy_history[i] = 0;
    }
}

// ==================== CẢM BIẾN & OLED ====================
void init_sensors() {
    dht.begin();
    Wire.begin(BH1750_SDA, BH1750_SCL);
    
    // Khởi tạo SSD1306 OLED share bus I2C
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println("Lỗi khởi tạo màn hình OLED SSD1306!");
    } else {
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(0, 10);
        display.println("SmartHome System");
        display.println("Initializing...");
        display.display();
    }
    
    lightMeter.begin();
    
    Serial.println("Cảm biến đã được khởi tạo:");
    Serial.println("- DHT11 trên GPIO7");
    Serial.println("- BH1750 trên I2C (SDA=GPIO5, SCL=GPIO6)");
}

void read_sensors() {
    // Đọc DHT11
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    if (!isnan(temp) && !isnan(humidity)) {
        current_temp = temp;
        current_humidity = humidity;
    } else {
        Serial.println("Lỗi đọc DHT11!");
    }
    
    // Đọc BH1750
    uint16_t lux = lightMeter.readLightLevel();
    if (lux != 0) {
        current_lux = lux;
    } else {
        Serial.println("Lỗi đọc BH1750!");
    }
}

void update_sensor_based_controls() {
    if (!thresholds_synchronized) {
        return; // Chỉ thực thi if-else tự động khi đã đồng bộ ngưỡng từ Web
    }
    bool light_should_on = false;
    bool door_should_on = false;
    
    // Logic điều khiển đèn dựa trên ánh sáng
    if (current_lux < lux_threshold && current_lux > 0) {
        light_should_on = true;
    }
    
    // Logic điều khiển cửa dựa trên nhiệt độ/độ ẩm
    if (current_temp > temp_threshold || current_humidity > humid_threshold) {
        door_should_on = true;
    }
    
    // Chỉ thay đổi trạng thái nếu điều khiển tự động và AI/Web chưa can thiệp
    unsigned long time_since_command = millis() - last_command_time;
    
    if (time_since_command > 30000) { // Sau 30 giây không có lệnh AI/Web, trả về điều khiển tự động
        if (light_state != light_should_on) {
            light_state = light_should_on;
        }
        
        if (door_state != door_should_on) {
            door_state = door_should_on;
        }
    }
    
    update_leds();
}

// Cập nhật giao diện màn hình OLED theo current_screen
void update_display() {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    
    switch (current_screen) {
        case 0: // ESP32 AP IP (Chờ cấu hình Wifi)
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("ESP32 AP IP:");
            display.setTextSize(2);
            display.setCursor(0, 12);
            display.println("192.168.4.1");
            display.setTextSize(1);
            display.setCursor(0, 52);
            display.println("Connect to Wifi 'ESP'");
            break;
            
        case 1: // IP WiFi gia đình kết nối
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("HOME WIFI IP:");
            display.setTextSize(2);
            display.setCursor(0, 12);
            if (WiFi.status() == WL_CONNECTED) {
                display.println(WiFi.localIP().toString());
            } else {
                display.println("No WiFi");
            }
            display.setTextSize(1);
            display.setCursor(0, 52);
            display.println("Status: Connected");
            break;
            
        case 2: // Nhiệt độ & Độ ẩm
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("TEMP & HUMIDITY:");
            display.setTextSize(2);
            display.setCursor(0, 12);
            display.printf("%.1f C\n", current_temp);
            display.setCursor(0, 32);
            display.printf("%.1f %%\n", current_humidity);
            break;
            
        case 3: // Ánh sáng lux
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("LIGHT LEVEL:");
            display.setTextSize(2);
            display.setCursor(0, 12);
            display.printf("%.1f lx\n", current_lux);
            break;
            
        case 4: // AI Dự đoán
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("AI VOICE PREDICT:");
            display.setTextSize(1);
            display.setCursor(0, 12);
            display.printf("Label: %s\n", last_detected_keyword.c_str());
            display.setCursor(0, 24);
            display.printf("Conf: %d%%\n", (int)(last_detected_confidence * 100));
            display.setCursor(0, 36);
            display.printf("Awake: %s\n", system_awake ? "YES" : "NO");
            break;
            
        case 5: // Chuỗi văn bản tùy chọn nhập từ Web
            display.setCursor(0, 0);
            display.setTextSize(1);
            display.println("WEB CUSTOM TEXT:");
            display.setTextSize(2);
            display.setCursor(0, 12);
            if (custom_lcd_text.length() > 0) {
                display.println(custom_lcd_text);
            } else {
                display.println("(No Message)");
            }
            break;
    }
    display.display();
}

// Kiểm tra cảm biến chạm chuyển màn hình
void check_touch_sensor() {
    if (digitalRead(TOUCH_PIN) == HIGH) {
        current_screen = (current_screen + 1) % 6;
        Serial.printf("Touch detected. Switching screen to: %d\n", current_screen);
        update_display();
        
        // Chờ nhả tay ra để tránh lặp lệnh
        unsigned long press_start = millis();
        while (digitalRead(TOUCH_PIN) == HIGH) {
            delay(10);
            if (millis() - press_start > 1000) {
                esp_task_wdt_reset(); // Tránh Watchdog Reset khi giữ lâu
                press_start = millis();
            }
        }
    }
}

// ==================== MQTT COMMUNICATION ====================
void connect_mqtt() {
    if (WiFi.status() == WL_CONNECTED && !mqttClient.connected()) {
        Serial.print("Connecting to MQTT broker...");
        String clientId = "ESP32S3-Client-" + String(random(0xffff), HEX);
        if (mqttClient.connect(clientId.c_str())) {
            Serial.println("connected");
            
            // Subscribe tới control topic
            String clean_ip = WiFi.localIP().toString();
            clean_ip.replace(".", "_");
            String control_topic = "iot_ung_dung/team_2/control/" + clean_ip;
            mqttClient.subscribe(control_topic.c_str());
            Serial.printf("Subscribed to: %s\n", control_topic.c_str());
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" will try again in next loop");
        }
    }
}

void mqtt_callback(char* topic, byte* payload, unsigned int length) {
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) {
        Serial.print("deserializeJson() failed: ");
        Serial.println(error.c_str());
        return;
    }
    
    if (doc.containsKey("command")) {
        const char* cmd = doc["command"];
        if (strcmp(cmd, "light") == 0) {
            light_state = doc["state"];
            last_command_time = millis();
            update_leds();
            Serial.printf("MQTT command: light_state -> %s\n", light_state ? "ON" : "OFF");
        } 
        else if (strcmp(cmd, "door") == 0) {
            door_state = doc["state"];
            last_command_time = millis();
            update_leds();
            Serial.printf("MQTT command: door_state -> %s\n", door_state ? "OPEN" : "CLOSE");
        } 
        else if (strcmp(cmd, "settings") == 0) {
            if (doc.containsKey("tempThreshold")) {
                temp_threshold = doc["tempThreshold"];
            }
            if (doc.containsKey("humidThreshold")) {
                humid_threshold = doc["humidThreshold"];
            }
            if (doc.containsKey("lightThreshold")) {
                lux_threshold = doc["lightThreshold"];
            }
            thresholds_synchronized = true;
            Serial.printf("MQTT command: settings -> tempThreshold=%.1f, humidThreshold=%.1f, lightThreshold=%.1f\n", 
                          temp_threshold, humid_threshold, lux_threshold);
        }
        else if (strcmp(cmd, "lcd") == 0) {
            if (doc.containsKey("text")) {
                custom_lcd_text = doc["text"].as<String>();
                current_screen = 5; // Chuyển sang màn hình hiển thị Custom Text
                update_display();
                Serial.printf("MQTT command: lcd -> \"%s\"\n", custom_lcd_text.c_str());
            }
        }
    }
}

void publish_sensor_data() {
    if (!mqttClient.connected()) return;
    
    StaticJsonDocument<512> doc;
    doc["temp"] = current_temp;
    doc["humid"] = current_humidity;
    doc["light"] = current_lux;
    doc["light_state"] = light_state;
    doc["door_state"] = door_state;
    doc["ai_keyword"] = last_detected_keyword;
    doc["ai_conf"] = last_detected_confidence;
    doc["ip"] = WiFi.localIP().toString();
    doc["temp_threshold"] = temp_threshold;
    doc["humid_threshold"] = humid_threshold;
    doc["light_threshold"] = lux_threshold;
    doc["system_awake"] = system_awake;
    
    String json_str;
    serializeJson(doc, json_str);
    
    String clean_ip = WiFi.localIP().toString();
    clean_ip.replace(".", "_");
    String sensor_topic = "iot_ung_dung/team_2/sensor/" + clean_ip;
    
    bool published = mqttClient.publish(sensor_topic.c_str(), json_str.c_str());
    if (!published) {
        Serial.println("LỖI: Gửi bản tin MQTT thất bại (Gói tin vượt kích thước bộ đệm hoặc mất kết nối)!");
    }
    
    // In ra Serial monitor dạng chuẩn hóa JSON theo yêu cầu
    Serial.println(json_str);
}

// ==================== XỬ LÝ ÂM THANH ====================
void process_audio_advanced(int16_t* samples, size_t len) {
    int32_t sum = 0;
    for(size_t i = 0; i < len; i++) {
        sum += samples[i];
    }
    int32_t dc_offset = sum / len;
    
    static int16_t prev_sample = 0;
    for(size_t i = 0; i < len; i++) {
        int16_t current = samples[i] - dc_offset;
        samples[i] = current - 0.95 * prev_sample;
        prev_sample = current;
    }
    
    int16_t peak = 0;
    float avg_abs = 0;
    for(size_t i = 0; i < len; i++) {
        int16_t abs_val = abs(samples[i]);
        avg_abs += abs_val;
        if(abs_val > peak) peak = abs_val;
    }
    avg_abs /= len;
    
    if(peak > 0) {
        float target_gain = (float)AUTO_GAIN_TARGET / max(peak, (int16_t)100);
        float avg_gain = (float)AUTO_GAIN_TARGET / max(avg_abs, 10.0f);
        
        float final_gain = max(target_gain, avg_gain);
        if(final_gain > AUTO_GAIN_MAX) final_gain = AUTO_GAIN_MAX;
        if(final_gain < 2.0) final_gain = 2.0;
        
        audio_proc.auto_gain = audio_proc.auto_gain * 0.5 + final_gain * 0.5;
        
        for(size_t i = 0; i < len; i++) {
            int32_t amplified = samples[i] * audio_proc.auto_gain;
            
            if(amplified > 30000) amplified = 30000 + (amplified - 30000) / 2;
            if(amplified < -30000) amplified = -30000 + (amplified + 30000) / 2;
            if(amplified > 32767) amplified = 32767;
            if(amplified < -32768) amplified = -32768;
            
            samples[i] = amplified;
        }
    }
}

bool detect_speech_advanced(int16_t* samples, size_t len) {
    float frame_energy = 0;
    float frame_peak = 0;
    float weighted_energy = 0;
    
    for(size_t i = 0; i < len; i++) {
        float abs_val = abs(samples[i]);
        frame_energy += abs_val;
        if(abs_val > frame_peak) frame_peak = abs_val;
        weighted_energy += abs_val * abs_val / 1000.0;
    }
    
    frame_energy /= len;
    weighted_energy /= len;
    
    float combined_energy = frame_energy * 0.4 + weighted_energy * 0.3 + frame_peak * 0.3;
    
    audio_proc.energy_history[audio_proc.history_index] = combined_energy;
    audio_proc.history_index = (audio_proc.history_index + 1) % ENERGY_HISTORY_SIZE;
    
    float avg_energy = 0;
    for(int i = 0; i < ENERGY_HISTORY_SIZE; i++) {
        avg_energy += audio_proc.energy_history[i];
    }
    avg_energy /= ENERGY_HISTORY_SIZE;
    audio_proc.avg_energy = avg_energy;
    
    if(combined_energy > audio_proc.peak_energy) {
        audio_proc.peak_energy = combined_energy;
    } else {
        audio_proc.peak_energy *= 0.98;
    }
    
    if(!audio_proc.is_speech && combined_energy < audio_proc.peak_energy * 0.3) {
        update_noise_profile(combined_energy);
    }
    
    float vad_threshold = noise_mgr.noise_floor * VAD_THRESHOLD_MULTIPLIER;
    if(vad_threshold < MIN_VOICE_ENERGY) vad_threshold = MIN_VOICE_ENERGY;
    
    bool is_speech_now = (
        (combined_energy > vad_threshold) || 
        (frame_peak > vad_threshold * 3) ||
        (combined_energy > audio_proc.avg_energy * 1.5 && audio_proc.avg_energy > 0)
    );
    
    if(is_speech_now) {
        audio_proc.voice_frames = min(audio_proc.voice_frames + 1, 10);
        noise_mgr.silence_counter = 0;
    } else {
        noise_mgr.silence_counter++;
        if(noise_mgr.silence_counter > SILENCE_FRAMES_THRESHOLD) {
            audio_proc.voice_frames = 0;
        }
    }
    
    audio_proc.is_speech = (audio_proc.voice_frames > 1);
    
    return audio_proc.is_speech;
}

void update_noise_profile(float current_level) {
    noise_mgr.noise_profile[noise_mgr.profile_index] = current_level;
    noise_mgr.profile_index = (noise_mgr.profile_index + 1) % NOISE_PROFILE_SIZE;
    
    vector<float> sorted(noise_mgr.noise_profile, noise_mgr.noise_profile + NOISE_PROFILE_SIZE);
    sort(sorted.begin(), sorted.end());
    
    noise_mgr.min_noise = sorted[NOISE_PROFILE_SIZE / 4];
    noise_mgr.max_noise = sorted[NOISE_PROFILE_SIZE * 3 / 4];
    
    noise_mgr.noise_floor = noise_mgr.noise_floor * 0.7 + noise_mgr.min_noise * 0.3;
    if(noise_mgr.noise_floor < 20) noise_mgr.noise_floor = 20;
}

float calculate_confidence_threshold(void) {
    float threshold = MIN_CONFIDENCE;
    
    if(noise_mgr.noise_floor < 150) {
        threshold = 0.40;
    } else if(noise_mgr.noise_floor < 400) {
        threshold = 0.45;
    } else if(noise_mgr.noise_floor < 800) {
        threshold = 0.50;
    } else {
        threshold = 0.60;
    }
    
    return threshold;
}

// ==================== XỬ LÝ LED ====================
void update_leds() {
    // LED điều khiển đèn (GPIO4)
    digitalWrite(LED_LIGHT, light_state ? HIGH : LOW);
    
    // LED điều khiển cửa (GPIO8)
    digitalWrite(LED_DOOR, door_state ? HIGH : LOW);
}

// ==================== XỬ LÝ WAKE-UP LED ====================
void update_wakeup_led() {
    if(system_awake) {
        // Hệ thống AI được đánh thức: LED wakeup nháy
        unsigned long current_time = millis();
        if(current_time - last_blink_time >= WAKEUP_LED_BLINK_MS) {
            wakeup_led_state = !wakeup_led_state;
            digitalWrite(WAKEUP_GPIO, wakeup_led_state ? HIGH : LOW);
            last_blink_time = current_time;
        }
    } else {
        // Hệ thống chưa được đánh thức: LED wakeup tắt
        digitalWrite(WAKEUP_GPIO, LOW);
        wakeup_led_state = false;
    }
}

// ==================== XỬ LÝ HỆ THỐNG WAKE-UP ====================
void handle_wakeup_system(const char* command, float confidence) {
    if(strcmp(command, "xin chào") == 0) {
        system_awake = true;
        last_command_time = millis();
        Serial.println("\n=== HỆ THỐNG AI ĐƯỢC ĐÁNH THỨC ===");
        Serial.println("Bạn có thể ra lệnh: 'bật đèn', 'tắt đèn', 'mở cửa', 'đóng cửa'");
    }
    else if(system_awake) {
        last_command_time = millis();  // Cập nhật thời gian hoạt động
        
        if (strcmp(command, "bật đèn") == 0) {
            light_state = true;
            Serial.printf("✓ ĐÈN đã BẬT (bằng giọng nói, độ tin cậy: %d%%)\n", (int)(confidence * 100));
        }
        else if (strcmp(command, "tắt đèn") == 0) {
            light_state = false;
            Serial.printf("✓ ĐÈN đã TẮT (bằng giọng nói, độ tin cậy: %d%%)\n", (int)(confidence * 100));
        }
        else if (strcmp(command, "mở cửa") == 0) {
            door_state = true;
            Serial.printf("✓ CỬA đã MỞ (bằng giọng nói, độ tin cậy: %d%%)\n", (int)(confidence * 100));
        }
        else if (strcmp(command, "đóng cửa") == 0) {
            door_state = false;
            Serial.printf("✓ CỬA đã ĐÓNG (bằng giọng nói, độ tin cậy: %d%%)\n", (int)(confidence * 100));
        }
        
        update_leds();
        
        // LED wake-up nhấp nháy nhanh báo hiệu nhận lệnh
        digitalWrite(WAKEUP_GPIO, HIGH);
        delay(100);
        digitalWrite(WAKEUP_GPIO, LOW);
    }
}

void print_simple_status(const char* keyword, float conf) {
    static int counter = 0;
    counter++;
    
    if(conf > HIGH_CONFIDENCE) {
        Serial.printf("✓ [%d] %s (%d%%)\n", counter, keyword, (int)(conf * 100));
    } else {
        Serial.printf("  [%d] %s (%d%%)\n", counter, keyword, (int)(conf * 100));
    }
}

// ==================== AUDIO INFERENCE ====================
static void audio_inference_callback(uint32_t n_bytes) {
    feed_watchdog();
    for (int i = 0; i < n_bytes >> 1; i++) {
        inference.buffers[inference.buf_select][inference.buf_count++] = sampleBuffer[i];
        if (inference.buf_count >= inference.n_samples) {
            inference.buf_select ^= 1;
            inference.buf_count = 0;
            inference.buf_ready = 1;
        }
    }
}

static void capture_samples(void *arg) {
    esp_task_wdt_add(xTaskGetCurrentTaskHandle());
    const int32_t i2s_bytes_to_read = (uint32_t)arg;
    
    while (record_status) {
        esp_task_wdt_reset();
        size_t bytes_read = i2s_bytes_to_read;
        
        esp_i2s::i2s_read(esp_i2s::I2S_NUM_0, (void *)sampleBuffer, 
                          i2s_bytes_to_read, &bytes_read, 100);

        if (bytes_read > 0) {
            process_audio_advanced(sampleBuffer, i2s_bytes_to_read / 2);
            detect_speech_advanced(sampleBuffer, i2s_bytes_to_read / 2);
            
            if (record_status) {
                audio_inference_callback(i2s_bytes_to_read);
            }
        }
        taskYIELD();
    }
    
    esp_task_wdt_delete(xTaskGetCurrentTaskHandle());
    vTaskDelete(NULL);
}

static bool microphone_inference_start(uint32_t n_samples) {
    inference.buffers[0] = (signed short *)malloc(n_samples * sizeof(signed short));
    if (!inference.buffers[0]) return false;
    
    inference.buffers[1] = (signed short *)malloc(n_samples * sizeof(signed short));
    if (!inference.buffers[1]) {
        free(inference.buffers[0]);
        return false;
    }

    inference.buf_select = 0;
    inference.buf_count = 0;
    inference.n_samples = n_samples;
    inference.buf_ready = 0;
    
    record_status = true;
    
    xTaskCreatePinnedToCore(controll_task, "Controll", 4096, NULL, 8, NULL, 1);
    xTaskCreatePinnedToCore(capture_samples, "CaptureSamples", 8192, 
                           (void *)sample_buffer_size, 10, NULL, 0);
    return true;
}

static bool microphone_inference_record(void) {
    int timeout = 0;
    while (!inference.buf_ready && timeout < 500) {
        delay(1);
        timeout++;
    }
    if (inference.buf_ready) {
        inference.buf_ready = 0;
        return true;
    }
    return false;
}

static int microphone_audio_signal_get_data(size_t offset, size_t length, float *out_ptr) {
    numpy::int16_to_float(&inference.buffers[inference.buf_select ^ 1][offset], out_ptr, length);
    return 0;
}

// ==================== TASK ĐIỀU KHIỂN NỀN ====================
static void controll_task(void *arg) {
    esp_task_wdt_add(xTaskGetCurrentTaskHandle());
    
    while (1) {
        esp_task_wdt_reset();
        
        // 1. Kết nối và duy trì MQTT nếu đã có WiFi
        if (WiFi.status() == WL_CONNECTED) {
            if (!mqttClient.connected()) {
                connect_mqtt();
            }
            mqttClient.loop();
        }
        
        // 2. Kiểm tra phím chạm Touch chuyển màn hình OLED
        check_touch_sensor();
        
        // 3. Đọc cảm biến và cập nhật định kỳ
        unsigned long current_time = millis();
        if (current_time - last_sensor_read >= SENSOR_READ_INTERVAL) {
            read_sensors();
            last_sensor_read = current_time;
            
            // Cập nhật điều khiển tự động dựa trên cảm biến & ngưỡng cài đặt
            update_sensor_based_controls();
            
            // Xuất bản dữ liệu JSON qua MQTT & Serial Monitor
            publish_sensor_data();
            
            // Cập nhật hiển thị màn hình OLED
            update_display();
        }
        
        // 4. Kiểm tra timeout hệ thống AI
        if(system_awake) {
            unsigned long current_time = millis();
            if(current_time - last_command_time >= WAKEUP_TIMEOUT_MS) {
                system_awake = false;
                Serial.println("\n=== HỆ THỐNG AI NGỦ (TIMEOUT 5s) ===");
                Serial.println("Hãy nói 'xin chào' để đánh thức lại!\n");
            }
        }
        
        update_leds();
        update_wakeup_led();
        taskYIELD();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

// ==================== SETUP & LOOP ====================
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n========================================");
    Serial.println("=== HỆ THỐNG ĐIỀU KHIỂN THÔNG MINH IoT ===");
    Serial.println("========================================\n");
    
    // Khởi tạo các chân GPIO
    pinMode(LED_LIGHT, OUTPUT);
    pinMode(LED_DOOR, OUTPUT);
    pinMode(WAKEUP_GPIO, OUTPUT);
    pinMode(TOUCH_PIN, INPUT);
    
    // Khởi tạo trạng thái LED ban đầu
    light_state = false;
    door_state = false;
    system_awake = false;
    last_command_time = 0;
    
    update_leds();
    update_wakeup_led();
    
    // Khởi tạo cảm biến và OLED
    init_sensors();
    
    boot_indicator();
    
    // Khởi động cổng cấu hình WiFiManager AP
    Serial.println("Đang khởi tạo WiFiManager...");
    // Xóa cấu hình WiFi cũ mỗi lần khởi động để cấu hình lại mạng mới
    wm.resetSettings();
    
    current_screen = 0; // Hiển thị màn hình 0 (IP AP: 192.168.4.1)
    update_display();
    
    if (!wm.autoConnect("ESP")) {
        display.clearDisplay();
        display.setCursor(0, 10);
        display.println("Failed WiFi");
        display.println("Restarting...");
        display.display();
        delay(2000);
        ESP.restart();
    }
    
    Serial.println("WiFi connected!");
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());
    
    current_screen = 1; // Tự động chuyển qua màn hình 1 (Home WiFi IP)
    update_display();
    
    // Cấu hình MQTT client
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqtt_callback);
    mqttClient.setBufferSize(512); // Tăng kích thước bộ đệm lên 512 bytes để gửi nhận JSON dung lượng lớn
    
    if (!init_i2s_with_retry()) {
        Serial.println("LỖI: Không thể khởi tạo I2S!");
    }
    
    ledEventGroup = xEventGroupCreate();
    init_audio_processing();
    
    run_classifier_init();
    
    delay(500);
    microphone_inference_start(EI_CLASSIFIER_RAW_SAMPLE_COUNT);
    
    // Bật Watchdog sau khi đã cấu hình WiFi và khởi chạy các Task
    setup_watchdog();
    
    Serial.println("\n=== HỆ THỐNG SẴN SÀNG ===");
}

void loop() {
    feed_watchdog();
    
    bool m = microphone_inference_record();
    if (!m) {
        delay(5);
        return;
    }
    
    signal_t signal;
    signal.total_length = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
    signal.get_data = &microphone_audio_signal_get_data;
    ei_impulse_result_t result = {0};

    if (run_classifier_continuous(&signal, &result, debug_nn) != EI_IMPULSE_OK) {
        return;
    }
    
    float best_value = 0;
    int best_idx = -1;
    
    for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; i++) {
        if (result.classification[i].value > best_value) {
            best_value = result.classification[i].value;
            best_idx = i;
        }
    }
    
    float threshold = calculate_confidence_threshold();
    if (best_idx >= 0 && best_value >= threshold) {
        const char* detected = result.classification[best_idx].label;
        
        if (strcmp(detected, "noise") != 0 && 
            strcmp(detected, "_unknown") != 0 &&
            strcmp(detected, "unknown") != 0) {
            
            last_detected_keyword = String(detected);
            last_detected_confidence = best_value;
            last_keyword_detected_time = millis(); // Ghi nhận thời gian phát hiện từ khóa giọng nói thực tế
            handle_wakeup_system(detected, best_value);
        } else {
            // Chỉ trả về noise sau 2 giây để task gửi tin MQTT (chạy mỗi 2s) kịp bắt và hiển thị lên Web
            if (millis() - last_keyword_detected_time >= 2000) {
                last_detected_keyword = "noise";
                last_detected_confidence = best_value;
            }
        }
    } else {
        // Chỉ trả về noise sau 2 giây
        if (millis() - last_keyword_detected_time >= 2000) {
            last_detected_keyword = "noise";
            last_detected_confidence = 0.0;
        }
    }
}

#if !defined(EI_CLASSIFIER_SENSOR) || EI_CLASSIFIER_SENSOR != EI_CLASSIFIER_SENSOR_MICROPHONE
#error "Invalid model for current sensor."
#endif