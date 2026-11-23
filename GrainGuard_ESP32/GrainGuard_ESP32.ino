#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"
#include <WiFi.h>
#include <WebServer.h>

// =====================================
// 1. KONFIGURASI OLED
// =====================================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// =====================================
// 2. KONFIGURASI PIN HARDWARE
// =====================================
#define DHTPIN 4
#define DHTTYPE DHT11

#define BUZZER_PIN 14
#define RELAY_PIN 27
#define LDR_PIN 32

DHT dht(DHTPIN, DHTTYPE);

// Relay Active LOW
#define RELAY_ON LOW
#define RELAY_OFF HIGH

// =====================================
// 3. KONFIGURASI WIFI & WEBSERVER
// =====================================
// Mode 1: Access Point (AP) - ESP32 membuat WiFi sendiri
// Alamat default: http://192.168.4.1 (cocok dengan default dashboard)
const char* AP_SSID = "GrainGuard-ESP32";
const char* AP_PASS = "12345678"; // Minimal 8 karakter

// Mode 2: Station (STA) - Hubungkan ESP32 ke WiFi rumah/hotspot (opsional)
// Kosongkan "" jika hanya ingin menggunakan Mode Access Point
const char* WIFI_SSID = ""; 
const char* WIFI_PASS = "";

WebServer server(80);

// =====================================
// 4. BATAS SENSOR & AMBANG DETEKSI
// =====================================
const float BATAS_SUHU_TIDAK_NORMAL = 25.0;
const float BATAS_SUHU_STABIL = 20.0;

// Ambang LDR berdasarkan hasil kalibrasi deteksi tutup wadah
const int BATAS_LDR_BUKA = 244;
const int BATAS_LDR_TUTUP = 248;

const unsigned long INTERVAL_SENSOR = 2000;

// =====================================
// 5. VARIABEL SISTEM
// =====================================
unsigned long waktuSensor = 0;

float suhuSekarang = 0.0;
float kelembapanSekarang = 0.0;

int nilaiLDR = 0;

bool sensorValid = false;
bool statusTutupTerbuka = false;
bool statusKipas = false;
bool statusAlarm = false;
bool statusAutoKipas = false;

// =====================================
// 6. MODE KONTROL
// =====================================
enum ModeKontrol {
  AUTO,
  MANUAL_ON,
  MANUAL_OFF
};

ModeKontrol modeRelay = AUTO;

// =====================================
// 7. MEMBACA LDR
// =====================================
int bacaLDR() {
  long total = 0;

  for (int i = 0; i < 10; i++) {
    total += analogRead(LDR_PIN);
    delay(2);
  }

  return total / 10;
}

// =====================================
// 8. DETEKSI TUTUP
// =====================================
bool deteksiTutup(int adc, bool statusSebelumnya) {
  // Jika sebelumnya tertutup dan ADC turun sampai 244 atau lebih kecil -> Terbuka
  if (!statusSebelumnya && adc <= BATAS_LDR_BUKA) {
    return true;
  }

  // Jika sebelumnya terbuka dan ADC naik sampai 248 atau lebih besar -> Tertutup
  if (statusSebelumnya && adc >= BATAS_LDR_TUTUP) {
    return false;
  }

  // Pertahankan status sebelumnya (histeresis)
  return statusSebelumnya;
}

// =====================================
// 9. KONTROL KIPAS
// =====================================
void kontrolKipas() {
  if (modeRelay == MANUAL_ON) {
    statusKipas = true;
  }
  else if (modeRelay == MANUAL_OFF) {
    statusKipas = false;
  }
  else if (modeRelay == AUTO) {
    if (!sensorValid) {
      statusAutoKipas = false;
    } else {
      if (suhuSekarang >= BATAS_SUHU_TIDAK_NORMAL) {
        statusAutoKipas = true;
      } else if (suhuSekarang <= BATAS_SUHU_STABIL) {
        statusAutoKipas = false;
      }
    }
    statusKipas = statusAutoKipas;
  }

  digitalWrite(
    RELAY_PIN,
    statusKipas ? RELAY_ON : RELAY_OFF
  );
}

// =====================================
// 10. KONTROL BUZZER
// =====================================
void kontrolBuzzer() {
  if (!sensorValid) {
    statusAlarm = false;
  } else {
    if (suhuSekarang >= BATAS_SUHU_TIDAK_NORMAL) {
      statusAlarm = true;
    } else if (suhuSekarang <= BATAS_SUHU_STABIL) {
      statusAlarm = false;
    }
  }

  // Jika alarm tidak aktif, matikan buzzer
  if (!statusAlarm) {
    digitalWrite(BUZZER_PIN, LOW);
    return;
  }

  // Bunyi 200 ms setiap 1 detik
  unsigned long fase = millis() % 1000;

  if (fase >= 200) {
    digitalWrite(BUZZER_PIN, LOW);
    return;
  }

  // Menghasilkan gelombang 1 kHz secara manual
  static unsigned long waktuToggle = 0;
  static bool kondisiBuzzer = false;

  unsigned long sekarang = micros();

  if (sekarang - waktuToggle >= 500) {
    waktuToggle = sekarang;
    kondisiBuzzer = !kondisiBuzzer;

    digitalWrite(
      BUZZER_PIN,
      kondisiBuzzer ? HIGH : LOW
    );
  }
}

// =====================================
// 11. TAMPILAN OLED
// =====================================
void tampilkanOLED() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);

  display.setCursor(20, 0);
  display.println("GRAINGUARD");

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  display.setCursor(0, 14);
  display.print("Suhu: ");
  if (sensorValid) {
    display.print(suhuSekarang, 1);
    display.print(" C");
  } else {
    display.print("ERROR");
  }

  display.setCursor(0, 25);
  display.print("RH: ");
  if (sensorValid) {
    display.print(kelembapanSekarang, 1);
    display.print(" %");
  } else {
    display.print("ERROR");
  }

  display.setCursor(0, 36);
  display.print("LDR: ");
  display.print(nilaiLDR);

  display.setCursor(0, 47);
  display.print("Lid: ");
  display.print(statusTutupTerbuka ? "OPEN" : "CLOSED");

  display.setCursor(75, 47);
  display.print("Fan: ");
  display.print(statusKipas ? "ON" : "OFF");

  display.setCursor(0, 57);
  display.print("Mode: ");
  if (modeRelay == AUTO) {
    display.print("AUTO");
  } else if (modeRelay == MANUAL_ON) {
    display.print("MANUAL ON");
  } else {
    display.print("MANUAL OFF");
  }

  display.display();
}

// =====================================
// 12. SERIAL MONITOR
// =====================================
void tampilkanSerial() {
  Serial.println("\n========== GRAINGUARD ==========");

  Serial.print("Suhu       : ");
  if (sensorValid) {
    Serial.print(suhuSekarang, 1);
    Serial.println(" C");
  } else {
    Serial.println("ERROR");
  }

  Serial.print("Kelembapan : ");
  if (sensorValid) {
    Serial.print(kelembapanSekarang, 1);
    Serial.println(" %");
  } else {
    Serial.println("ERROR");
  }

  Serial.print("LDR ADC    : ");
  Serial.println(nilaiLDR);

  Serial.print("Ambang Buka  : ");
  Serial.println(BATAS_LDR_BUKA);

  Serial.print("Ambang Tutup : ");
  Serial.println(BATAS_LDR_TUTUP);

  Serial.print("Tutup      : ");
  Serial.println(statusTutupTerbuka ? "TERBUKA" : "TERTUTUP");

  Serial.print("Kipas      : ");
  Serial.println(statusKipas ? "ON" : "OFF");

  Serial.print("Alarm      : ");
  Serial.println(statusAlarm ? "ON" : "OFF");

  Serial.print("Mode       : ");
  if (modeRelay == AUTO) {
    Serial.println("AUTO");
  } else if (modeRelay == MANUAL_ON) {
    Serial.println("MANUAL ON");
  } else {
    Serial.println("MANUAL OFF");
  }

  Serial.println("================================");
}

// =====================================
// 13. PERINTAH SERIAL
// =====================================
void bacaPerintahSerial() {
  if (Serial.available() > 0) {
    String perintah = Serial.readStringUntil('\n');
    perintah.trim();
    perintah.toUpperCase();

    if (perintah == "ON") {
      modeRelay = MANUAL_ON;
      kontrolKipas();
      Serial.println("PERINTAH: KIPAS MANUAL ON");
    }
    else if (perintah == "OFF") {
      modeRelay = MANUAL_OFF;
      kontrolKipas();
      Serial.println("PERINTAH: KIPAS MANUAL OFF");
    }
    else if (perintah == "AUTO") {
      modeRelay = AUTO;
      statusAutoKipas = false;
      kontrolKipas();
      Serial.println("PERINTAH: MODE AUTO");
    }
    else {
      Serial.println("Perintah tidak dikenal. Gunakan ON, OFF, atau AUTO.");
    }
  }
}

// =====================================
// 14. HELPER & HANDLER HTTP WEBSERVER (DASHBOARD)
// =====================================
void sendCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

void handleOptions() {
  sendCORSHeaders();
  server.send(204);
}

void handleRoot() {
  sendCORSHeaders();
  String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>GrainGuard IoT</title>";
  html += "<style>body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background:#F7F8F3;color:#26352C;text-align:center;padding:40px;}";
  html += ".box{background:#FFFFFF;max-width:480px;margin:auto;padding:30px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border:1px solid #E5EBE5;}";
  html += "h1{color:#1F4D3A;margin-bottom:8px;}";
  html += ".btn{display:inline-block;padding:10px 20px;margin:8px;background:#1F4D3A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;}";
  html += "</style></head><body><div class='box'>";
  html += "<h1>🌾 GrainGuard Node</h1>";
  html += "<p>ESP32 siap terhubung dengan Web Dashboard.</p>";
  html += "<p><strong>Endpoint Data:</strong></p>";
  html += "<a class='btn' href='/data'>Cek JSON /data</a>";
  html += "<p style='font-size:13px;color:#7C8980;margin-top:20px;'>Buka web dashboard GrainGuard dan arahkan URL ke IP ESP32 ini.</p>";
  html += "</div></body></html>";
  server.send(200, "text/html", html);
}

void handleGetData() {
  sendCORSHeaders();

  // Validasi data float agar tidak menghasilkan NaN pada JSON
  float tKirim = sensorValid ? suhuSekarang : 0.0;
  float hKirim = sensorValid ? kelembapanSekarang : 0.0;

  char json[320];
  snprintf(json, sizeof(json),
    "{\"temperature\":%.1f,\"humidity\":%.1f,\"light\":%d,\"lid\":\"%s\",\"lidOpen\":%s,\"fan\":%s,\"alarm\":%s,\"mode\":\"%s\",\"sensorValid\":%s}",
    tKirim,
    hKirim,
    nilaiLDR,
    statusTutupTerbuka ? "OPEN" : "CLOSED",
    statusTutupTerbuka ? "true" : "false",
    statusKipas ? "true" : "false",
    statusAlarm ? "true" : "false",
    (modeRelay == AUTO) ? "AUTO" : ((modeRelay == MANUAL_ON) ? "MANUAL_ON" : "MANUAL_OFF"),
    sensorValid ? "true" : "false"
  );

  server.send(200, "application/json", json);
}

void handleFan() {
  sendCORSHeaders();

  if (server.hasArg("state")) {
    String state = server.arg("state");
    state.toLowerCase();

    if (state == "on" || state == "1" || state == "true") {
      modeRelay = MANUAL_ON;
      statusKipas = true;
      digitalWrite(RELAY_PIN, RELAY_ON);
      Serial.println("[WEB API] Kipas: MANUAL ON");
    } else if (state == "off" || state == "0" || state == "false") {
      modeRelay = MANUAL_OFF;
      statusKipas = false;
      digitalWrite(RELAY_PIN, RELAY_OFF);
      Serial.println("[WEB API] Kipas: MANUAL OFF");
    } else if (state == "auto") {
      modeRelay = AUTO;
      statusAutoKipas = false;
      kontrolKipas();
      Serial.println("[WEB API] Mode: AUTO");
    }
  }

  char res[128];
  snprintf(res, sizeof(res),
    "{\"status\":\"ok\",\"fan\":%s,\"mode\":\"%s\"}",
    statusKipas ? "true" : "false",
    (modeRelay == AUTO) ? "AUTO" : ((modeRelay == MANUAL_ON) ? "MANUAL_ON" : "MANUAL_OFF")
  );

  server.send(200, "application/json", res);
}

void handleMode() {
  sendCORSHeaders();

  if (server.hasArg("state")) {
    String state = server.arg("state");
    state.toLowerCase();

    if (state == "auto" || state == "true") {
      modeRelay = AUTO;
      statusAutoKipas = false;
      kontrolKipas();
      Serial.println("[WEB API] Mode berganti: AUTO");
    } else if (state == "manual" || state == "false") {
      modeRelay = statusKipas ? MANUAL_ON : MANUAL_OFF;
      kontrolKipas();
      Serial.println("[WEB API] Mode berganti: MANUAL");
    }
  }

  char res[128];
  snprintf(res, sizeof(res),
    "{\"status\":\"ok\",\"mode\":\"%s\"}",
    (modeRelay == AUTO) ? "AUTO" : "MANUAL"
  );

  server.send(200, "application/json", res);
}

// =====================================
// 15. SETUP
// =====================================
void setup() {
  Serial.begin(9600);
  Serial.setTimeout(30);

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  digitalWrite(RELAY_PIN, RELAY_OFF);
  digitalWrite(BUZZER_PIN, LOW);

  analogReadResolution(12);
  analogSetPinAttenuation(LDR_PIN, ADC_11db);

  dht.begin();

  // Inisialisasi OLED SSD1306
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("OLED tidak ditemukan! Periksa koneksi SDA (GPIO 21) & SCL (GPIO 22).");
    while (true) {
      delay(100);
    }
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(15, 10);
  display.println("GrainGuard Booting");
  display.display();

  // Setup WiFi Access Point & Station
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(AP_SSID, AP_PASS);

  Serial.println("\n=================================");
  Serial.println("GRAINGUARD STARTED");
  Serial.print("WiFi AP Aktif  : ");
  Serial.println(AP_SSID);
  Serial.print("IP Dashboard AP: http://");
  Serial.println(WiFi.softAPIP());

  // Hubungkan ke WiFi rumah jika disetel
  if (strlen(WIFI_SSID) > 0) {
    Serial.print("Menghubungkan ke WiFi Router: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    unsigned long mulaiKoneksi = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - mulaiKoneksi < 6000) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("Terhubung ke WiFi Router! IP STA: http://");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("Gagal terhubung router, tetap aktif pada WiFi AP bawaan.");
    }
  }
  Serial.println("=================================");

  // Inisialisasi Endpoint WebServer
  server.on("/", HTTP_GET, handleRoot);
  server.on("/data", HTTP_GET, handleGetData);
  server.on("/fan", HTTP_GET, handleFan);
  server.on("/fan", HTTP_POST, handleFan);
  server.on("/mode", HTTP_GET, handleMode);
  server.on("/mode", HTTP_POST, handleMode);

  // Endpoint CORS Options (Preflight browser)
  server.on("/data", HTTP_OPTIONS, handleOptions);
  server.on("/fan", HTTP_OPTIONS, handleOptions);
  server.on("/mode", HTTP_OPTIONS, handleOptions);

  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      handleOptions();
    } else {
      sendCORSHeaders();
      server.send(404, "text/plain", "Endpoint Not Found");
    }
  });

  server.begin();
  Serial.println("Web Server HTTP Aktif di Port 80");

  // Tampilkan info IP di layar OLED saat boot
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("GrainGuard Ready");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  display.setCursor(0, 18);
  display.print("AP: ");
  display.println(AP_SSID);
  display.setCursor(0, 30);
  display.print("IP: ");
  display.println(WiFi.softAPIP());
  if (WiFi.status() == WL_CONNECTED) {
    display.setCursor(0, 44);
    display.print("STA: ");
    display.println(WiFi.localIP());
  }
  display.display();
  delay(2500);

  Serial.println("Perintah kontrol Serial:");
  Serial.println("ON   = Kipas menyala");
  Serial.println("OFF  = Kipas mati");
  Serial.println("AUTO = Kontrol otomatis");
}

// =====================================
// 16. LOOP UTAMA
// =====================================
void loop() {
  // Layani permintaan HTTP dari Web Dashboard
  server.handleClient();

  // Baca input serial
  bacaPerintahSerial();

  // Pembacaan sensor periodik
  unsigned long sekarang = millis();

  if (sekarang - waktuSensor >= INTERVAL_SENSOR) {
    waktuSensor = sekarang;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    nilaiLDR = bacaLDR();

    if (isnan(h) || isnan(t)) {
      sensorValid = false;
      Serial.println("PERINGATAN: DHT11 ERROR!");
    } else {
      sensorValid = true;
      suhuSekarang = t;
      kelembapanSekarang = h;
    }

    statusTutupTerbuka = deteksiTutup(
      nilaiLDR,
      statusTutupTerbuka
    );

    kontrolKipas();
    kontrolBuzzer();

    tampilkanOLED();
    tampilkanSerial();
  }

  // Kontrol buzzer dengan modulasi frekuensi non-blocking
  kontrolBuzzer();
}
