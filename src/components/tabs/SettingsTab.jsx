import React, { useState } from 'react';
import { 
  Settings, Sliders, Wifi, Volume2, CheckCircle2, 
  AlertCircle, HelpCircle, Save, RotateCcw 
} from 'lucide-react';

export default function SettingsTab({
  maxTemp,
  setMaxTemp,
  maxHum,
  setMaxHum,
  autoMode,
  onToggleAutoMode,
  espAddress,
  setEspAddress,
  soundEnabled,
  setSoundEnabled,
  onTestEspConnection
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    const res = await onTestEspConnection();
    setTestResult(res);
    setTesting(false);
    setTimeout(() => setTestResult(null), 5000);
  };

  const resetDefaults = () => {
    setMaxTemp(25.0);
    setMaxHum(75.0);
    setEspAddress('http://192.168.4.1');
  };

  return (
    <div className="max-w-3xl bg-surface p-8 rounded-2xl shadow-sm border border-border space-y-8">
      
      {/* Title */}
      <div className="flex justify-between items-start pb-4 border-b border-border">
        <div>
          <h3 className="text-xl font-bold text-textPrimary">Konfigurasi & Ambang Batas Sistem</h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Atur parameter otomasi kontrol histeresis kipas dan buzzer GrainGuard
          </p>
        </div>
        <button
          onClick={resetDefaults}
          className="px-3 py-1.5 rounded-lg border border-border text-xs text-textSecondary hover:text-textPrimary hover:bg-background font-medium flex items-center gap-1.5 cursor-pointer"
          title="Kembalikan ke setelan default pabrik"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Default
        </button>
      </div>

      {/* Section 1: Interactive Sliders for Environmental Thresholds */}
      <div className="space-y-6">
        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" /> Ambang Batas Sensor Lingkungan
        </h4>

        {/* Max Temperature Slider */}
        <div className="p-4 bg-background rounded-xl border border-border space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-bold text-textPrimary">Ambang Suhu Kritis (Max Temp)</label>
              <p className="text-xs text-textSecondary">Jika suhu mencapai nilai ini, kipas dan buzzer otomatis aktif.</p>
            </div>
            <div className="flex items-center gap-1 bg-surface px-3 py-1 rounded-lg border border-border shadow-sm">
              <span className="text-lg font-bold font-mono text-orange-600">{maxTemp.toFixed(1)}</span>
              <span className="text-xs font-semibold text-textSecondary">°C</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-textSecondary">18°C</span>
            <input 
              type="range"
              min="18"
              max="40"
              step="0.5"
              value={maxTemp}
              onChange={(e) => setMaxTemp(parseFloat(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <span className="text-xs font-mono text-textSecondary">40°C</span>
          </div>
        </div>

        {/* Max Humidity Slider */}
        <div className="p-4 bg-background rounded-xl border border-border space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-bold text-textPrimary">Ambang Kelembapan Kritis (Max RH)</label>
              <p className="text-xs text-textSecondary">Peringatan jamur dan kelembapan berlebih pada gabah.</p>
            </div>
            <div className="flex items-center gap-1 bg-surface px-3 py-1 rounded-lg border border-border shadow-sm">
              <span className="text-lg font-bold font-mono text-blue-600">{maxHum.toFixed(0)}</span>
              <span className="text-xs font-semibold text-textSecondary">%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-textSecondary">50%</span>
            <input 
              type="range"
              min="50"
              max="95"
              step="1"
              value={maxHum}
              onChange={(e) => setMaxHum(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <span className="text-xs font-mono text-textSecondary">95%</span>
          </div>
        </div>
      </div>

      {/* Section 2: Automation & Audio Preferences */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" /> Pengendalian Aktuator & Audio
        </h4>

        {/* Auto Mode Switch */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
          <div>
            <p className="text-sm font-bold text-textPrimary">Mode Otomatis Aktuator</p>
            <p className="text-xs text-textSecondary mt-0.5">
              Relay kipas dan alarm dikendalikan otomatis oleh logika histeresis ESP32.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={autoMode} 
              onChange={onToggleAutoMode} 
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Web Sound Alarm Switch */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-textPrimary">Bunyi Alarm pada Browser</p>
              <p className="text-xs text-textSecondary mt-0.5">
                Memutar nada beep lembut saat status penyimpanan memasuki kondisi kritis.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={soundEnabled} 
              onChange={() => setSoundEnabled(!soundEnabled)} 
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Section 3: ESP32 Hardware Endpoint Connection */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" /> Alamat Jaringan ESP32
        </h4>

        <div className="p-4 bg-background rounded-xl border border-border space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-1.5">
              URL Endpoint ESP32 (REST API)
            </label>
            <input 
              type="text" 
              value={espAddress} 
              onChange={(e) => setEspAddress(e.target.value)}
              placeholder="http://192.168.4.1"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-mono font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-textSecondary font-medium">Preset Cepat:</span>
            <button
              onClick={() => setEspAddress('http://192.168.4.1')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-border rounded text-[11px] font-mono cursor-pointer"
            >
              http://192.168.4.1 (AP Bawaan)
            </button>
            <button
              onClick={() => setEspAddress('http://192.168.1.50')}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-border rounded text-[11px] font-mono cursor-pointer"
            >
              http://192.168.1.50 (Router STA)
            </button>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-secondary text-surface text-xs font-bold rounded-lg hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5" />
              {testing ? 'Menghubungi ESP32...' : 'Uji Koneksi Endpoint'}
            </button>

            {testResult && (
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                testResult.success ? 'text-success' : 'text-error'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
                {testResult.success ? `Terhubung! Respon ${testResult.latency} ms` : `Gagal: ${testResult.error}`}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
