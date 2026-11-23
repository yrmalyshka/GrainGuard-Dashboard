# GrainGuard IoT Monitoring Dashboard

Dashboard web modern dan sistem embedded berbasis ESP32 untuk memantau kondisi lingkungan ruang penyimpanan hasil panen berbasis Internet of Things (IoT).

---

## 🔌 Skema Sambungan Rangkaian Hardware (ESP32)

Berikut adalah panduan penyambungan pin antara ESP32 DevKit V1 dan semua modul sensor/aktuator:

| Komponen | Pin Modul | Pin ESP32 (GPIO) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Layar OLED 0.96" SSD1306** | VCC | 3.3V / VIN (5V) | Jalur Daya Layar |
| | GND | GND | Ground |
| | SDA | **GPIO 21** | I2C Data (Wire default) |
| | SCL | **GPIO 22** | I2C Clock (Wire default) |
| **Sensor Suhu & RH (DHT11)** | VCC / + | 3.3V atau VIN (5V) | Jalur Daya Sensor |
| | GND / - | GND | Ground |
| | DATA / OUT | **GPIO 4** | Sinyal Digital DHT11 (Pull-up 4.7k-10k jika bare sensor) |
| **Sensor Cahaya (LDR)** | VCC | 3.3V | Gunakan 3.3V untuk ADC ESP32 |
| *(Deteksi Tutup Wadah)* | GND | GND | Ground pembagi tegangan (10kΩ) |
| | Sinyal / AO | **GPIO 32** | ADC1_CH4 (Aman digunakan bersamaan dengan WiFi) |
| **Modul Relay (Kipas DC)** | VCC | VIN (5V) | Daya koil relay |
| *(Active LOW)* | GND | GND | Ground |
| | IN | **GPIO 27** | Sinyal Kontrol Relay |
| | NO & COM | Seri Jalur (+) Kipas | Menghubungkan kipas pendingin ke sumber daya |
| **Buzzer Alarm** | Positive (+) | **GPIO 14** | Sinyal PWM / Tone Alarm 1 kHz |
| | Negative (-) | GND | Ground |

> [!NOTE]
> Pin **GPIO 32** digunakan untuk LDR karena berada pada **ADC1**. Pada ESP32, ADC2 tidak dapat membaca analog saat radio WiFi sedang aktif, sehingga pemilihan GPIO 32 menjamin pembacaan analog LDR tetap 100% akurat saat WiFi beroperasi.

---

## 📡 File Firmware ESP32

File program ESP32 telah disediakan di:
📂 `GrainGuard_ESP32/GrainGuard_ESP32.ino`

### Fitur Firmware:
- **Dual WiFi Mode**: Otomatis membuat Access Point `GrainGuard-ESP32` (IP default: `http://192.168.4.1`) dan opsional terhubung ke WiFi router.
- **HTTP REST API & Full CORS**: Mendukung integrasi mulus dengan Web Dashboard (menghindari error CORS browser).
- **Layar OLED**: Menampilkan IP jaringan, suhu, kelembapan, status LDR, status tutup wadah, kipas, dan mode kontrol.
- **Logika Histeresis**: Mencegah relay & buzzer berkedip cepat di sekitar ambang batas.

### Endpoint API:
- `GET /data` : Mengembalikan status real-time sensor dan aktuator (JSON).
- `POST /fan?state=on` : Menyalakan kipas pendingin secara manual.
- `POST /fan?state=off` : Mematikan kipas pendingin secara manual.
- `POST /mode?state=auto` : Mengembalikan sistem ke mode otomatis.

---

## 🚀 Cara Menjalankan Dashboard Web

1. Pastikan Anda sudah menginstal **Node.js** (v18+ disarankan).
2. Buka terminal di folder project ini:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka URL yang muncul di terminal (biasanya `http://localhost:5173`).
5. Pada header dashboard:
   - Pilih **Demo Mode** untuk mencoba fitur simulasi.
   - Pilih **ESP32 Mode** untuk mengambil data real-time langsung dari modul ESP32 fisik. Pastikan laptop/PC terhubung ke WiFi `GrainGuard-ESP32` atau satu jaringan dengan ESP32.

