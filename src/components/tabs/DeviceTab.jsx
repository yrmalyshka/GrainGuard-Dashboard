import React, { useState } from 'react';
import { 
  Cpu, Thermometer, Sun, Fan, Bell, Activity, 
  Wifi, Zap, CheckCircle2, AlertCircle, FileCode, Play, Power, HelpCircle 
} from 'lucide-react';

export default function DeviceTab({
  sensorData,
  connectionStatus,
  pingLatency,
  espAddress,
  isDemoMode,
  autoMode,
  onToggleFan,
  onTestEspConnection
}) {
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState(null);

  const handleRunPingTest = async () => {
    setTestingPing(true);
    const res = await onTestEspConnection();
    setPingResult(res);
    setTestingPing(false);
    setTimeout(() => setPingResult(null), 5000);
  };

  const isOnline = connectionStatus.includes('Online');

  const components = [
    {
      name: 'ESP32 DevKit V1',
      desc: 'Main Microcontroller (Dual Core 240MHz, WiFi AP/STA Web Server)',
      pin: 'SoC (Built-in)',
      status: isOnline ? 'Online (HTTP 200)' : 'Offline',
      statusColor: isOnline ? 'text-success bg-success/10' : 'text-error bg-error/10',
      icon: <Cpu className="w-5 h-5 text-primary" />
    },
    {
      name: 'Sensor DHT11',
      desc: 'Pengukuran Suhu Udara & Kelembapan Relatif (RH)',
      pin: 'GPIO 4',
      status: `${sensorData.temperature.toFixed(1)}°C / ${sensorData.humidity.toFixed(1)}%`,
      statusColor: 'text-success bg-success/10',
      icon: <Thermometer className="w-5 h-5 text-orange-500" />
    },
    {
      name: 'Sensor Cahaya LDR',
      desc: 'Deteksi Tutup Silo (Ambang Buka <= 244, Tutup >= 248)',
      pin: 'GPIO 32 (ADC1_CH4)',
      status: `${sensorData.light} ADC (${sensorData.lid === 'OPEN' ? 'Terbuka' : 'Tertutup'})`,
      statusColor: sensorData.lid === 'OPEN' ? 'text-warning bg-warning/10' : 'text-success bg-success/10',
      icon: <Sun className="w-5 h-5 text-yellow-500" />
    },
    {
      name: 'Modul Relay 1-Channel',
      desc: 'Saklar Kipas Exhaust 5V (Active LOW: LOW=ON, HIGH=OFF)',
      pin: 'GPIO 27',
      status: sensorData.fan ? 'ON (Blowing)' : 'OFF (Idle)',
      statusColor: sensorData.fan ? 'text-cyan-700 bg-cyan-100 font-bold' : 'text-slate-600 bg-slate-100',
      icon: <Fan className={`w-5 h-5 text-primary ${sensorData.fan ? 'animate-spin' : ''}`} />,
      hasAction: true
    },
    {
      name: 'Buzzer Alarm 1 kHz',
      desc: 'Peringatan Audio Frekuensi Manual (Modulasi 200ms per 1 detik)',
      pin: 'GPIO 14',
      status: sensorData.alarm ? 'Aktif (1 kHz)' : 'Siaga (Silent)',
      statusColor: sensorData.alarm ? 'text-error bg-error/15 font-bold animate-pulse' : 'text-slate-600 bg-slate-100',
      icon: <Bell className="w-5 h-5 text-error" />
    },
    {
      name: 'Layar OLED SSD1306',
      desc: 'Tampilan Display Lokal 128x64 Pixel I2C (Alamat: 0x3C)',
      pin: 'I2C (SDA 21, SCL 22)',
      status: 'Display Aktif (0x3C)',
      statusColor: 'text-success bg-success/10',
      icon: <Activity className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Diagnostics Card */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary/15 text-primary rounded-2xl">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-textPrimary">Diagnostik Perangkat Keras</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isOnline ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                {connectionStatus}
              </span>
            </div>
            <p className="text-xs text-textSecondary mt-0.5">
              Target Node: <code className="font-mono text-primary bg-background px-1.5 py-0.5 rounded">{espAddress}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-background px-4 py-2 rounded-xl border border-border text-center">
            <span className="text-[10px] text-textSecondary font-semibold uppercase block">Latency Jaringan</span>
            <span className="text-base font-bold font-mono text-textPrimary flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              {pingLatency ? `${pingLatency} ms` : '-'}
            </span>
          </div>

          <button
            onClick={handleRunPingTest}
            disabled={testingPing}
            className="px-4 py-2 bg-primary text-surface rounded-xl text-xs font-bold hover:bg-secondary transition-colors cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Wifi className="w-3.5 h-3.5" />
            {testingPing ? 'Menguji...' : 'Uji Respon ESP32'}
          </button>
        </div>
      </div>

      {pingResult && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
          pingResult.success ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'
        }`}>
          {pingResult.success ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
          <span>
            {pingResult.success 
              ? `Koneksi sukses! Waktu respon round-trip: ${pingResult.latency} ms.` 
              : `Gagal berkomunikasi dengan ESP32: ${pingResult.error}`}
          </span>
        </div>
      )}

      {/* Hardware Components Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h4 className="text-base font-bold text-textPrimary">Tabel Pemetaan Pin & Status Komponen</h4>
            <p className="text-xs text-textSecondary mt-0.5">Daftar koneksi GPIO fisik board ESP32 ke sensor & aktuator GrainGuard</p>
          </div>
          <span className="text-xs bg-background px-3 py-1 rounded-full border border-border text-textSecondary font-mono">
            GPIO Configured: 5 Pins
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-xs text-textSecondary font-semibold">
                <th className="p-4">Komponen Hardware</th>
                <th className="p-4">GPIO / Bus Pin</th>
                <th className="p-4">Deskripsi Fungsional</th>
                <th className="p-4">Status Terkini</th>
                <th className="p-4 text-right">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="text-sm text-textPrimary divide-y divide-border">
              {components.map((c, i) => (
                <tr key={i} className="hover:bg-background/40 transition-colors">
                  <td className="p-4 font-semibold flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border">
                      {c.icon}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-xs text-secondary">
                    {c.pin}
                  </td>
                  <td className="p-4 text-xs text-textSecondary max-w-xs">
                    {c.desc}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.statusColor}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.hasAction ? (
                      <button
                        onClick={onToggleFan}
                        disabled={autoMode}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                          autoMode 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : (sensorData.fan ? 'bg-primary text-white hover:bg-secondary' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')
                        }`}
                        title={autoMode ? 'Matikan Mode Otomatis terlebih dahulu' : 'Nyalakan / Matikan Kipas'}
                      >
                        {sensorData.fan ? 'Turn OFF' : 'Turn ON'}
                      </button>
                    ) : (
                      <span className="text-xs text-textSecondary font-mono">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Circuit Information Note */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-sm">Catatan Teknis Rangkaian Fisik</h5>
          <p>
            1. <strong>Sensor LDR dihubungkan ke GPIO 32 (ADC1)</strong>: ESP32 menonaktifkan saluran ADC2 saat radio WiFi diaktifkan. Penggunaan GPIO 32 menjamin pembacaan analog LDR tidak akan freeze atau bernilai nol saat mengirim data ke web.
          </p>
          <p>
            2. <strong>Relay Active LOW</strong>: Logika <code>LOW</code> memicu relay ON, dan <code>HIGH</code> mematikan relay. Hal ini telah diakomodasi sepenuhnya pada firmware dan web dashboard.
          </p>
        </div>
      </div>

    </div>
  );
}
