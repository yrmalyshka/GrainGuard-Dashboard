# GrainGuard IoT Monitoring Dashboard

Dashboard web untuk memantau kondisi lingkungan ruang penyimpanan hasil panen berbasis Internet of Things (IoT).

## Cara Menjalankan (Local Development)

1. Pastikan Anda sudah menginstal **Node.js**.
2. Buka terminal dan arahkan ke dalam folder `GrainGuard-Dashboard`.
3. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
4. Setelah selesai, jalankan server:
   ```bash
   npm run dev
   ```
5. Buka URL yang muncul di terminal (biasanya `http://localhost:5173`) di browser Anda.

## Mode Aplikasi
- **Demo Mode**: Menggunakan data simulasi untuk keperluan demonstrasi UI dan logika peringatan.
- **ESP32 Mode**: Mengambil data langsung dari endpoint ESP32 (`http://192.168.4.1/data`) untuk penggunaan hardware fisik.
