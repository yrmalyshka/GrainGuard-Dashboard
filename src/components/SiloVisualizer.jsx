import React, { useState } from 'react';
import { Lock, Unlock, Wind, Bell, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function SiloVisualizer({ 
  sensorData, 
  maxTemp, 
  isDemoMode, 
  onToggleLid 
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const isLidOpen = sensorData.lid === 'OPEN';
  const isFanOn = sensorData.fan;
  const isAlarmOn = sensorData.alarm;
  const isOverheating = sensorData.temperature >= maxTemp;

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between relative overflow-hidden">
      {/* Header Silo Info */}
      <div className="flex justify-between items-start mb-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-textPrimary">Visualisasi Silo Penyimpanan</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">Real-time Model</span>
          </div>
          <p className="text-xs text-textSecondary mt-0.5">
            Kondisi fisik ruang penyimpanan gabah & interaksi sensor
          </p>
        </div>

        {isDemoMode && (
          <button
            onClick={onToggleLid}
            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-sm ${
              isLidOpen 
                ? 'bg-error/10 text-error border-error/30 hover:bg-error/20' 
                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
            }`}
            title="Klik untuk membuka / menutup tutup wadah pada mode simulasi"
          >
            {isLidOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isLidOpen ? 'Tutup Kembali' : 'Buka Tutup'}
          </button>
        )}
      </div>

      {/* Interactive Graphic Container */}
      <div className="relative w-full h-64 bg-gradient-to-b from-slate-50 to-amber-50/40 rounded-xl border border-dashed border-border/80 flex items-center justify-center p-4 overflow-hidden">
        
        {/* Airflow Animation when Fan is Running */}
        {isFanOn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-6 opacity-60 z-20 overflow-hidden">
            <div className="w-full flex items-center gap-3 animate-pulse">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              <Wind className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="w-full flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              <Wind className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
        )}

        {/* Temperature Heat Glow if Overheating */}
        {isOverheating && (
          <div className="absolute inset-0 bg-error/5 animate-pulse pointer-events-none z-10" />
        )}

        {/* Silo Container Shape */}
        <div className="relative w-48 h-52 flex flex-col items-center">
          
          {/* Silo Lid (Interactive) */}
          <div 
            onClick={isDemoMode ? onToggleLid : undefined}
            onMouseEnter={() => setActiveTooltip('LDR')}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`w-40 h-8 rounded-t-2xl border-2 transition-all duration-500 flex items-center justify-center cursor-pointer relative z-30 shadow-md ${
              isLidOpen 
                ? '-translate-y-4 -rotate-12 bg-amber-100 border-error text-error' 
                : 'bg-primary border-primary text-surface'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isLidOpen ? <Unlock className="w-3.5 h-3.5 animate-bounce" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isLidOpen ? 'TUTUP TERBUKA' : 'TUTUP RAPAT'}</span>
            </div>

            {/* LDR Sensor Marker */}
            <span className="absolute -top-2 right-4 w-3.5 h-3.5 rounded-full bg-yellow-400 border border-white shadow flex items-center justify-center text-[9px] font-bold text-black" title="Sensor Cahaya LDR (GPIO 32)">
              L
            </span>
          </div>

          {/* Silo Body */}
          <div className="w-44 flex-1 border-x-2 border-b-2 border-primary/40 rounded-b-xl relative bg-white/80 overflow-hidden flex flex-col justify-end shadow-inner">
            
            {/* Ventilation Fan Port (Right Wall) */}
            <div 
              onMouseEnter={() => setActiveTooltip('FAN')}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`absolute top-4 -right-2 w-5 h-8 rounded-l-md border flex items-center justify-center z-30 cursor-pointer shadow-sm ${
                isFanOn ? 'bg-cyan-500 text-white border-cyan-600 animate-pulse' : 'bg-slate-200 text-slate-500 border-slate-300'
              }`}
              title="Exhaust Fan DC 5V (GPIO 27)"
            >
              <Wind className={`w-3.5 h-3.5 ${isFanOn ? 'animate-spin' : ''}`} />
            </div>

            {/* Buzzer Sound Emitter (Left Wall) */}
            <div 
              onMouseEnter={() => setActiveTooltip('BUZZER')}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`absolute top-4 -left-2 w-5 h-8 rounded-r-md border flex items-center justify-center z-30 cursor-pointer shadow-sm ${
                isAlarmOn ? 'bg-error text-white border-error animate-ping' : 'bg-slate-200 text-slate-500 border-slate-300'
              }`}
              title="Buzzer Alarm (GPIO 14)"
            >
              <Bell className="w-3.5 h-3.5" />
            </div>

            {/* DHT11 Sensor (Inside Cavity) */}
            <div 
              onMouseEnter={() => setActiveTooltip('DHT')}
              onMouseLeave={() => setActiveTooltip(null)}
              className="absolute top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white/95 rounded-lg border border-primary/30 shadow-sm flex items-center gap-1.5 z-20 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className={`w-2 h-2 rounded-full ${isOverheating ? 'bg-error animate-ping' : 'bg-success'}`} />
              <span className="text-[11px] font-bold font-mono text-textPrimary">
                {sensorData.temperature.toFixed(1)}°C | {sensorData.humidity.toFixed(0)}%
              </span>
            </div>

            {/* Grain Bed (Paddy/Rice) */}
            <div className={`w-full h-24 border-t transition-colors duration-500 relative flex flex-col justify-end p-2.5 ${
              isOverheating ? 'bg-gradient-to-t from-orange-200 to-amber-100 border-orange-300' : 'bg-gradient-to-t from-amber-200/90 to-yellow-100/80 border-amber-300'
            }`}>
              <div className="flex items-center justify-between text-[10px] font-semibold text-amber-900/80 z-10">
                <span>🌾 Timbunan Gabah</span>
                <span>Kapasitas 85%</span>
              </div>
              <div className="w-full bg-amber-900/10 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-amber-600 h-full w-[85%] rounded-full"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating Tooltip Callout */}
        {activeTooltip && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg pointer-events-none z-40 whitespace-nowrap backdrop-blur-sm">
            {activeTooltip === 'LDR' && 'Sensor LDR (GPIO 32): Mengukur intensitas cahaya untuk memvalidasi apakah tutup tertutup rapat.'}
            {activeTooltip === 'DHT' && 'Sensor DHT11 (GPIO 4): Mengukur suhu (°C) dan kelembapan relatif (%RH) ruang udara wadah.'}
            {activeTooltip === 'FAN' && 'Kipas Ventilasi (GPIO 27): Meniupkan sirkulasi udara dingin saat suhu >= ambang batas.'}
            {activeTooltip === 'BUZZER' && 'Alarm Buzzer (GPIO 14): Mengeluarkan nada peringatan 1 kHz saat terdeteksi anomali.'}
          </div>
        )}

      </div>

      {/* Footer Diagnostic Pills */}
      <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2 text-xs">
        <span className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 ${
          isLidOpen ? 'bg-error/15 text-error font-semibold' : 'bg-success/15 text-success'
        }`}>
          {isLidOpen ? <Unlock className="w-3.5 h-3.5"/> : <Lock className="w-3.5 h-3.5"/>}
          Tutup: {isLidOpen ? 'Terbuka (Warning)' : 'Tertutup Rapat'}
        </span>

        <span className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 ${
          isFanOn ? 'bg-cyan-100 text-cyan-800' : 'bg-background text-textSecondary'
        }`}>
          <Wind className={`w-3.5 h-3.5 ${isFanOn ? 'animate-spin' : ''}`} />
          Sirkulasi: {isFanOn ? 'Kipas Aktif' : 'Pasif'}
        </span>

        <span className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 ${
          isAlarmOn ? 'bg-error/15 text-error font-semibold' : 'bg-background text-textSecondary'
        }`}>
          <Bell className="w-3.5 h-3.5" />
          Alarm: {isAlarmOn ? 'Berbunyi' : 'Siaga'}
        </span>
      </div>
    </div>
  );
}
